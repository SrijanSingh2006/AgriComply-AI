/**
 * Lightweight DB initializer that runs on every server start.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to run multiple times.
 * This ensures the database works even on Render's ephemeral filesystem.
 */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.VERCEL 
  ? path.join('/tmp', 'agricomply.db') 
  : path.join(__dirname, 'agricomply.db');
const db = new Database(dbPath);

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Farmer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    file_name TEXT,
    file_path TEXT,
    tag TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS compliance_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT,
    required_doc_tag TEXT,
    penalty_amount REAL,
    due_date TEXT,
    applicable_role TEXT NOT NULL DEFAULT 'ALL'
  );

  CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_name TEXT,
    description TEXT,
    required_docs_json TEXT
  );
`);

// Seed data only if tables are empty
const ruleCount = db.prepare('SELECT COUNT(*) as count FROM compliance_rules').get();
if (ruleCount.count === 0) {
  const insertRule = db.prepare(
    'INSERT INTO compliance_rules (rule_name, required_doc_tag, applicable_role, due_date) VALUES (?, ?, ?, ?)'
  );

  const rules = [
    ['KCC Renewal', 'LandRecord', 'Farmer', '2025-06-30'],
    ['PM-KISAN KYC', 'Aadhaar', 'Farmer', '2025-12-31'],
    ['Crop Insurance (PMFBY)', 'CropSowingCertificate', 'Farmer', '2025-07-15'],
    ['FPO GST Return (GSTR-3B)', 'GSTR-3B', 'FPO', '2025-11-20'],
    ['TDS Return Filing', 'Form26AS', 'FPO', '2025-10-31'],
    ['Annual Audit Report', 'AuditReport', 'FPO', '2025-09-30'],
    ['Equity Grant Utilization', 'UtilizationCertificate', 'FPO', '2025-03-31'],
    ['GST Annual Return (GSTR-9)', 'GSTR-9', 'MSME', '2025-12-31'],
    ['Professional Tax Payment', 'ChallanPT', 'MSME', '2025-06-30'],
    ['Stock & Debtor Statement', 'StockStmt', 'MSME', '2025-01-10'],
    ['Udyam Registration', 'UdyamCert', 'MSME', '2025-03-31'],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertRule.run(...item);
    }
  });
  insertMany(rules);
  console.log(`✅ Seeded ${rules.length} compliance rules`);
}

const schemeCount = db.prepare('SELECT COUNT(*) as count FROM schemes').get();
if (schemeCount.count === 0) {
  const insertScheme = db.prepare(
    'INSERT INTO schemes (scheme_name, required_docs_json) VALUES (?, ?)'
  );

  const schemes = [
    ['Kisan Credit Card', '["PAN", "LandRecord"]'],
    ['Tractor Loan', '["Aadhaar", "Quotation", "LandRecord"]'],
  ];

  const insertSchemes = db.transaction((items) => {
    for (const item of items) {
      insertScheme.run(...item);
    }
  });
  insertSchemes(schemes);
  console.log(`✅ Seeded ${schemes.length} schemes`);
}

// Seed a demo user that always exists (for Vercel ephemeral DB)
const bcrypt = require('bcryptjs');
const demoEmail = 'ss1@gmail.com';
const existingDemo = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail);
if (!existingDemo) {
  const hashedPassword = bcrypt.hashSync('123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Demo User', demoEmail, hashedPassword, 'Farmer'
  );
  console.log('✅ Demo user seeded: ss1@gmail.com / 123');
}

console.log('✅ Database initialized successfully');
db.close();

