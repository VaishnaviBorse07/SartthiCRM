const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// GET /api/dashboard  — aggregate stats for the dashboard KPI grid
router.get('/', (req, res) => {
  const totalClients = db.prepare("SELECT COUNT(*) as c FROM clients WHERE status = 'Active'").get().c;
  const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
  const openTasks = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status NOT IN ('Done')").get().c;
  const pendingComp = db.prepare("SELECT COUNT(*) as c FROM compliance WHERE status = 'Pending'").get().c;
  const openMatters = db.prepare("SELECT COUNT(*) as c FROM matters WHERE stage NOT IN ('Disposed')").get().c;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(revenue),0) as s FROM clients').get().s;

  const taskByStatus = db.prepare("SELECT status, COUNT(*) as c FROM tasks GROUP BY status").all();
  const leadByStatus = db.prepare("SELECT status, COUNT(*) as c FROM leads GROUP BY status").all();
  const compByType = db.prepare("SELECT type, COUNT(*) as c FROM compliance GROUP BY type").all();
  const matterByStage = db.prepare("SELECT stage, COUNT(*) as c FROM matters GROUP BY stage").all();

  // Upcoming deadlines (next 30 days compliance)
  const upcoming = db.prepare(`
    SELECT name, client, due_date, type FROM compliance
    WHERE status != 'Done' AND due_date IS NOT NULL
    ORDER BY due_date ASC LIMIT 5
  `).all();

  // Top clients by revenue
  const topClients = db.prepare(`
    SELECT name, company, revenue FROM clients
    ORDER BY revenue DESC LIMIT 5
  `).all();

  // Recent activities
  const recentActivities = db.prepare(`
    SELECT * FROM activities ORDER BY activity_datetime DESC LIMIT 6
  `).all();

  // Upcoming tasks
  const upcomingTasks = db.prepare(`
    SELECT * FROM tasks WHERE status NOT IN ('Done') ORDER BY due_date ASC LIMIT 5
  `).all();

  res.json({
    kpis: { totalClients, totalLeads, openTasks, pendingComp, openMatters, totalRevenue },
    taskByStatus,
    leadByStatus,
    compByType,
    matterByStage,
    upcoming,
    topClients,
    recentActivities,
    upcomingTasks,
  });
});

module.exports = router;
