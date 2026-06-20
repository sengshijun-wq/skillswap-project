// backend/controllers/matchController.js
// FR-04: Weighted rule-based matching algorithm | FR-05: Display ranked tutors | FR-09: Match history
// Score = Subject(50) + Proficiency(20) + Schedule(20) + Interest(10) — Max 100
// Based on: Topping (2021), Vygotsky ZPD (1978), Verbert et al. (2012), Nabizadeh et al. (2020)
const db = require('../config/db');

const PROFICIENCY_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3 };

function computeScore({ learner, tutor, requestedSubject, learnerProficiency }) {
  let score = 0;
  const breakdown = { subject: 0, proficiency: 0, schedule: 0, interest: 0 };

  // Criterion 1 — Subject Compatibility (50 pts)
  const tutorTeaches = tutor.skills.filter(s => s.skill_type === 'teach');
  const subjectMatch = tutorTeaches.find(s => s.subject.toLowerCase() === requestedSubject.toLowerCase());
  if (subjectMatch) {
    score += 50;
    breakdown.subject = 50;

    // Criterion 2 — Proficiency Gap / ZPD (20 pts)
    const tutorRank   = PROFICIENCY_RANK[subjectMatch.proficiency] || 0;
    const learnerRank = PROFICIENCY_RANK[learnerProficiency] || 0;
    if (tutorRank > learnerRank) {
      score += 20;
      breakdown.proficiency = 20;
    }
  }

  // Criterion 3 — Schedule Overlap (20 pts)
  const learnerSlots = new Set(learner.availability.map(a => `${a.day}-${a.slot}`));
  const hasOverlap = tutor.availability.some(a => learnerSlots.has(`${a.day}-${a.slot}`));
  if (hasOverlap) {
    score += 20;
    breakdown.schedule = 20;
  }

  // Criterion 4 — Shared Interests (10 pts)
  const learnerInterests = new Set(learner.interests);
  const hasShared = tutor.interests.some(i => learnerInterests.has(i));
  if (hasShared) {
    score += 10;
    breakdown.interest = 10;
  }

  return { score, breakdown };
}

// GET /api/match — FR-04, FR-05
const findMatches = async (req, res) => {
  const learnerId = req.user.id;
  const { subject, learner_proficiency } = req.query;

  if (!subject || !learner_proficiency) {
    return res.status(400).json({ error: 'subject and learner_proficiency are required.' });
  }

  try {
    const [learnerAvail]   = await db.query('SELECT day, slot FROM availability WHERE user_id = ?', [learnerId]);
    const [learnerIntRows] = await db.query('SELECT interest FROM interests WHERE user_id = ?', [learnerId]);
    const learner = { availability: learnerAvail, interests: learnerIntRows.map(r => r.interest) };

    const [tutorUsers] = await db.query(
      `SELECT DISTINCT u.id, u.name, u.year_of_study, u.field_of_study, u.bio, u.avatar_initials
       FROM users u
       INNER JOIN skills s ON s.user_id = u.id AND s.skill_type = 'teach'
       WHERE u.id != ? AND u.role IN ('tutor','both')`,
      [learnerId]
    );

    const results = [];
    for (const tutor of tutorUsers) {
      const [skills]  = await db.query('SELECT subject, subject_code, skill_type, proficiency FROM skills WHERE user_id = ?', [tutor.id]);
      const [avail]   = await db.query('SELECT day, slot FROM availability WHERE user_id = ?', [tutor.id]);
      const [intRows] = await db.query('SELECT interest FROM interests WHERE user_id = ?', [tutor.id]);

      tutor.skills       = skills;
      tutor.availability = avail;
      tutor.interests    = intRows.map(r => r.interest);

      const { score, breakdown } = computeScore({ learner, tutor, requestedSubject: subject, learnerProficiency: learner_proficiency });

      if (score > 0) {
        results.push({
          tutor_id: tutor.id, name: tutor.name, year_of_study: tutor.year_of_study,
          field_of_study: tutor.field_of_study, bio: tutor.bio, avatar_initials: tutor.avatar_initials,
          teach_skills: skills.filter(s => s.skill_type === 'teach'),
          score, score_subject: breakdown.subject, score_proficiency: breakdown.proficiency,
          score_schedule: breakdown.schedule, score_interest: breakdown.interest,
        });
      }
    }

    const top5 = results.sort((a, b) => b.score - a.score).slice(0, 5);
    res.json({ matches: top5, total_candidates: tutorUsers.length });
  } catch (err) {
    console.error('findMatches error:', err);
    res.status(500).json({ error: 'Server error during matching.' });
  }
};

// POST /api/match — create request
const requestMatch = async (req, res) => {
  const learnerId = req.user.id;
  const { tutor_id, subject, score, score_subject, score_proficiency, score_schedule, score_interest } = req.body;

  if (!tutor_id || !subject) return res.status(400).json({ error: 'tutor_id and subject are required.' });

  try {
    const [existing] = await db.query(
      `SELECT id FROM matches WHERE learner_id=? AND tutor_id=? AND subject=? AND status IN ('pending','active')`,
      [learnerId, tutor_id, subject]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You already have a pending or active match with this tutor for this subject.' });
    }

    const [result] = await db.query(
      `INSERT INTO matches (learner_id, tutor_id, subject, score, score_subject, score_proficiency, score_schedule, score_interest, status)
       VALUES (?,?,?,?,?,?,?,?,'pending')`,
      [learnerId, tutor_id, subject, score || 0, score_subject || 0, score_proficiency || 0, score_schedule || 0, score_interest || 0]
    );

    res.status(201).json({ message: 'Match request sent!', match_id: result.insertId });
  } catch (err) {
    console.error('requestMatch error:', err);
    res.status(500).json({ error: 'Failed to create match request.' });
  }
};

// PATCH /api/match/:id/status
const updateMatchStatus = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const userId  = req.user.id;
  const { status } = req.body;

  const allowed = ['accepted', 'declined', 'completed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });

  try {
    const [rows] = await db.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Match not found.' });

    const match = rows[0];
    if ((status === 'accepted' || status === 'declined') && match.tutor_id !== userId) {
      return res.status(403).json({ error: 'Only the tutor can accept or decline a match request.' });
    }

    const extra = status === 'accepted' ? ', accepted_at = NOW()' : status === 'completed' ? ', completed_at = NOW()' : '';
    await db.query(`UPDATE matches SET status = ? ${extra} WHERE id = ?`, [status, matchId]);

    // Auto-set to active when accepted
    if (status === 'accepted') {
      await db.query(`UPDATE matches SET status = 'active' WHERE id = ?`, [matchId]);
    }

    res.json({ message: `Match ${status}.` });
  } catch (err) {
    console.error('updateMatchStatus error:', err);
    res.status(500).json({ error: 'Failed to update match status.' });
  }
};

// GET /api/match/history — FR-09
const getMatchHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT m.id, m.subject, m.score, m.score_subject, m.score_proficiency, m.score_schedule, m.score_interest,
              m.status, m.requested_at, m.accepted_at, m.completed_at,
              m.learner_id, m.tutor_id,
              u_learner.name AS learner_name, u_learner.avatar_initials AS learner_initials,
              u_tutor.name   AS tutor_name,   u_tutor.avatar_initials   AS tutor_initials
       FROM matches m
       JOIN users u_learner ON u_learner.id = m.learner_id
       JOIN users u_tutor   ON u_tutor.id   = m.tutor_id
       WHERE m.learner_id = ? OR m.tutor_id = ?
       ORDER BY m.requested_at DESC`,
      [userId, userId]
    );
    res.json({ matches: rows });
  } catch (err) {
    console.error('getMatchHistory error:', err);
    res.status(500).json({ error: 'Failed to load match history.' });
  }
};

module.exports = { findMatches, requestMatch, updateMatchStatus, getMatchHistory };
