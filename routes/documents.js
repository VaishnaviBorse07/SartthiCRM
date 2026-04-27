const express = require('express');
const path = require('path');
const multer = require('multer');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// Multer config — save to /uploads with original extension
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter(req, file, cb) {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed.'));
  },
});

// GET /api/documents
router.get('/', (req, res) => {
  const { search, type, client } = req.query;
  let sql = 'SELECT * FROM documents WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR tags LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (client) { sql += ' AND client = ?'; params.push(client); }
  sql += ' ORDER BY uploaded_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// POST /api/documents  (multipart/form-data)
router.post('/', upload.single('file'), (req, res) => {
  const { name, client, type, linked_task, tags, expiry_date, version } = req.body;
  if (!name) return res.status(400).json({ error: 'Document name is required.' });

  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  const file_size = req.file ? `${(req.file.size / 1024).toFixed(1)} KB` : null;

  const info = db.prepare(`INSERT INTO documents (name,client,type,linked_task,file_path,file_size,version,tags,expiry_date)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(name, client || null, type || 'Other', linked_task || null, file_path, file_size, version || 'v1', tags || null, expiry_date || null);

  res.status(201).json({ id: info.lastInsertRowid, file_path, message: 'Document uploaded.' });
});

// DELETE /api/documents/:id
router.delete('/:id', (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });

  // Optionally delete file from disk
  if (doc.file_path) {
    const fs = require('fs');
    const fullPath = path.join(__dirname, '..', doc.file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ message: 'Document deleted.' });
});

module.exports = router;
