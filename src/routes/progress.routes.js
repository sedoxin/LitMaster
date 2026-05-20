const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// GET /api/progress/:userID
// Retrieve a student's progress and achievement record
router.get('/:userID', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pa.*, u.username
       FROM progress_achievements pa
       JOIN users u ON pa.userID = u.userID
       WHERE pa.userID = ?`,
      [req.params.userID]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Progress record not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/progress
// Initialize a new progress record for a newly registered student
router.post('/', verifyToken, async (req, res) => {
  const { userID } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO progress_achievements
         (userID, badgesEarned, totalPoints, readingStreak, modulesCompleted)
       VALUES (?, '[]', 0, 0, 0)`,
      [userID]
    );
    res.status(201).json({
      message: 'Progress record initialized.',
      progressID: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/progress/:userID
// Update a student's points, streak, badges, or modules completed
router.put('/:userID', verifyToken, async (req, res) => {
  const { badgesEarned, totalPoints,
          readingStreak, modulesCompleted } = req.body;
  try {
    await db.query(
      `UPDATE progress_achievements
       SET badgesEarned=?, totalPoints=?, readingStreak=?,
           modulesCompleted=?, lastActivityDate=NOW()
       WHERE userID=?`,
      [JSON.stringify(badgesEarned), totalPoints,
       readingStreak, modulesCompleted, req.params.userID]
    );
    res.json({ message: 'Progress updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/progress/leaderboard/all
// Retrieve top students ranked by total points (admin analytics)
router.get('/leaderboard/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.username, pa.totalPoints, pa.readingStreak, pa.modulesCompleted
       FROM progress_achievements pa
       JOIN users u ON pa.userID = u.userID
       ORDER BY pa.totalPoints DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
