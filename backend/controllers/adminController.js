// backend/controllers/adminController.js
// FR-10: Administrator dashboard
const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const [userStats] = await db.query(
      `SELECT
         COUNT(*) AS total_users,
         COUNT(CASE WHEN role IN ('tutor','both') THEN 1 END) AS total_tutors,
         COUNT(CASE WHEN role IN ('learner','both') THEN 1 END) AS total_learners
       FROM users WHERE role != 'admin'`
    );

    const [matchStats] = await db.query(
      `SELECT
         COUNT(*) AS total_matches,
         COUNT(CASE WHEN status = 'pending'   THEN 1 END) AS pending,
         COUNT(CASE WHEN status = 'active'    THEN 1 END) AS active,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
         COUNT(CASE WHEN status = 'declined'  THEN 1 END) AS declined,
         ROUND(AVG(score), 1) AS avg_score
       FROM matches`
    );

    const [topSubjects] = await db.query(
      `SELECT subject, COUNT(*) AS request_count FROM matches GROUP BY subject ORDER BY request_count DESC LIMIT 5`
    );

    const [msgStats] = await db.query('SELECT COUNT(*) AS total_messages FROM messages');

    const [scoreBySubject] = await db.query(
      `SELECT subject, ROUND(AVG(score),1) AS avg_score, COUNT(*) AS match_count
       FROM matches GROUP BY subject ORDER BY avg_score DESC`
    );

    res.json({
      users: userStats[0],
      matches: matchStats[0],
      top_subjects: topSubjects,
      messages: msgStats[0],
      scores_by_subject: scoreBySubject,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Failed to load admin dashboard.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.year_of_study, u.field_of_study,
              u.avatar_initials, u.created_at,
              COUNT(DISTINCT s.id) AS skill_count,
              COUNT(DISTINCT m.id) AS match_count
       FROM users u
       LEFT JOIN skills s  ON s.user_id = u.id
       LEFT JOIN matches m ON m.learner_id = u.id OR m.tutor_id = u.id
       WHERE u.role != 'admin'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ error: 'Failed to load users.' });
  }
};

const deactivateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (userId === req.user.id) return res.status(400).json({ error: 'You cannot deactivate your own admin account.' });
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [userId]);
    res.json({ message: 'User account removed successfully.' });
  } catch (err) {
    console.error('deactivateUser error:', err);
    res.status(500).json({ error: 'Failed to remove user.' });
  }
};

module.exports = { getDashboard, getAllUsers, deactivateUser };
