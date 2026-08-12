/**
 * Run this script once to create the SQLite database and seed it with data.
 * Usage: node setup-db.js
 */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'agricomply.db');
const db = new Database(dbPath);

console.log('📦 Setting up AgriComply SQLite database...\n');

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  -- 1. Users Table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Farmer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. Documents Table (Vault)
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    file_name TEXT,
    file_path TEXT,
    tag TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. Compliance Rules
  CREATE TABLE IF NOT EXISTS compliance_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT,
    required_doc_tag TEXT,
    penalty_amount REAL,
    due_date TEXT,
    applicable_role TEXT NOT NULL DEFAULT 'ALL'
  );

  -- 4. Schemes
  CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_name TEXT,
    description TEXT,
    required_docs_json TEXT
  );
`);

console.log('✅ Tables created successfully!\n');

// Seed compliance rules
const insertRule = db.prepare(
  'INSERT OR IGNORE INTO compliance_rules (rule_name, required_doc_tag, applicable_role, due_date) VALUES (?, ?, ?, ?)'
);

const rules = [
  // Farmer rules
  ['KCC Renewal', 'LandRecord', 'Farmer', '2025-06-30'],
  ['PM-KISAN KYC', 'Aadhaar', 'Farmer', '2025-12-31'],
  ['Crop Insurance (PMFBY)', 'CropSowingCertificate', 'Farmer', '2025-07-15'],
  // FPO rules
  ['FPO GST Return (GSTR-3B)', 'GSTR-3B', 'FPO', '2025-11-20'],
  ['TDS Return Filing', 'Form26AS', 'FPO', '2025-10-31'],
  ['Annual Audit Report', 'AuditReport', 'FPO', '2025-09-30'],
  ['Equity Grant Utilization', 'UtilizationCertificate', 'FPO', '2025-03-31'],
  // MSME rules
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
console.log(`✅ Seeded ${rules.length} compliance rules!\n`);

// Seed schemes
const insertScheme = db.prepare(
  'INSERT OR IGNORE INTO schemes (scheme_name, required_docs_json) VALUES (?, ?)'
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
console.log(`✅ Seeded ${schemes.length} schemes!\n`);

// Verify
const ruleCount = db.prepare('SELECT COUNT(*) as count FROM compliance_rules').get();
const schemeCount = db.prepare('SELECT COUNT(*) as count FROM schemes').get();
console.log(`📊 Database summary:`);
console.log(`   - compliance_rules: ${ruleCount.count} rows`);
console.log(`   - schemes: ${schemeCount.count} rows`);
console.log(`\n🎉 Database ready at: ${dbPath}`);

db.close();
