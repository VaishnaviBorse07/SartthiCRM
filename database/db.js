const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'sartthi.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    -- ============================================================
    -- USERS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role        TEXT DEFAULT 'ca_staff' CHECK(role IN ('admin','manager','ca_staff','advocate')),
      dept        TEXT,
      phone       TEXT,
      specialization TEXT,
      join_date   TEXT,
      active      INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- CLIENTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS clients (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      company      TEXT,
      pan          TEXT,
      gstin        TEXT,
      email        TEXT,
      phone        TEXT,
      city         TEXT,
      industry     TEXT,
      services     TEXT,
      manager      TEXT,
      status       TEXT DEFAULT 'Active',
      revenue      REAL DEFAULT 0,
      last_contact TEXT,
      dob          TEXT,
      aadhar       TEXT,
      address      TEXT,
      notes        TEXT,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- LEADS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS leads (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT NOT NULL,
      company          TEXT,
      email            TEXT,
      phone            TEXT,
      source           TEXT DEFAULT 'Website',
      budget           REAL,
      status           TEXT DEFAULT 'New',
      follow_up        TEXT,
      salesperson      TEXT,
      service_required TEXT,
      notes            TEXT,
      priority         TEXT DEFAULT 'Medium',
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- TASKS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS tasks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      client       TEXT,
      service_type TEXT,
      priority     TEXT DEFAULT 'Medium',
      assigned_to  TEXT,
      reviewer     TEXT,
      start_date   TEXT,
      due_date     TEXT,
      status       TEXT DEFAULT 'Todo',
      recurring    TEXT DEFAULT '',
      est_hours    REAL,
      checklist    TEXT,
      description  TEXT,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- LEGAL MATTERS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS matters (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      title            TEXT NOT NULL,
      client           TEXT,
      type             TEXT,
      court            TEXT,
      case_no          TEXT,
      advocate         TEXT,
      stage            TEXT DEFAULT 'Inquiry',
      next_hearing     TEXT,
      retainer_amount  REAL,
      priority         TEXT DEFAULT 'Medium',
      description      TEXT,
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- COMPLIANCE
    -- ============================================================
    CREATE TABLE IF NOT EXISTS compliance (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      type        TEXT DEFAULT 'GST',
      client      TEXT,
      period      TEXT,
      due_date    TEXT,
      assigned_to TEXT,
      status      TEXT DEFAULT 'Pending',
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- INVOICES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS invoices (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no   TEXT UNIQUE NOT NULL,
      client       TEXT,
      services     TEXT,
      amount       REAL DEFAULT 0,
      gst_rate     REAL DEFAULT 18,
      gst_amount   REAL DEFAULT 0,
      total        REAL DEFAULT 0,
      status       TEXT DEFAULT 'Draft',
      invoice_date TEXT,
      due_date     TEXT,
      paid_date    TEXT,
      notes        TEXT,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- RECEIPTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS receipts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_no   TEXT UNIQUE NOT NULL,
      client       TEXT,
      invoice_no   TEXT,
      amount       REAL DEFAULT 0,
      payment_mode TEXT DEFAULT 'UPI',
      payment_date TEXT,
      reference    TEXT,
      notes        TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- EXPENSES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS expenses (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      description  TEXT NOT NULL,
      category     TEXT DEFAULT 'Other',
      client       TEXT,
      amount       REAL DEFAULT 0,
      expense_date TEXT,
      billable     INTEGER DEFAULT 0,
      status       TEXT DEFAULT 'Pending',
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- ACTIVITIES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS activities (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      type               TEXT DEFAULT 'call',
      client             TEXT,
      logged_by          TEXT,
      notes              TEXT,
      activity_datetime  TEXT,
      duration           INTEGER,
      created_at         TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- DOCUMENTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS documents (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      client       TEXT,
      type         TEXT DEFAULT 'Other',
      linked_task  TEXT,
      file_path    TEXT,
      file_size    TEXT,
      version      TEXT DEFAULT 'v1',
      tags         TEXT,
      expiry_date  TEXT,
      uploaded_at  TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- TIMESHEETS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS timesheets (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      employee         TEXT,
      client           TEXT,
      task_description TEXT,
      work_date        TEXT,
      start_time       TEXT,
      end_time         TEXT,
      hours            REAL,
      billable         INTEGER DEFAULT 1,
      status           TEXT DEFAULT 'Pending',
      created_at       TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- NOTIFICATIONS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      text       TEXT,
      time_ago   TEXT,
      is_unread  INTEGER DEFAULT 1,
      user_id    INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- CONTENT SETTINGS (Admin-managed frontend content)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS content_settings (
      setting_key   TEXT PRIMARY KEY,
      setting_value TEXT,
      updated_by    INTEGER,
      updated_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  // ============================================================
  // SEED DATA — only if DB is empty
  // ============================================================
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (userCount.c > 0) return; // Already seeded

  console.log('🌱 Seeding database with initial data...');

  // --- Users ---
  const insertUser = db.prepare(`INSERT INTO users (name,email,password_hash,role,dept,phone,specialization,join_date) VALUES (?,?,?,?,?,?,?,?)`);
  const adminHash = bcrypt.hashSync('admin123', 10);
  const staffHash = bcrypt.hashSync('staff123', 10);

  insertUser.run('Admin User', 'admin@sartthi.com', adminHash, 'admin', 'Admin', '9800000001', 'System Administration', '2020-01-01');
  insertUser.run('Priya Sharma', 'priya@sartthi.com', staffHash, 'manager', 'Tax', '9811223344', 'GST, Direct Tax', '2020-01-15');
  insertUser.run('Amit Joshi', 'amit@sartthi.com', staffHash, 'ca_staff', 'Audit', '9822334455', 'Statutory Audit, Tax Planning', '2019-06-01');
  insertUser.run('Ravi Kumar', 'ravi@sartthi.com', staffHash, 'ca_staff', 'Compliance', '9833445566', 'ROC, FEMA, MCA', '2021-03-10');
  insertUser.run('Sneha Patel', 'sneha@sartthi.com', staffHash, 'ca_staff', 'Tax', '9844556677', 'GST, PF/ESI', '2022-08-01');
  insertUser.run('Arun Nair', 'arun@sartthi.com', staffHash, 'advocate', 'Legal', '9855667788', 'Civil, Tax Litigation, Arbitration', '2021-11-20');

  // --- Clients ---
  const insClient = db.prepare(`INSERT INTO clients (name,company,pan,gstin,email,phone,city,industry,services,manager,status,revenue,last_contact,address,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const clients = [
    ['Rajesh Kumar','Kumar Enterprises','ABCPK1234D','27ABCPK1234D1Z5','rajesh@kumarent.com','9876543210','Mumbai','Manufacturing','GST Filing,ITR,TDS','Priya Sharma','Active',185000,'2024-12-01','204, Nariman Point, Mumbai 400021','Long-term client, prefers evening calls'],
    ['Sunita Patel','Patel & Co.','BCQPS5678E','24BCQPS5678E1Z3','sunita@patelnco.com','9765432109','Ahmedabad','Retail','Audit,Tax Planning','Amit Joshi','Active',320000,'2024-12-03','15, CG Road, Ahmedabad',null],
    ['Vikram Singh','Singh Legal Associates','CDRPS9012F','07CDRPS9012F1Z1','vikram@singhlaw.com','9654321098','Delhi','Legal','Legal Compliance,ITR','Priya Sharma','Active',65000,'2024-11-28','Connaught Place, New Delhi',null],
    ['Meera Reddy','Reddy Infrastructure','DERPR3456G','36DERPR3456G1Z7','meera@reddyinfra.com','9543210987','Hyderabad','Real Estate','GST Filing,Audit,ROC Filing','Ravi Kumar','Inactive',580000,'2024-10-15','Banjara Hills, Hyderabad',null],
    ['Arjun Mehta','Mehta Digital Pvt. Ltd','EFMPM7890H','27EFMPM7890H1Z5','arjun@mehtadigital.com','9432109876','Pune','Technology','Tax Planning,GST Filing','Amit Joshi','Active',195000,'2024-12-05','Hinjewadi IT Park, Pune',null],
    ['Kavya Nair','Nair Constructions','FGNKN2345I','32FGNKN2345I1Z9','kavya@naircon.com','9321098765','Kochi','Construction','Audit,GST Filing','Priya Sharma','Lead',0,'2024-12-02','Marine Drive, Kochi',null],
    ['Sanjay Gupta','Gupta Exports Ltd','GHSGS6789J','09GHSGS6789J1Z2','sanjay@guptaexp.com','9211098654','Kanpur','Manufacturing','FEMA,GST Filing,Export Benefits','Ravi Kumar','Active',430000,'2024-11-30','Swaroop Nagar, Kanpur',null],
    ['Priya Kapoor','Kapoor & Associates','HIPKP4321K','07HIPKP4321K1Z8','priya.k@kapoorassoc.com','9887654321','Gurgaon','Legal','Legal Compliance,Company Incorporation','Amit Joshi','Active',92000,'2024-12-04','Sector 29, Gurgaon',null],
  ];
  clients.forEach(c => insClient.run(...c));

  // --- Leads ---
  const insLead = db.prepare(`INSERT INTO leads (name,company,email,phone,source,budget,status,follow_up,salesperson,service_required,notes,priority) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const leads = [
    ['Rohit Agarwal','Agarwal Textiles','rohit@agartex.com','9876512340','Website',50000,'New','2024-12-10','Amit Joshi','GST Registration','Needs GST registration','High'],
    ['Deepa Venkat','Venkat Pharma','deepa@venkatpharma.com','9765412309','Referral',80000,'Qualified','2024-12-08','Priya Sharma','Audit','Interested in audit services','Medium'],
    ['Ananya Bose','Bose Group','ananya@bosegroup.com','9543212187','LinkedIn',150000,'Proposal Sent','2024-12-07','Amit Joshi','GST+Audit+Tax Planning','Large company','High'],
    ['Kiran Rao','Rao Hospitality','kiran@raohospitality.com','9432112076','Walk-in',45000,'Converted','2024-11-30','Priya Sharma','ITR','Converted to client','Medium'],
    ['Naveen Joshi','Joshi Builders','naveen@joshibuild.com','9321098765','Cold Call',70000,'Contacted','2024-12-15','Ravi Kumar','GST+RERA','Real estate','High'],
    ['Mukesh Patel','Patel Electronics','mukesh@patelec.com','9967890123','Exhibition',200000,'Negotiation','2024-12-12','Amit Joshi','Audit+Tax Planning','High value','High'],
    ['Ritu Sharma','Sharma Pharma','ritu@sharmapharma.com','9810067893','Instagram',35000,'New','2024-12-20','Sneha Patel','GST Filing','Monthly GST','Low'],
  ];
  leads.forEach(l => insLead.run(...l));

  // --- Tasks ---
  const insTask = db.prepare(`INSERT INTO tasks (title,client,service_type,priority,assigned_to,reviewer,start_date,due_date,status,recurring,est_hours,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const tasks = [
    ['GSTR-3B Filing — Kumar Enterprises','Rajesh Kumar','GST Filing','High','Priya Sharma','Amit Joshi','2024-12-01','2024-12-10','In Progress','monthly',3,'Monthly GST return for Nov 2024'],
    ['Annual Audit — Patel & Co.','Sunita Patel','Audit','High','Amit Joshi','','2024-12-02','2024-12-20','Todo','',20,'FY2024 statutory audit'],
    ['ITR Filing — Singh Legal Associates','Vikram Singh','ITR Filing','Medium','Priya Sharma','','2024-11-28','2024-12-15','In Progress','yearly',6,null],
    ['ROC Annual Filing — Reddy Infrastructure','Meera Reddy','ROC Filing','Low','Ravi Kumar','','2024-12-03','2024-12-25','Todo','yearly',8,null],
    ['Tax Planning FY25 — Mehta Digital','Arjun Mehta','Tax Planning','Medium','Amit Joshi','','2024-11-25','2024-12-08','Done','',5,null],
    ['TDS Return Q3 — Kumar Enterprises','Rajesh Kumar','TDS Return','High','Priya Sharma','Amit Joshi','2024-12-04','2024-12-12','Review','quarterly',4,null],
    ['FEMA Compliance — Gupta Exports','Sanjay Gupta','FEMA','Medium','Ravi Kumar','','2024-12-05','2024-12-28','Todo','yearly',12,null],
    ['GST Registration — Kapoor & Associates','Priya Kapoor','GST Filing','High','Sneha Patel','Priya Sharma','2024-12-06','2024-12-11','In Progress','',2,null],
    ['PF/ESI Return — Mehta Digital','Arjun Mehta','PF/ESI','Low','Sneha Patel','','2024-12-07','2024-12-18','Todo','monthly',2,null],
    ['MCA Filing — Bose Group','Ananya Bose','MCA Filing','High','Ravi Kumar','','2024-12-01','2024-12-09','On Hold','',6,null],
  ];
  tasks.forEach(t => insTask.run(...t));

  // --- Compliance ---
  const insComp = db.prepare(`INSERT INTO compliance (name,type,client,period,due_date,assigned_to,status) VALUES (?,?,?,?,?,?,?)`);
  [
    ['GSTR-3B November 2024','GST','Rajesh Kumar','Nov 2024','2024-12-20','Priya Sharma','Pending'],
    ['TDS Return Q3 FY25','TDS','Kumar Enterprises','Q3 FY25','2024-12-31','Priya Sharma','In Progress'],
    ['ROC Annual Filing','ROC','Patel & Co.','FY2024','2024-12-31','Ravi Kumar','Pending'],
    ['Advance Tax Q3','IT','Mehta Digital','Q3 FY25','2024-12-15','Amit Joshi','Done'],
    ['FEMA Annual Return','FEMA','Gupta Exports','FY2024','2024-12-25','Ravi Kumar','Pending'],
    ['GSTR-1 November 2024','GST','Sunita Patel','Nov 2024','2024-12-11','Sneha Patel','Done'],
    ['PF Monthly Return','PF','Arjun Mehta','Nov 2024','2024-12-15','Sneha Patel','Done'],
    ['ESI Return','ESI','Arjun Mehta','Nov 2024','2024-12-21','Sneha Patel','Pending'],
    ['MCA MGT-7 Filing','MCA','Reddy Infrastructure','FY2024','2024-12-29','Ravi Kumar','Pending'],
    ['Form 16 Issue','TDS','Rajesh Kumar','FY2024','2024-12-31','Priya Sharma','Pending'],
  ].forEach(c => insComp.run(...c));

  // --- Matters ---
  const insMatter = db.prepare(`INSERT INTO matters (title,client,type,court,case_no,advocate,stage,next_hearing,retainer_amount,priority,description) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  [
    ['Property Dispute — Singh vs. Sharma','Vikram Singh','Civil Suit','Delhi High Court','CS(OS) 245/2024','Arun Nair','Hearing','2024-12-18',50000,'High','Property title dispute in South Delhi'],
    ['Income Tax Appeal — Gupta Exports','Sanjay Gupta','Tax Dispute','ITAT Mumbai','ITA 1234/MUM/2024','Arun Nair','Arguments','2024-12-22',75000,'High','AY2022-23 reassessment appeal'],
    ['Company Incorporation — Patel Electronics','Mukesh Patel','Corporate','MCA Portal','N/A','Arun Nair','Filed',null,15000,'Medium','Private limited company formation'],
    ['Consumer Complaint — Kumar Enterprises','Rajesh Kumar','Consumer Forum','DCDRC Mumbai','CC/2024/789','Arun Nair','Retainer Signed','2024-12-28',25000,'Low','Defective product complaint'],
    ['Arbitration — Bose Group vs. Contractors','Ananya Bose','Arbitration','DIAC','ARB/2024/56','Arun Nair','Hearing','2024-12-20',100000,'High','Construction contract dispute'],
  ].forEach(m => insMatter.run(...m));

  // --- Invoices ---
  const insInv = db.prepare(`INSERT INTO invoices (invoice_no,client,services,amount,gst_rate,gst_amount,total,status,invoice_date,due_date,paid_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  [
    ['INV-2024-001','Rajesh Kumar','GST Filing,TDS Return',15000,18,2700,17700,'Paid','2024-11-01','2024-11-30','2024-11-28'],
    ['INV-2024-002','Sunita Patel','Audit',35000,18,6300,41300,'Pending','2024-11-15','2024-12-15',null],
    ['INV-2024-003','Vikram Singh','ITR',8000,18,1440,9440,'Overdue','2024-10-20','2024-11-20',null],
    ['INV-2024-004','Arjun Mehta','Tax Planning,GST Filing',22000,18,3960,25960,'Paid','2024-11-25','2024-12-05','2024-12-03'],
    ['INV-2024-005','Meera Reddy','ROC Filing,Audit',55000,18,9900,64900,'Draft','2024-12-01','2024-12-31',null],
    ['INV-2024-006','Sanjay Gupta','FEMA,Export Consulting',42000,18,7560,49560,'Sent','2024-12-02','2024-12-25',null],
    ['INV-2024-007','Priya Kapoor','Company Incorporation',18000,18,3240,21240,'Paid','2024-11-20','2024-12-10','2024-12-05'],
  ].forEach(i => insInv.run(...i));

  // --- Receipts ---
  const insRcpt = db.prepare(`INSERT INTO receipts (receipt_no,client,invoice_no,amount,payment_mode,payment_date,reference,notes) VALUES (?,?,?,?,?,?,?,?)`);
  insRcpt.run('RCP-001','Rajesh Kumar','INV-2024-001',17700,'NEFT/RTGS','2024-11-28','UTR24115678901','Full payment');
  insRcpt.run('RCP-002','Arjun Mehta','INV-2024-004',25960,'UPI','2024-12-03','UPI24340987654','');
  insRcpt.run('RCP-003','Priya Kapoor','INV-2024-007',21240,'Cheque','2024-12-05','CHQ 001234','Cheque dated 05-Dec-24');

  // --- Expenses ---
  const insExp = db.prepare(`INSERT INTO expenses (description,category,client,amount,expense_date,billable,status) VALUES (?,?,?,?,?,?,?)`);
  insExp.run('Travel to Kanpur — Gupta Exports','Travel','Sanjay Gupta',4500,'2024-12-03',1,'Approved');
  insExp.run('Office stationery & printing','Office Supplies','',1800,'2024-12-01',0,'Approved');
  insExp.run('MCA21 filing fee','Professional Fees','Priya Kapoor',3000,'2024-12-04',1,'Pending');
  insExp.run('Zoom Pro subscription','Software','',1299,'2024-12-01',0,'Approved');

  // --- Activities ---
  const insAct = db.prepare(`INSERT INTO activities (type,client,logged_by,notes,activity_datetime,duration) VALUES (?,?,?,?,?,?)`);
  [
    ['call','Rajesh Kumar','Priya Sharma','Discussed Q3 GST filing requirements','2024-12-06 10:30:00',25],
    ['email','Sunita Patel','Amit Joshi','Sent audit schedule and engagement letter','2024-12-06 09:00:00',null],
    ['meeting','Vikram Singh','Priya Sharma','Office meeting — discussed pending ITR','2024-12-05 15:00:00',45],
    ['whatsapp','Arjun Mehta','Sneha Patel','Sent GST return summary on WhatsApp','2024-12-05 11:00:00',null],
    ['note','Meera Reddy','Ravi Kumar','Client requested extension for balance sheet','2024-12-04 16:00:00',null],
    ['visit','Sanjay Gupta','Ravi Kumar','Client visit at Kanpur — collected FEMA docs','2024-12-03 14:00:00',120],
    ['call','Priya Kapoor','Amit Joshi','Follow-up on company incorporation at MCA','2024-12-03 11:30:00',15],
  ].forEach(a => insAct.run(...a));

  // --- Timesheets ---
  const insTS = db.prepare(`INSERT INTO timesheets (employee,client,task_description,work_date,start_time,end_time,hours,billable,status) VALUES (?,?,?,?,?,?,?,?,?)`);
  [
    ['Priya Sharma','Rajesh Kumar','GSTR-3B Preparation','2024-12-06','09:00','12:00',3,1,'Approved'],
    ['Amit Joshi','Sunita Patel','Audit Planning','2024-12-06','10:00','14:00',4,1,'Approved'],
    ['Ravi Kumar','Sanjay Gupta','FEMA Document Review','2024-12-05','11:00','13:00',2,1,'Pending'],
    ['Sneha Patel','Priya Kapoor','GST Registration','2024-12-05','09:30','11:30',2,1,'Approved'],
    ['Arun Nair','Vikram Singh','Case Brief Preparation','2024-12-04','14:00','17:00',3,1,'Approved'],
  ].forEach(t => insTS.run(...t));

  // --- Notifications ---
  const insNotif = db.prepare(`INSERT INTO notifications (text,time_ago,is_unread) VALUES (?,?,?)`);
  [
    ['GSTR-3B due in 14 days for Rajesh Kumar','1 hour ago',1],
    ['Invoice INV-2024-003 is 16 days overdue','2 hours ago',1],
    ["Task 'Annual Audit' due in 14 days",'4 hours ago',1],
    ['New lead: Ritu Sharma from Instagram','Yesterday',1],
    ['Payment received from Arjun Mehta — ₹25,960','Yesterday',0],
    ['Compliance alert: TDS Return Q3 due Dec 31','2 days ago',0],
    ['Next hearing: Singh Legal — Dec 18','2 days ago',0],
  ].forEach(n => insNotif.run(...n));

  // --- Content Settings ---
  const insContent = db.prepare(`INSERT OR IGNORE INTO content_settings (setting_key, setting_value) VALUES (?,?)`);
  [
    ['firm_name', 'Sartthi CA & Advocates'],
    ['firm_tagline', 'CA & Advocates'],
    ['firm_motto', 'Practice Management Reimagined.'],
    ['firm_description', 'Complete CRM for CA Firms, Tax Professionals & Law Firms in India. GST · Audit · TDS · ROC · Legal · Billing — all in one place.'],
    ['firm_email', 'admin@sartthi.com'],
    ['firm_phone', '+91 98765 43210'],
    ['firm_address', 'Mumbai, Maharashtra, India'],
    ['announcement_enabled', '0'],
    ['announcement_text', 'Welcome to Sartthi CRM!'],
    ['announcement_type', 'info'],
    ['services_list', 'GST Filing,ITR Filing,Audit,TDS Return,ROC Filing,Tax Planning,Legal Compliance,FEMA,PF/ESI,MCA Filing,MSME Registration,Company Incorporation,Partnership Deed,Legal Opinion,Income Tax Appeal'],
    ['portal_welcome', 'Welcome to your Sartthi Client Portal.'],
    ['footer_text', '© 2024 Sartthi CA & Advocates CRM. All rights reserved.'],
    ['footer_version', 'v3.0 · For CA Firms, Tax Professionals & Advocates in India'],
  ].forEach(([k, v]) => insContent.run(k, v));

  console.log('✅ Database seeded successfully!');
  console.log('   Admin login: admin@sartthi.com / admin123');
  console.log('   Staff login: priya@sartthi.com / staff123');
}

initDB();
module.exports = db;
