const express = require('express');
const db = require('../database/db');
const { verifyToken, requireManager } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/compliance
router.get('/', (req, res) => {
  const { search, type, status, assigned_to } = req.query;
  let sql = 'SELECT * FROM compliance WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR client LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (assigned_to) { sql += ' AND assigned_to = ?'; params.push(assigned_to); }
  sql += ' ORDER BY due_date ASC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/compliance/:id
router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM compliance WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Compliance record not found.' });
  res.json(item);
});

// POST /api/compliance
router.post('/', (req, res) => {
  const { name, type, client, period, due_date, assigned_to, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  const info = db.prepare(`INSERT INTO compliance (name,type,client,period,due_date,assigned_to,status)
    VALUES (?,?,?,?,?,?,?)`)
    .run(name, type || 'GST', client || null, period || null, due_date || null, assigned_to || null, status || 'Pending');

  res.status(201).json({ id: info.lastInsertRowid, message: 'Compliance record added.' });
});

// PUT /api/compliance/:id
router.put('/:id', (req, res) => {
  const { name, type, client, period, due_date, assigned_to, status } = req.body;
  const existing = db.prepare('SELECT id FROM compliance WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Compliance record not found.' });

  db.prepare(`UPDATE compliance SET name=?,type=?,client=?,period=?,due_date=?,assigned_to=?,status=?,updated_at=datetime('now') WHERE id=?`)
    .run(name, type, client, period, due_date, assigned_to, status, req.params.id);

  res.json({ message: 'Compliance record updated.' });
});

// DELETE /api/compliance/:id
router.delete('/:id', requireManager, (req, res) => {
  const existing = db.prepare('SELECT id FROM compliance WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Compliance record not found.' });
  db.prepare('DELETE FROM compliance WHERE id = ?').run(req.params.id);
  res.json({ message: 'Compliance record deleted.' });
});

module.exports = router;
