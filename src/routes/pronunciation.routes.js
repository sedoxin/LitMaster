const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /api/pronunciation/:userID
// Retrieve all pronunciation sessions for a specific student
router.get('/:userID', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ps.sessionID, l.title AS literatureTitle,
              ps.feedbackScore, ps.feedbackNotes, ps.sessionDate
       FROM pronunciation_sessions ps
       JOIN literature l ON ps.literatureID = l.literatureID
       WHERE ps.userID = ?
       ORDER BY ps.sessionDate DESC`,
      [req.params.userID]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/pronunciation
// Record a new pronunciation practice session for a student
router.post('/', verifyToken, async (req, res) => {
  const { userID, literatureID, audioRecording,
          feedbackScore, feedbackNotes } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO pronunciation_sessions
         (userID, literatureID, audioRecording, feedbackScore, feedbackNotes)
       VALUES (?, ?, ?, ?, ?)`,
      [userID, literatureID, audioRecording, feedbackScore, feedbackNotes]
    );
    res.status(201).json({
      message: 'Pronunciation session recorded successfully.',
      sessionID: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/pronunciation/session/:sessionID
// Retrieve a specific pronunciation session by session ID
router.get('/session/:sessionID', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ps.*, l.title AS literatureTitle, u.username
       FROM pronunciation_sessions ps
       JOIN literature l ON ps.literatureID = l.literatureID
       JOIN users u ON ps.userID = u.userID
       WHERE ps.sessionID = ?`,
      [req.params.sessionID]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
