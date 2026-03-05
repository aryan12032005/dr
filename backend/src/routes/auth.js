const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, isAdmin, isActive, generateToken, generateRefreshToken } = require('../middleware/auth');

// Store blacklisted tokens (in production, use Redis or database)
const blacklistedTokens = new Set();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or username' });
    }

    if (!user.is_allowed) {
      return res.status(401).json({ message: 'User is not allowed' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin,
        is_faculty: user.is_faculty,
        dep_code: user.dep_code
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup (Admin only)
router.post('/signup', protect, isAdmin, async (req, res) => {
  try {
    const { email, username, password, first_name, last_name, phone_number, is_faculty, is_admin, is_allowed, dep_code } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const user = await User.create({
      email,
      username,
      password,
      first_name,
      last_name,
      phone_number: phone_number || '',
      is_faculty: is_faculty || false,
      is_admin: is_admin || false,
      is_allowed: is_allowed !== undefined ? is_allowed : true,
      dep_code: dep_code || ''
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// Logout
router.post('/logout', protect, async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (refresh_token) {
      blacklistedTokens.add(refresh_token);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid request' });
  }
});

// Refresh token
router.post('/refresh_token', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: 'No refresh token found' });
    }

    if (blacklistedTokens.has(refresh_token)) {
      return res.status(400).json({ message: 'Token has been blacklisted' });
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Blacklist old token
    blacklistedTokens.add(refresh_token);

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// Get CSRF token (not needed in Node.js with JWT, but included for compatibility)
router.get('/get_csrf', (req, res) => {
  res.json({ csrf_token: 'not-required-with-jwt' });
});

// Get user type
router.get('/get_user_type', protect, isActive, async (req, res) => {
  try {
    res.json({
      is_admin: req.user.is_admin,
      is_faculty: req.user.is_faculty,
      user_id: req.user._id
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error getting user type' });
  }
});

// Change user type (Admin only)
router.post('/change_user_type', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { new_details } = req.body;

    const user = await User.findById(new_details.id);
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    user.is_admin = new_details.is_admin;
    user.is_faculty = new_details.is_faculty;
    user.is_allowed = new_details.is_allowed;
    await user.save();

    res.json({ message: 'User details changed' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
