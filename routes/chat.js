// routes/chat.js
const express = require('express');
const chatRouter = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

chatRouter.get('/', chatController.renderChatInterface);
chatRouter.post('/start', chatController.startChatSession);
chatRouter.post('/message', chatController.sendMessage);
chatRouter.get('/history', requireAuth, chatController.getChatHistory);
chatRouter.post('/escalate', requireAuth, chatController.escalateToHuman);

module.exports = chatRouter;
