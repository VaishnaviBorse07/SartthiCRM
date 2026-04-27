const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/users  — admin sees all, others see only active
router.get('/', (req, res) => {
  if (req.user.role === 'admin') {
    res.json(db.prepare('SELECT id,name,email,role,dept,phone,specialization,join_date,active,created_at FROM users ORDER BY name').all());
  } else {
    res.json(db.prepare('SELECT id,name,email,role,dept,phone,specialization FROM users WHERE active=1 ORDER BY name').all());
  }
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id,name,email,role,dept,phone,specialization,join_date,active,created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// POST /api/users  — admin only
router.post('/', requireAdmin, (req, res) => {
  const { name, email, password, role, dept, phone, specialization, join_date } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) return res.status(409).json({ error: 'Email already in use.' });

  const validRoles = ['admin', 'manager', 'ca_staff', 'advocate'];
  const safeRole = validRoles.includes(role) ? role : 'ca_staff';

  // Enforce single-admin rule
  if (safeRole === 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
    if (adminCount.c >= 1) {
      return res.status(400).json({ error: 'Only one admin account is allowed. Please assign a different role.' });
    }
  }

  const hash = bcrypt.hashSync(password, 10);

  const info = db.prepare(`INSERT INTO users (name,email,password_hash,role,dept,phone,specialization,join_date)
    VALUES (?,?,?,?,?,?,?,?)`)
    .run(name, email.toLowerCase().trim(), hash, safeRole, dept || null, phone || null, specialization || null, join_date || null);

  res.status(201).json({ id: info.lastInsertRowid, message: 'User created.' });
});

// PUT /api/users/:id  — admin only (update profile, optionally reset password)
router.put('/:id', requireAdmin, (req, res) => {
  const { name, email, role, dept, phone, specialization, join_date, active, new_password } = req.body;
  const existing = db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'User not found.' });

  const validRoles = ['admin', 'manager', 'ca_staff', 'advocate'];
  const safeRole = validRoles.includes(role) ? role : 'ca_staff';

  // Enforce single-admin rule: can't promote another user to admin if one already exists
  if (safeRole === 'admin' && existing.role !== 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
    if (adminCount.c >= 1) {
      return res.status(400).json({ error: 'Only one admin account is allowed. Demote the current admin first.' });
    }
  }

  // Prevent removing admin role from themselves (must keep at least 1 admin)
  if (parseInt(req.params.id) === req.user.id && safeRole !== 'admin') {
    return res.status(400).json({ error: 'You cannot remove your own admin role.' });
  }

  db.prepare(`UPDATE users SET name=?,email=?,role=?,dept=?,phone=?,specialization=?,join_date=?,active=? WHERE id=?`)
    .run(name, email, safeRole, dept, phone, specialization, join_date, active !== undefined ? (active ? 1 : 0) : 1, req.params.id);

  if (new_password) {
    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, req.params.id);
  }

  res.json({ message: 'User updated.' });
});

// PATCH /api/users/:id/toggle  — admin only activate/deactivate
router.patch('/:id/toggle', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id, active FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const newActive = user.active ? 0 : 1;
  db.prepare('UPDATE users SET active=? WHERE id=?').run(newActive, req.params.id);
  res.json({ message: newActive ? 'User activated.' : 'User deactivated.', active: newActive });
});

// DELETE /api/users/:id  — admin only, cannot delete self
router.delete('/:id', requireAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'User not found.' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted.' });
});

module.exports = router;
