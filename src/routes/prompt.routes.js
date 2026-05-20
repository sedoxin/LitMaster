const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// GET /api/prompts
// Retrieve all active writing prompts (students and admins)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.promptID, p.promptTitle, p.promptDescription,
              p.genre, p.difficulty, u.username AS createdBy
       FROM writing_prompts p
       JOIN users u ON p.adminID = u.userID
       WHERE p.status = 'Active'`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/prompts/:id
// Retrieve a single writing prompt by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM writing_prompts WHERE promptID = ?', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Writing prompt not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/prompts
// Admin only: create a new writing prompt
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { promptTitle, promptDescription, genre, difficulty } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO writing_prompts
         (adminID, promptTitle, promptDescription, genre, difficulty, status)
       VALUES (?, ?, ?, ?, ?, 'Active')`,
      [req.user.userID, promptTitle, promptDescription, genre, difficulty]
    );
    res.status(201).json({
      message: 'Writing prompt created successfully.',
      promptID: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/prompts/:id
// Admin only: update an existing writing prompt
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { promptTitle, promptDescription, genre, difficulty, status } = req.body;
  try {
    await db.query(
      `UPDATE writing_prompts
       SET promptTitle=?, promptDescription=?, genre=?, difficulty=?, status=?
       WHERE promptID=?`,
      [promptTitle, promptDescription, genre, difficulty, status, req.params.id]
    );
    res.json({ message: 'Writing prompt updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/prompts/:id
// Admin only: archive a writing prompt
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.query(
      'UPDATE writing_prompts SET status = "Archived" WHERE promptID = ?',
      [req.params.id]
    );
    res.json({ message: 'Writing prompt archived successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
