const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/activities
router.get('/', (req, res) => {
  const { client, type, logged_by } = req.query;
  let sql = 'SELECT * FROM activities WHERE 1=1';
  const params = [];

  if (client) { sql += ' AND client = ?'; params.push(client); }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (logged_by) { sql += ' AND logged_by = ?'; params.push(logged_by); }
  sql += ' ORDER BY activity_datetime DESC';

  res.json(db.prepare(sql).all(...params));
});

// POST /api/activities
router.post('/', (req, res) => {
  const { type, client, logged_by, notes, activity_datetime, duration } = req.body;
  if (!client || !notes) return res.status(400).json({ error: 'Client and notes are required.' });

  const info = db.prepare(`INSERT INTO activities (type,client,logged_by,notes,activity_datetime,duration)
    VALUES (?,?,?,?,?,?)`)
    .run(type || 'call', client, logged_by || null, notes, activity_datetime || new Date().toISOString(), duration || null);

  res.status(201).json({ id: info.lastInsertRowid, message: 'Activity logged.' });
});

// DELETE /api/activities/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Activity not found.' });
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ message: 'Activity deleted.' });
});

module.exports = router;
