const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// GET /api/literature
// Retrieve all published literary works (available to all logged-in users)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.literatureID, l.title, l.author, l.genre,
              l.summary, l.difficulty, l.uploadedAt,
              u.username AS uploadedBy
       FROM literature l
       JOIN users u ON l.uploadedBy = u.userID
       WHERE l.status = 'Published'`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/literature/:id
// Retrieve a single literary work with full content
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM literature WHERE literatureID = ? AND status = "Published"',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Literary work not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/literature
// Admin only: upload a new literary work
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { title, author, genre, content, summary, difficulty } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO literature
         (title, author, genre, content, summary, difficulty, uploadedBy, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Published')`,
      [title, author, genre, content, summary, difficulty, req.user.userID]
    );
    res.status(201).json({
      message: 'Literary work uploaded successfully.',
      literatureID: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/literature/:id
// Admin only: update an existing literary work
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { title, author, genre, content, summary, difficulty, status } = req.body;
  try {
    await db.query(
      `UPDATE literature
       SET title=?, author=?, genre=?, content=?, summary=?, difficulty=?, status=?
       WHERE literatureID=?`,
      [title, author, genre, content, summary, difficulty, status, req.params.id]
    );
    res.json({ message: 'Literary work updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/literature/:id
// Admin only: archive (soft-delete) a literary work
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.query(
      'UPDATE literature SET status = "Archived" WHERE literatureID = ?',
      [req.params.id]
    );
    res.json({ message: 'Literary work archived successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
