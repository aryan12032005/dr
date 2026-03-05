const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { protect, isAdmin, isActive } = require('../middleware/auth');

// Submit query (public)
router.post('/send_query', async (req, res) => {
  try {
    const { name, email, query } = req.body;

    if (!name || !email || !query) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await Query.create({ name, email, query });
    res.json({ message: 'Query submitted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error submitting query' });
  }
});

// Get all queries (Admin only)
router.get('/send_query', protect, isAdmin, isActive, async (req, res) => {
  try {
    const queries = await Query.find();
    res.json({ queries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete query (Admin only)
router.delete('/send_query', protect, isAdmin, isActive, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Query ID required' });
    }

    await Query.findByIdAndDelete(id);
    res.json({ message: 'Query deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting query' });
  }
});

module.exports = router;
