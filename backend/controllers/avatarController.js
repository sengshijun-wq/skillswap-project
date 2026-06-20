// backend/controllers/avatarController.js
const db = require('../config/db');

// POST /api/avatar/upload
const uploadAvatar = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Construct the URL path for the uploaded file
    // e.g., http://localhost:5000/uploads/user-9-1629876543210.png
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Update the user's avatar_url in the database
    await db.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, req.user.id]
    );

    res.json({
      message: 'Avatar uploaded successfully!',
      avatarUrl: avatarUrl
    });

  } catch (err) {
    console.error('Avatar upload error:', err);
    // Multer might throw an error (e.g., file too large)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Maximum is 2MB.' });
    }
    res.status(500).json({ error: 'Server error during avatar upload.' });
  }
};

module.exports = { uploadAvatar };