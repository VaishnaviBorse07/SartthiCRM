const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/timesheets
router.get('/', (req, res) => {
  const { employee, client, billable, status } = req.query;
  let sql = 'SELECT * FROM timesheets WHERE 1=1';
  const params = [];

  if (employee) { sql += ' AND employee = ?'; params.push(employee); }
  if (client) { sql += ' AND client = ?'; params.push(client); }
  if (billable !== undefined) { sql += ' AND billable = ?'; params.push(billable === '1' ? 1 : 0); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY work_date DESC, start_time DESC';

  res.json(db.prepare(sql).all(...params));
});

// POST /api/timesheets
router.post('/', (req, res) => {
  const { employee, client, task_description, work_date, start_time, end_time, hours, billable, status } = req.body;
  if (!employee) return res.status(400).json({ error: 'Employee is required.' });

  const info = db.prepare(`INSERT INTO timesheets (employee,client,task_description,work_date,start_time,end_time,hours,billable,status)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(employee, client || null, task_description || null, work_date || null,
      start_time || null, end_time || null, hours || null, billable ? 1 : 1, status || 'Pending');

  res.status(201).json({ id: info.lastInsertRowid, message: 'Hours logged.' });
});

// PATCH /api/timesheets/:id/status  (approve/reject)
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['Pending', 'Approved', 'Rejected'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  const existing = db.prepare('SELECT id FROM timesheets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Timesheet entry not found.' });

  db.prepare('UPDATE timesheets SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ message: 'Status updated.' });
});

// DELETE /api/timesheets/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM timesheets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Timesheet entry not found.' });
  db.prepare('DELETE FROM timesheets WHERE id = ?').run(req.params.id);
  res.json({ message: 'Timesheet entry deleted.' });
});

module.exports = router;
