// routes/mood.js
const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/moodEntry');

// Create new mood entry
router.post('/', async (req, res) => {
  try {
    const moodData = req.body;
    
    // Validate required fields
    if (!moodData.userId || !moodData.moodLevel) {
      return res.status(400).json({
        success: false,
        error: 'User ID and mood level are required'
      });
    }
    
    // Validate mood level range
    if (moodData.moodLevel < 1 || moodData.moodLevel > 10) {
      return res.status(400).json({
        success: false,
        error: 'Mood level must be between 1 and 10'
      });
    }
    
    const moodEntry = await MoodEntry.create(moodData);
    
    res.status(201).json({
      success: true,
      data: moodEntry,
      message: 'Mood entry created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get mood entries for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30 } = req.query;
    
    const moodEntries = await MoodEntry.findByUserId(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: moodEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get mood entries for date range
router.get('/user/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const moodEntries = await MoodEntry.findByDateRange(userId, startDate, endDate);
    
    res.json({
      success: true,
      data: moodEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get mood statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const stats = await MoodEntry.getMoodStats(userId, parseInt(days));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get mood entry for specific date
router.get('/user/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    
    const moodEntry = await MoodEntry.findByDate(userId, date);
    
    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        error: 'No mood entry found for this date'
      });
    }
    
    res.json({
      success: true,
      data: moodEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get common emotions for a user
router.get('/user/:userId/emotions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const emotions = await MoodEntry.getCommonEmotions(userId, parseInt(days));
    
    res.json({
      success: true,
      data: emotions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update mood entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate mood level if provided
    if (updateData.moodLevel && (updateData.moodLevel < 1 || updateData.moodLevel > 10)) {
      return res.status(400).json({
        success: false,
        error: 'Mood level must be between 1 and 10'
      });
    }
    
    const moodEntry = await MoodEntry.update(id, updateData);
    
    res.json({
      success: true,
      data: moodEntry,
      message: 'Mood entry updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete mood entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const moodEntry = await MoodEntry.delete(id);
    
    res.json({
      success: true,
      data: moodEntry,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
