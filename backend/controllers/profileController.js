// backend/controllers/profileController.js
// FR-03: Skill profile | FR-07: Availability | FR-08: Edit profile
const db = require('../config/db');

// GET /api/profile/:id
const getProfile = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, year_of_study, field_of_study, bio, avatar_initials, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const [skills] = await db.query(
      'SELECT id, subject, subject_code, skill_type, proficiency FROM skills WHERE user_id = ? ORDER BY skill_type, proficiency',
      [userId]
    );

    const [availability] = await db.query(
      'SELECT day, slot FROM availability WHERE user_id = ? ORDER BY FIELD(day,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), FIELD(slot,"Morning","Afternoon","Evening")',
      [userId]
    );

    const [interests] = await db.query('SELECT interest FROM interests WHERE user_id = ?', [userId]);

    const [statsRows] = await db.query(
      `SELECT
         COUNT(CASE WHEN status='active'    THEN 1 END) AS active_matches,
         COUNT(CASE WHEN status='completed' THEN 1 END) AS completed_matches
       FROM matches WHERE learner_id = ? OR tutor_id = ?`,
      [userId, userId]
    );

    res.json({
      ...users[0],
      skills,
      availability,
      interests: interests.map(i => i.interest),
      stats: statsRows[0],
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Server error loading profile.' });
  }
};

// PUT /api/profile — FR-08
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, bio, year_of_study, field_of_study, skills, availability, interests } = req.body;

  // Sanitize input to prevent ENUM errors
  const sanitized_year_of_study = year_of_study === '' ? null : year_of_study;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'UPDATE users SET name=?, bio=?, year_of_study=?, field_of_study=? WHERE id=?',
      [name, bio, sanitized_year_of_study, field_of_study, userId]
    );

    if (Array.isArray(skills)) {
      await conn.query('DELETE FROM skills WHERE user_id = ?', [userId]);
      for (const s of skills) {
        if (!s.subject) continue;
        await conn.query(
          'INSERT INTO skills (user_id, subject, subject_code, skill_type, proficiency) VALUES (?,?,?,?,?)',
          [userId, s.subject, s.subject_code || null, s.skill_type, s.proficiency]
        );
      }
    }

    if (Array.isArray(availability)) {
      await conn.query('DELETE FROM availability WHERE user_id = ?', [userId]);
      for (const a of availability) {
        await conn.query('INSERT INTO availability (user_id, day, slot) VALUES (?,?,?)', [userId, a.day, a.slot]);
      }
    }

    if (Array.isArray(interests)) {
      await conn.query('DELETE FROM interests WHERE user_id = ?', [userId]);
      for (const interest of interests) {
        await conn.query('INSERT INTO interests (user_id, interest) VALUES (?,?)', [userId, interest]);
      }
    }

    await conn.commit();
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    await conn.rollback();
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  } finally {
    conn.release();
  }
};

module.exports = { getProfile, updateProfile };