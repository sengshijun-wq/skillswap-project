// backend/routes/match.js
const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { findMatches, requestMatch, updateMatchStatus, getMatchHistory } = require('../controllers/matchController');

router.get('/',             authMiddleware, findMatches);
router.post('/',            authMiddleware, requestMatch);
router.get('/history',      authMiddleware, getMatchHistory);
router.patch('/:id/status', authMiddleware, updateMatchStatus);

module.exports = router;
