// backend/routes/admin.js
const express = require('express');
const router  = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { getDashboard, getAllUsers, deactivateUser } = require('../controllers/adminController');

router.get('/dashboard',    authMiddleware, adminOnly, getDashboard);
router.get('/users',        authMiddleware, adminOnly, getAllUsers);
router.delete('/users/:id', authMiddleware, adminOnly, deactivateUser);

module.exports = router;
