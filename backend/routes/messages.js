// backend/routes/messages.js
const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');

router.get('/conversations', authMiddleware, getConversations);
router.get('/:matchId',      authMiddleware, getMessages);
router.post('/:matchId',     authMiddleware, sendMessage);

module.exports = router;
