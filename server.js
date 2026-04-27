require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// ─── Static HTML pages ───────────────────────────────────────
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Sartthi_CRM_Complete.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/clients',       require('./routes/clients'));
app.use('/api/leads',         require('./routes/leads'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/compliance',    require('./routes/compliance'));
app.use('/api/matters',       require('./routes/matters'));
app.use('/api/activities',    require('./routes/activities'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/timesheets',    require('./routes/timesheets'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/content',       require('./routes/content'));
app.use('/api/dashboard',     require('./routes/dashboard'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0', env: process.env.NODE_ENV });
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Max 50MB.' });
  }
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Sartthi CRM Server running on http://localhost:${PORT}`);
  console.log(`   📊 CRM Frontend : http://localhost:${PORT}/`);
  console.log(`   🔐 Admin Panel  : http://localhost:${PORT}/admin`);
  console.log(`   🔌 API Base     : http://localhost:${PORT}/api`);
  console.log(`   💾 Health Check : http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
