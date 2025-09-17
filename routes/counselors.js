// routes/counselors.js
const express = require('express');
const router = express.Router();
const Counselor = require('../models/counselor');

// Create new counselor profile
router.post('/', async (req, res) => {
  try {
    const counselorData = req.body;
    
    // Validate required fields
    if (!counselorData.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const counselor = await Counselor.create(counselorData);
    
    res.status(201).json({
      success: true,
      data: counselor,
      message: 'Counselor profile created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all counselors with user details
router.get('/', async (req, res) => {
  try {
    const { verified } = req.query;
    const filter = {};
    
    if (verified !== undefined) {
      filter.is_verified = verified === 'true';
    }
    
    const counselors = await Counselor.findWithUserDetails(filter);
    
    res.json({
      success: true,
      data: counselors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available counselors
router.get('/available', async (req, res) => {
  try {
    const counselors = await Counselor.getAvailable();
    
    res.json({
      success: true,
      data: counselors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get counselor by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const counselor = await Counselor.findByUserId(userId);
    
    if (!counselor) {
      return res.status(404).json({
        success: false,
        error: 'Counselor profile not found'
      });
    }
    
    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get counselor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const counselors = await Counselor.findWithUserDetails({ id });
    
    if (!counselors || counselors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Counselor not found'
      });
    }
    
    res.json({
      success: true,
      data: counselors[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update counselor profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated via this route
    delete updateData.user_id;
    delete updateData.is_verified;
    delete updateData.rating;
    delete updateData.total_sessions;
    
    const counselor = await Counselor.updateProfile(id, updateData);
    
    res.json({
      success: true,
      data: counselor,
      message: 'Counselor profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify/unverify counselor (admin only)
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified = true } = req.body;
    
    const counselor = await Counselor.verify(id, isVerified);
    
    res.json({
      success: true,
      data: counselor,
      message: `Counselor ${isVerified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update counselor rating
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    const counselor = await Counselor.updateRating(id, rating);
    
    res.json({
      success: true,
      data: counselor,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search counselors by specialization
router.get('/search/specialization/:specialization', async (req, res) => {
  try {
    const { specialization } = req.params;
    
    const counselors = await Counselor.searchBySpecialization(specialization);
    
    res.json({
      success: true,
      data: counselors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get counselor statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await Counselor.getStats(id);
    
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

module.exports = router;
