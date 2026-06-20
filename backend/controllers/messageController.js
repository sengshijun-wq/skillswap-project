// backend/controllers/messageController.js
// FR-06: In-platform messaging for matched pairs
const db = require('../config/db');

const getMessages = async (req, res) => {
  const matchId = parseInt(req.params.matchId);
  const userId  = req.user.id;

  try {
    const [matchRows] = await db.query('SELECT id, learner_id, tutor_id FROM matches WHERE id = ?', [matchId]);
    if (matchRows.length === 0) return res.status(404).json({ error: 'Match not found.' });
    const match = matchRows[0];
    if (match.learner_id !== userId && match.tutor_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this conversation.' });
    }

    const [messages] = await db.query(
      `SELECT m.id, m.sender_id, m.content, m.sent_at, m.is_read,
              u.name AS sender_name, u.avatar_initials AS sender_initials
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.match_id = ?
       ORDER BY m.sent_at ASC`,
      [matchId]
    );

    await db.query('UPDATE messages SET is_read = 1 WHERE match_id = ? AND sender_id != ?', [matchId, userId]);

    res.json({ messages });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ error: 'Failed to load messages.' });
  }
};

const sendMessage = async (req, res) => {
  const matchId  = parseInt(req.params.matchId);
  const senderId = req.user.id;
  const { content } = req.body;

  if (!content || !content.trim()) return res.status(400).json({ error: 'Message content cannot be empty.' });

  try {
    const [matchRows] = await db.query('SELECT id, learner_id, tutor_id, status FROM matches WHERE id = ?', [matchId]);
    if (matchRows.length === 0) return res.status(404).json({ error: 'Match not found.' });
    const match = matchRows[0];
    if (match.learner_id !== senderId && match.tutor_id !== senderId) {
      return res.status(403).json({ error: 'You are not part of this match.' });
    }
    if (!['pending', 'accepted', 'active'].includes(match.status)) {
      return res.status(400).json({ error: 'Cannot send messages in a completed or declined match.' });
    }

    const [result] = await db.query('INSERT INTO messages (match_id, sender_id, content) VALUES (?,?,?)', [matchId, senderId, content.trim()]);

    res.status(201).json({
      message_id: result.insertId, sender_id: senderId,
      content: content.trim(), sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

const getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT
         m.id AS match_id, m.subject, m.status,
         u_other.id   AS other_id,
         u_other.name AS other_name,
         u_other.avatar_initials AS other_initials,
         (SELECT content FROM messages WHERE match_id = m.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
         (SELECT sent_at FROM messages WHERE match_id = m.id ORDER BY sent_at DESC LIMIT 1) AS last_at,
         (SELECT COUNT(*) FROM messages WHERE match_id = m.id AND sender_id != ? AND is_read = 0) AS unread_count
       FROM matches m
       JOIN users u_other ON u_other.id = IF(m.learner_id = ?, m.tutor_id, m.learner_id)
       WHERE (m.learner_id = ? OR m.tutor_id = ?) AND m.status != 'declined'
       ORDER BY last_at DESC`,
      [userId, userId, userId, userId]
    );
    res.json({ conversations: rows });
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ error: 'Failed to load conversations.' });
  }
};

module.exports = { getMessages, sendMessage, getConversations };
