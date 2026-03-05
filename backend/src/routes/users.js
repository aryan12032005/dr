const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect, isAdmin, isAdminOrFaculty, isActive } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Get total details (Admin only)
router.get('/total_details', protect, isAdmin, isActive, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const Document = require('../models/Document');
    const totalDocs = await Document.countDocuments();

    res.json({
      total_users: totalUsers,
      total_docs: totalDocs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search_user', protect, isAdminOrFaculty, isActive, async (req, res) => {
  try {
    const { querry, user_id, is_admin, is_faculty, is_allowed, dep_code, start_c, end_c } = req.query;
    
    let filter = {};
    let selectFields = 'email dep_code first_name username phone_number is_allowed is_faculty';

    if (req.user.is_faculty && !req.user.is_admin) {
      filter.is_allowed = true;
      selectFields = 'dep_code first_name username';
    }

    if (user_id) filter._id = user_id;
    if (is_admin) filter.is_admin = is_admin.toLowerCase() === 'true';
    if (is_faculty) filter.is_faculty = is_faculty.toLowerCase() === 'true';
    if (is_allowed) filter.is_allowed = is_allowed.toLowerCase() === 'true';
    if (dep_code) filter.dep_code = dep_code;

    if (querry) {
      const searchQuery = querry.trim();
      filter.$or = [
        { first_name: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { phone_number: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const startIndex = parseInt(start_c) || 0;
    const endIndex = parseInt(end_c) || 10;

    const users = await User.find(filter)
      .select(selectFields)
      .skip(startIndex)
      .limit(endIndex - startIndex);

    const userCount = await User.countDocuments({ is_admin: false });

    res.json({
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        dep_code: u.dep_code,
        first_name: u.first_name,
        username: u.username,
        phone_number: u.phone_number,
        is_allowed: u.is_allowed,
        is_faculty: u.is_faculty
      })),
      user_count: userCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit user (Admin only, or self update for limited fields)
router.post('/edit_user', protect, isActive, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // If not admin, can only update own profile with limited fields
    if (!req.user.is_admin) {
      if (req.user._id.toString() !== id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this user' });
      }
      // Faculty can only update these fields for themselves
      const allowedFields = ['first_name', 'last_name', 'phone_number'];
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && key !== 'password') {
          user[key] = updateData[key];
        }
      });
    } else {
      // Admin can update all fields except password
      Object.keys(updateData).forEach(key => {
        if (key !== 'password') {
          user[key] = updateData[key];
        }
      });
    }

    await user.save();
    res.json({ message: 'User updated' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating user' });
  }
});

// Change password (Admin only)
router.put('/change_password', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { id, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password update successful' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating password' });
  }
});

// Delete user (Admin only)
router.delete('/delete_user', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    await User.deleteOne({ username });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting user' });
  }
});

// Get sample CSV template
router.get('/get_sample_csv', protect, isAdmin, async (req, res) => {
  try {
    const sampleCsv = 'email,username,password,first_name,last_name,phone_number\njohn@example.com,johndoe,password123,John,Doe,1234567890';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_template.csv"');
    res.send(sampleCsv);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'File not found' });
  }
});

// Upload CSV for bulk user creation
router.post('/upload_csv', protect, isAdmin, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const { is_faculty, dep_code } = req.body;
    const results = [];
    const existingUsers = [];

    const stream = Readable.from(req.file.buffer.toString());
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of results) {
      const userData = {
        email: row.email,
        username: row.username,
        password: row.password,
        first_name: row.first_name,
        last_name: row.last_name,
        phone_number: row.phone_number || '',
        is_faculty: is_faculty === 'true',
        is_admin: false,
        is_allowed: true,
        dep_code: dep_code || ''
      };

      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (existingUser) {
        existingUsers.push(userData.username);
      } else {
        try {
          await User.create(userData);
        } catch (err) {
          existingUsers.push(userData.username);
        }
      }
    }

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Existing or Invalid users',
        users: existingUsers
      });
    }

    res.json({ message: 'Users created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to add users' });
  }
});

module.exports = router;
