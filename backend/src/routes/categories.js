const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, isAdmin, isActive } = require('../middleware/auth');

// Get categories
router.get('/get_categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add category (Admin only)
router.post('/add_category', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    const existingCategory = await Category.findOne({ code });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this code already exists' });
    }

    await Category.create({ name, code });
    res.json({ message: 'New category created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Category creation failed' });
  }
});

// Update category (Admin only)
router.put('/update_category', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Please provide a new name' });
    }

    const existingCategory = await Category.findOne({ code });
    if (!existingCategory) {
      return res.status(400).json({ message: 'No category to update' });
    }

    existingCategory.name = name;
    await existingCategory.save();

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating category' });
  }
});

// Delete category (Admin only)
router.delete('/delete_category', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'No category code' });
    }

    const category = await Category.findOneAndDelete({ code });
    if (category) {
      return res.json({ message: 'Category deleted successfully' });
    }

    res.status(400).json({ message: 'No category found to be deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting category' });
  }
});

module.exports = router;
