// routes/database.js
const express = require('express');
const router = express.Router();
const DatabaseManager = require('../utils/database');

// Initialize database
router.post('/init', async (req, res) => {
  try {
    const result = await DatabaseManager.initializeDatabase();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test database connection
router.get('/test', async (req, res) => {
  try {
    const result = await DatabaseManager.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await DatabaseManager.getDatabaseStats();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.stats
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Backup database data
router.get('/backup', async (req, res) => {
  try {
    const result = await DatabaseManager.backupData();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.backup,
        message: 'Database backup created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clean up old data
router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const result = await DatabaseManager.cleanupOldData(parseInt(days));
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
