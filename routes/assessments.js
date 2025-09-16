// routes/assessments.js
const express = require('express');
const assessmentRouter = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { requireAuth } = require('../middleware/auth');

assessmentRouter.use(requireAuth);

assessmentRouter.get('/', assessmentController.listAssessments);
assessmentRouter.get('/phq9', assessmentController.renderPHQ9);
assessmentRouter.post('/phq9', assessmentController.submitPHQ9);
assessmentRouter.get('/gad7', assessmentController.renderGAD7);
assessmentRouter.post('/gad7', assessmentController.submitGAD7);
assessmentRouter.get('/ghq', assessmentController.renderGHQ);
assessmentRouter.post('/ghq', assessmentController.submitGHQ);
assessmentRouter.get('/results/:id', assessmentController.getResults);

module.exports = assessmentRouter;