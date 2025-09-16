// routes/resources.js
const express = require('express');
const resourceRouter = express.Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/auth');

resourceRouter.get('/', resourceController.listResources);
resourceRouter.get('/videos', resourceController.listVideos);
resourceRouter.get('/audio', resourceController.listAudio);
resourceRouter.get('/guides', resourceController.listGuides);
resourceRouter.get('/:id', resourceController.getResource);
resourceRouter.post('/:id/like', requireAuth, resourceController.likeResource);
resourceRouter.post('/:id/rate', requireAuth, resourceController.rateResource);

module.exports = resourceRouter;
