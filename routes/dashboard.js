// routes/dashboard.js
const express = require('express');
const dashboardRouter = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

dashboardRouter.use(requireAuth);

dashboardRouter.get('/', dashboardController.renderDashboard);
dashboardRouter.get('/student', dashboardController.renderStudentDashboard);
dashboardRouter.get('/counselor', dashboardController.renderCounselorDashboard);
dashboardRouter.get('/admin', dashboardController.renderAdminDashboard);

module.exports = dashboardRouter;
