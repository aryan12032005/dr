const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, isAdmin, isActive } = require('../middleware/auth');

// Get departments
router.get('/get_department', async (req, res) => {
  try {
    const { dep_code } = req.query;

    if (dep_code) {
      const department = await Department.findOne({ dep_code });
      if (department) {
        return res.json({
          dep_code: department.dep_code,
          dep_name: department.dep_name,
          managers: department.managers,
          subjects: department.subjects
        });
      }
    } else {
      const departments = await Department.find().select('dep_name dep_code subjects');
      if (departments.length > 0) {
        return res.json({ departments });
      }
    }

    res.status(404).json({ message: 'No department details found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add department (Admin only)
router.post('/add_department', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { dep_code, dep_name, managers, subjects } = req.body;

    const existingDep = await Department.findOne({ dep_code });
    if (existingDep) {
      return res.status(409).json({ message: 'Department code already exists' });
    }

    await Department.create({
      dep_code,
      dep_name,
      managers: managers || [],
      subjects: subjects || {}
    });

    res.json({ message: 'Department created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating department' });
  }
});

// Delete department (Admin only)
router.delete('/delete_department', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { dep_code } = req.query;

    const existingDep = await Department.findOne({ dep_code });
    if (!existingDep) {
      return res.status(400).json({ message: 'No department to delete' });
    }

    await Department.deleteOne({ dep_code });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting department' });
  }
});

// Update department (Admin only)
router.put('/update_department', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { dep_code, dep_name, managers, subjects } = req.body;

    if (!dep_code) {
      return res.status(400).json({ message: 'Please provide dep_code' });
    }

    const existingDep = await Department.findOne({ dep_code });
    if (!existingDep) {
      return res.status(400).json({ message: 'Invalid dep_code' });
    }

    existingDep.dep_name = dep_name || existingDep.dep_name;
    if (managers) {
      existingDep.managers = typeof managers === 'string' ? JSON.parse(managers) : managers;
    }
    if (subjects) {
      existingDep.subjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
    }

    await existingDep.save();
    res.json({ message: 'Department edit successful' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid input formats' });
  }
});

module.exports = router;
