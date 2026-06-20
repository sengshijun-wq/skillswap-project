// backend/controllers/authController.js
// FR-01: Register | FR-02: Login with JWT
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, year_of_study, field_of_study } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // bcrypt cost factor 10 — NFR-02
    const password_hash = await bcrypt.hash(password, 10);

    const parts = name.trim().split(' ');
    const avatar_initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, year_of_study, field_of_study, avatar_initials) VALUES (?,?,?,?,?,?,?)',
      [name, email, password_hash, 'both', year_of_study || null, field_of_study || null, avatar_initials]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: 'both', name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: result.insertId, name, email, role: 'both', avatar_initials },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, year_of_study, field_of_study, avatar_initials FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, year_of_study: user.year_of_study,
        field_of_study: user.field_of_study, avatar_initials: user.avatar_initials,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

module.exports = { register, login };