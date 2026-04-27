const express = require('express');
const db = require('../database/db');
const { verifyToken, requireManager } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/matters
router.get('/', (req, res) => {
  const { search, type, stage, advocate } = req.query;
  let sql = 'SELECT * FROM matters WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR client LIKE ? OR case_no LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (stage) { sql += ' AND stage = ?'; params.push(stage); }
  if (advocate) { sql += ' AND advocate = ?'; params.push(advocate); }
  sql += ' ORDER BY next_hearing ASC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/matters/:id
router.get('/:id', (req, res) => {
  const matter = db.prepare('SELECT * FROM matters WHERE id = ?').get(req.params.id);
  if (!matter) return res.status(404).json({ error: 'Matter not found.' });
  res.json(matter);
});

// POST /api/matters
router.post('/', (req, res) => {
  const { title, client, type, court, case_no, advocate, stage, next_hearing, retainer_amount, priority, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Matter title is required.' });

  const info = db.prepare(`INSERT INTO matters (title,client,type,court,case_no,advocate,stage,next_hearing,retainer_amount,priority,description)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(title, client || null, type || null, court || null, case_no || null, advocate || null,
      stage || 'Inquiry', next_hearing || null, retainer_amount || null, priority || 'Medium', description || null);

  res.status(201).json({ id: info.lastInsertRowid, message: 'Matter created.' });
});

// PUT /api/matters/:id
router.put('/:id', (req, res) => {
  const { title, client, type, court, case_no, advocate, stage, next_hearing, retainer_amount, priority, description } = req.body;
  const existing = db.prepare('SELECT id FROM matters WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Matter not found.' });

  db.prepare(`UPDATE matters SET title=?,client=?,type=?,court=?,case_no=?,advocate=?,stage=?,next_hearing=?,
    retainer_amount=?,priority=?,description=?,updated_at=datetime('now') WHERE id=?`)
    .run(title, client, type, court, case_no, advocate, stage, next_hearing, retainer_amount, priority, description, req.params.id);

  res.json({ message: 'Matter updated.' });
});

// DELETE /api/matters/:id
router.delete('/:id', requireManager, (req, res) => {
  const existing = db.prepare('SELECT id FROM matters WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Matter not found.' });
  db.prepare('DELETE FROM matters WHERE id = ?').run(req.params.id);
  res.json({ message: 'Matter deleted.' });
});

module.exports = router;
