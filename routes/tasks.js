const express = require('express');
const db = require('../database/db');
const { verifyToken, requireManager } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/tasks
router.get('/', (req, res) => {
  const { search, assigned_to, service_type, status, recurring } = req.query;
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR client LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }
  if (assigned_to) { sql += ' AND assigned_to = ?'; params.push(assigned_to); }
  if (service_type) { sql += ' AND service_type = ?'; params.push(service_type); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (recurring === '1') { sql += " AND recurring != ''"; }
  sql += ' ORDER BY due_date ASC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, client, service_type, priority, assigned_to, reviewer, start_date, due_date, status, recurring, est_hours, checklist, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required.' });

  const info = db.prepare(`INSERT INTO tasks (title,client,service_type,priority,assigned_to,reviewer,start_date,due_date,status,recurring,est_hours,checklist,description)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(title, client || null, service_type || null, priority || 'Medium',
      assigned_to || null, reviewer || null, start_date || null, due_date || null,
      status || 'Todo', recurring || '', est_hours || null, checklist || null, description || null);

  res.status(201).json({ id: info.lastInsertRowid, message: 'Task created.' });
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const { title, client, service_type, priority, assigned_to, reviewer, start_date, due_date, status, recurring, est_hours, checklist, description } = req.body;
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });

  db.prepare(`UPDATE tasks SET title=?,client=?,service_type=?,priority=?,assigned_to=?,reviewer=?,start_date=?,due_date=?,
    status=?,recurring=?,est_hours=?,checklist=?,description=?,updated_at=datetime('now') WHERE id=?`)
    .run(title, client, service_type, priority, assigned_to, reviewer, start_date, due_date, status, recurring, est_hours, checklist, description, req.params.id);

  res.json({ message: 'Task updated.' });
});

// PATCH /api/tasks/:id/status  (quick status change from kanban)
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['Todo', 'In Progress', 'Review', 'Done', 'On Hold'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });

  db.prepare("UPDATE tasks SET status=?, updated_at=datetime('now') WHERE id=?").run(status, req.params.id);
  res.json({ message: 'Status updated.' });
});

// DELETE /api/tasks/:id
router.delete('/:id', requireManager, (req, res) => {
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted.' });
});

module.exports = router;
