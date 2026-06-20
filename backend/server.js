// backend/server.js — SkillSwap REST API entry point
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes    = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const matchRoutes   = require('./routes/match');
const msgRoutes     = require('./routes/messages');
const adminRoutes   = require('./routes/admin');
const avatarRoutes  = require('./routes/avatar');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// Static folder for uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',     authRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/match',    matchRoutes);
app.use('/api/messages', msgRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/avatar',   avatarRoutes);

app.get('/api/health', async (req, res) => {
  const db = require('./config/db');
  try {
    await db.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected', project: 'SkillSwap', author: 'Seng Shi Jun TP070062' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'FAILED', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  Backend: http://localhost:${PORT}`);
  console.log(`    DB test: http://localhost:${PORT}/api/health\n`);
});