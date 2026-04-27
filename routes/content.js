const express = require('express');
const db = require('../database/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/content  — returns all content settings as key-value map
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT setting_key, setting_value FROM content_settings').all();
  const map = {};
  rows.forEach(r => { map[r.setting_key] = r.setting_value; });
  res.json(map);
});

// GET /api/content/:key
router.get('/:key', (req, res) => {
  const row = db.prepare('SELECT * FROM content_settings WHERE setting_key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'Setting not found.' });
  res.json(row);
});

// PUT /api/content/:key  — admin only, upsert a setting
router.put('/:key', requireAdmin, (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'value is required.' });

  db.prepare(`INSERT INTO content_settings (setting_key, setting_value, updated_by, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value, updated_by=excluded.updated_by, updated_at=excluded.updated_at`)
    .run(req.params.key, String(value), req.user.id);

  res.json({ message: 'Setting updated.', key: req.params.key, value });
});

// PUT /api/content  — admin only, bulk update multiple settings
router.put('/', requireAdmin, (req, res) => {
  const settings = req.body; // { key: value, ... }
  if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Body must be a key-value object.' });

  const stmt = db.prepare(`INSERT INTO content_settings (setting_key, setting_value, updated_by, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value, updated_by=excluded.updated_by, updated_at=excluded.updated_at`);

  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) {
      stmt.run(key, String(value), req.user.id);
    }
  });

  updateMany(Object.entries(settings));
  res.json({ message: `${Object.keys(settings).length} setting(s) updated.` });
});

module.exports = router;
