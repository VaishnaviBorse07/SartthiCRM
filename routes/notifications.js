const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/notifications  — for logged-in user (or all if admin)
router.get('/', (req, res) => {
  let rows;
  if (req.user.role === 'admin') {
    rows = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
  } else {
    rows = db.prepare('SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC LIMIT 20')
      .all(req.user.id);
  }
  res.json(rows);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET is_unread=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Marked as read.' });
});

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', (req, res) => {
  db.prepare('UPDATE notifications SET is_unread=0').run();
  res.json({ message: 'All notifications marked as read.' });
});

// POST /api/notifications  — create system notification (admin)
router.post('/', (req, res) => {
  const { text, time_ago, user_id } = req.body;
  if (!text) return res.status(400).json({ error: 'Notification text is required.' });
  const info = db.prepare('INSERT INTO notifications (text,time_ago,user_id) VALUES (?,?,?)')
    .run(text, time_ago || 'Just now', user_id || null);
  res.status(201).json({ id: info.lastInsertRowid, message: 'Notification created.' });
});

module.exports = router;
