const express = require('express');
const db = require('../database/db');
const { verifyToken, requireManager } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/leads
router.get('/', (req, res) => {
  const { search, source, status, priority } = req.query;
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (source) { sql += ' AND source = ?'; params.push(source); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  sql += ' ORDER BY created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/leads/:id
router.get('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json(lead);
});

// POST /api/leads
router.post('/', (req, res) => {
  const { name, company, email, phone, source, budget, status, follow_up, salesperson, service_required, notes, priority } = req.body;
  if (!name) return res.status(400).json({ error: 'Lead name is required.' });

  const info = db.prepare(`INSERT INTO leads (name,company,email,phone,source,budget,status,follow_up,salesperson,service_required,notes,priority)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(name, company || null, email || null, phone || null, source || 'Website', budget || null,
      status || 'New', follow_up || null, salesperson || null, service_required || null, notes || null, priority || 'Medium');

  res.status(201).json({ id: info.lastInsertRowid, message: 'Lead added.' });
});

// PUT /api/leads/:id
router.put('/:id', (req, res) => {
  const { name, company, email, phone, source, budget, status, follow_up, salesperson, service_required, notes, priority } = req.body;
  const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });

  db.prepare(`UPDATE leads SET name=?,company=?,email=?,phone=?,source=?,budget=?,status=?,follow_up=?,salesperson=?,
    service_required=?,notes=?,priority=?,updated_at=datetime('now') WHERE id=?`)
    .run(name, company, email, phone, source, budget, status, follow_up, salesperson, service_required, notes, priority, req.params.id);

  res.json({ message: 'Lead updated.' });
});

// DELETE /api/leads/:id
router.delete('/:id', requireManager, (req, res) => {
  const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted.' });
});

module.exports = router;
