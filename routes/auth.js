const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sartthi_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// ─── Helpers ──────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, dept: user.dept },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    dept: user.dept,
    phone: user.phone,
    specialization: user.specialization,
  };
}

// ─── POST /api/auth/login ─────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(
    email.toLowerCase().trim()
  );
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password.' });

  res.json({ token: signToken(user), user: publicUser(user) });
});

// ─── POST /api/auth/register ─────────────────
router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword, dept, phone, specialization } = req.body;

  // ── Validation ──
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });

  if (name.trim().length < 2)
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email))
    return res.status(400).json({ error: 'Please enter a valid email address.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  if (confirmPassword && password !== confirmPassword)
    return res.status(400).json({ error: 'Passwords do not match.' });

  // ── Duplicate check ──
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing)
    return res.status(409).json({ error: 'An account with this email already exists.' });

  // ── Create user (role is always 'ca_staff' — admin must manually upgrade via Admin Panel) ──
  // Admin role can only be assigned by another admin via the User Management panel.
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    `INSERT INTO users (name, email, password_hash, role, dept, phone, specialization, join_date, active)
     VALUES (?, ?, ?, 'ca_staff', ?, ?, ?, date('now'), 1)`
  ).run(
    name.trim(),
    email.toLowerCase().trim(),
    hash,
    dept || null,
    phone || null,
    specialization || null
  );

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);

  // ── Auto-create welcome notification ──
  db.prepare(`INSERT INTO notifications (text, time_ago, is_unread) VALUES (?, ?, 1)`)
    .run(`New user registered: ${name.trim()} — please review their role.`, 'Just now');

  res.status(201).json({ token: signToken(newUser), user: publicUser(newUser) });
});

// ─── POST /api/auth/logout ────────────────────
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me ─────────────────────────
const { verifyToken } = require('../middleware/auth');
router.get('/me', verifyToken, (req, res) => {
  const user = db.prepare(
    'SELECT id,name,email,role,dept,phone,specialization,join_date,active FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

module.exports = router;
