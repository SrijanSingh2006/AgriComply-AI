/**
 * SQLite DB initializer — runs on every server start.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to run multiple times.
 * Uses the local agricomply.db file via better-sqlite3.
 */
require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'agricomply.db');
const db = new Database(dbPath);

// Enable WAL mode
db.pragma('journal_mode = WAL');

function initDb() {
  try {
    // Create tables
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

    // Seed compliance rules if empty
    const ruleCount = db.prepare('SELECT COUNT(*) as count FROM compliance_rules').get();
    if (parseInt(ruleCount.count) === 0) {
      const insertRule = db.prepare(
        'INSERT OR IGNORE INTO compliance_rules (rule_name, required_doc_tag, applicable_role, due_date) VALUES (?, ?, ?, ?)'
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
        for (const item of items) insertRule.run(...item);
      });
      insertMany(rules);
      console.log(`✅ Seeded ${rules.length} compliance rules`);
    }

    // Seed schemes if empty
    const schemeCount = db.prepare('SELECT COUNT(*) as count FROM schemes').get();
    if (parseInt(schemeCount.count) === 0) {
      const insertScheme = db.prepare(
        'INSERT OR IGNORE INTO schemes (scheme_name, required_docs_json) VALUES (?, ?)'
      );
      const schemes = [
        ['Kisan Credit Card', '["PAN", "LandRecord"]'],
        ['Tractor Loan', '["Aadhaar", "Quotation", "LandRecord"]'],
      ];
      const insertSchemes = db.transaction((items) => {
        for (const item of items) insertScheme.run(...item);
      });
      insertSchemes(schemes);
      console.log(`✅ Seeded ${schemes.length} schemes`);
    }

    // Seed demo users if missing
    const demoAccounts = [
      { name: 'John Farmer', email: 'farmer@demo.com', password: 'demo123', role: 'Farmer' },
      { name: 'Kisan FPO Cooperative', email: 'fpo@demo.com', password: 'demo123', role: 'FPO' },
      { name: 'AgriTech Enterprises', email: 'msme@demo.com', password: 'demo123', role: 'MSME' },
      { name: 'Demo User', email: 'ss1@gmail.com', password: '123', role: 'Farmer' }
    ];

    for (const acc of demoAccounts) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(acc.email);
      if (!existing) {
        const hashedPassword = bcrypt.hashSync(acc.password, 10);
        db.prepare('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
          acc.name, acc.email, hashedPassword, acc.role
        );
        console.log(`✅ Demo user seeded: ${acc.email} / ${acc.password} (${acc.role})`);
      }
    }

    console.log('✅ SQLite database initialized successfully');
  } catch (err) {
    console.error('❌ DB Init Error:', err.message);
  }
}

initDb();
