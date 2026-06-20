// backend/routes/avatar.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadAvatar } = require('../controllers/avatarController'); // Correct: Destructure the function

// @route   POST /api/avatar/upload
// @desc    Upload user avatar
// @access  Private
router.post(
  '/upload',
  authMiddleware, // Correct: Pass the authMiddleware function
  upload.single('avatar'),
  uploadAvatar // Correct: Pass the function directly
);

module.exports = router;