// routes/admin.js
const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

adminRouter.get('/dashboard', adminController.renderDashboard);
adminRouter.get('/analytics', adminController.getAnalytics);
adminRouter.get('/users', adminController.listUsers);
adminRouter.get('/reports', adminController.getReports);
adminRouter.get('/moderation', adminController.getModerationQueue);
adminRouter.post('/moderate/:type/:id', adminController.moderateContent);

module.exports = adminRouter;