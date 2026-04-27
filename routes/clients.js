const express = require('express');
const db = require('../database/db');
const { verifyToken, requireManager } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/clients
router.get('/', (req, res) => {
  const { search, status, industry } = req.query;
  let sql = 'SELECT * FROM clients WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ? OR pan LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (industry) { sql += ' AND industry = ?'; params.push(industry); }
  sql += ' ORDER BY created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found.' });
  res.json(client);
});

// POST /api/clients
router.post('/', requireManager, (req, res) => {
  const { name, company, pan, gstin, email, phone, city, industry, services, manager, status, revenue, last_contact, dob, aadhar, address, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Client name is required.' });

  const stmt = db.prepare(`INSERT INTO clients (name,company,pan,gstin,email,phone,city,industry,services,manager,status,revenue,last_contact,dob,aadhar,address,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const info = stmt.run(name, company || null, pan || null, gstin || null, email || null, phone || null, city || null, industry || null,
    services || null, manager || null, status || 'Active', revenue || 0, last_contact || null, dob || null, aadhar || null, address || null, notes || null);

  res.status(201).json({ id: info.lastInsertRowid, message: 'Client added.' });
});

// PUT /api/clients/:id
router.put('/:id', requireManager, (req, res) => {
  const { name, company, pan, gstin, email, phone, city, industry, services, manager, status, revenue, last_contact, dob, aadhar, address, notes } = req.body;
  const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Client not found.' });

  db.prepare(`UPDATE clients SET name=?,company=?,pan=?,gstin=?,email=?,phone=?,city=?,industry=?,services=?,manager=?,status=?,revenue=?,
    last_contact=?,dob=?,aadhar=?,address=?,notes=?,updated_at=datetime('now') WHERE id=?`)
    .run(name, company, pan, gstin, email, phone, city, industry, services, manager, status, revenue, last_contact, dob, aadhar, address, notes, req.params.id);

  res.json({ message: 'Client updated.' });
});

// DELETE /api/clients/:id
router.delete('/:id', requireManager, (req, res) => {
  const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Client not found.' });
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  res.json({ message: 'Client deleted.' });
});

module.exports = router;
