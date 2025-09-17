// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Create new notification
router.post('/', async (req, res) => {
  try {
    const notificationData = req.body;
    
    // Validate required fields
    if (!notificationData.userId || !notificationData.title || !notificationData.message) {
      return res.status(400).json({
        success: false,
        error: 'User ID, title, and message are required'
      });
    }
    
    const notification = await Notification.create(notificationData);
    
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const notifications = await Notification.findByUserId(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread notifications for a user
router.get('/user/:userId/unread', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await Notification.getUnreadByUserId(userId);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread notification count for a user
router.get('/user/:userId/unread/count', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await Notification.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.markAsRead(id);
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await Notification.markAllAsRead(userId);
    
    res.json({
      success: true,
      data: notifications,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.delete(id);
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send notification to all users with specific role
router.post('/broadcast/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const notificationData = req.body;
    
    // Validate required fields
    if (!notificationData.title || !notificationData.message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }
    
    const notifications = await Notification.sendToRole(role, notificationData);
    
    res.status(201).json({
      success: true,
      data: notifications,
      message: `Notification sent to all ${role}s`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create bulk notifications
router.post('/bulk', async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Notifications array is required'
      });
    }
    
    // Validate each notification
    for (const notification of notifications) {
      if (!notification.user_id || !notification.title || !notification.message) {
        return res.status(400).json({
          success: false,
          error: 'Each notification must have user_id, title, and message'
        });
      }
    }
    
    const createdNotifications = await Notification.createBulk(notifications);
    
    res.status(201).json({
      success: true,
      data: createdNotifications,
      message: 'Bulk notifications created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get notifications by type for a user
router.get('/user/:userId/type/:type', async (req, res) => {
  try {
    const { userId, type } = req.params;
    
    const notifications = await Notification.findByType(userId, type);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clean up expired notifications (admin route)
router.delete('/cleanup/expired', async (req, res) => {
  try {
    const deletedNotifications = await Notification.cleanupExpired();
    
    res.json({
      success: true,
      data: deletedNotifications,
      message: `${deletedNotifications.length} expired notifications cleaned up`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
