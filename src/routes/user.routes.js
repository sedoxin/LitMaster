const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// GET /api/users
// Admin only: retrieve all registered users
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT userID, username, email, userType, createdAt, status FROM users'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/users/:id
// Retrieve a single user's profile by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT userID, username, email, userType, profilePicture, createdAt, status FROM users WHERE userID = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/users/:id
// Update a user's profile information
router.put('/:id', verifyToken, async (req, res) => {
  const { username, profilePicture } = req.body;
  try {
    await db.query(
      'UPDATE users SET username = ?, profilePicture = ? WHERE userID = ?',
      [username, profilePicture, req.params.id]
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/users/:id
// Admin only: deactivate a user account
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.query(
      'UPDATE users SET status = "Inactive" WHERE userID = ?',
      [req.params.id]
    );
    res.json({ message: 'User deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
