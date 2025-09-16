// routes/forum.js
const express = require('express');
const forumRouter = express.Router();
const forumController = require('../controllers/forumController');
const { requireAuth } = require('../middleware/auth');

forumRouter.get('/', forumController.listPosts);
forumRouter.get('/create', requireAuth, forumController.renderCreatePost);
forumRouter.post('/create', requireAuth, forumController.createPost);
forumRouter.get('/:id', forumController.getPost);
forumRouter.post('/:id/reply', requireAuth, forumController.replyToPost);
forumRouter.post('/:id/like', requireAuth, forumController.likePost);
forumRouter.post('/:id/report', requireAuth, forumController.reportPost);

module.exports = forumRouter;