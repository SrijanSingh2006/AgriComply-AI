require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./config/db');

const isPostgres = db.isPostgres;

function toPostgres(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function query(sql, params = []) {
  if (isPostgres) return db.raw.query(toPostgres(sql), params);

  const statement = db.raw.prepare(sql);
  const normalized = sql.trim().toUpperCase();
  if (normalized.startsWith('SELECT')) return { rows: statement.all(...params) };
  const result = statement.run(...params);
  return { rowCount: result.changes };
}

async function initializeDatabase() {
  const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const timestampType = isPostgres ? 'TIMESTAMP' : 'DATETIME';
  const numberType = isPostgres ? 'DOUBLE PRECISION' : 'REAL';

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id ${idType},
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Farmer',
      created_at ${timestampType} DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS documents (
      id ${idType},
      user_id INTEGER REFERENCES users(id),
      file_name TEXT,
      file_path TEXT,
      tag TEXT,
      upload_date ${timestampType} DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS compliance_rules (
      id ${idType},
      rule_name TEXT,
      required_doc_tag TEXT,
      penalty_amount ${numberType},
      due_date TEXT,
      applicable_role TEXT NOT NULL DEFAULT 'ALL'
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS schemes (
      id ${idType},
      scheme_name TEXT,
      description TEXT,
      required_docs_json TEXT
    )
  `);

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

  for (const [ruleName, requiredDocTag, role, dueDate] of rules) {
    const existing = await query(
      'SELECT id FROM compliance_rules WHERE rule_name = ? AND applicable_role = ?',
      [ruleName, role]
    );
    if (!existing.rows.length) {
      await query(
        'INSERT INTO compliance_rules (rule_name, required_doc_tag, applicable_role, due_date) VALUES (?, ?, ?, ?)',
        [ruleName, requiredDocTag, role, dueDate]
      );
    }
  }

  const schemes = [
    ['Kisan Credit Card', '["PAN", "LandRecord"]'],
    ['Tractor Loan', '["Aadhaar", "Quotation", "LandRecord"]'],
  ];

  for (const [schemeName, requiredDocs] of schemes) {
    const existing = await query('SELECT id FROM schemes WHERE scheme_name = ?', [schemeName]);
    if (!existing.rows.length) {
      await query(
        'INSERT INTO schemes (scheme_name, required_docs_json) VALUES (?, ?)',
        [schemeName, requiredDocs]
      );
    }
  }

  const demoAccounts = [
    { name: 'John Farmer', email: 'farmer@demo.com', password: 'demo123', role: 'Farmer' },
    { name: 'Kisan FPO Cooperative', email: 'fpo@demo.com', password: 'demo123', role: 'FPO' },
    { name: 'AgriTech Enterprises', email: 'msme@demo.com', password: 'demo123', role: 'MSME' },
    { name: 'Demo User', email: 'ss1@gmail.com', password: '123', role: 'Farmer' },
  ];

  for (const account of demoAccounts) {
    const existing = await query('SELECT id FROM users WHERE email = ?', [account.email]);
    if (!existing.rows.length) {
      const password = bcrypt.hashSync(account.password, 10);
      await query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [account.name, account.email, password, account.role]
      );
    }
  }

  console.log(`Database initialized successfully (${isPostgres ? 'PostgreSQL' : 'SQLite'})`);
}

const ready = initializeDatabase();
db.setReady(ready);
ready.catch((err) => {
  console.error('Database initialization failed:', err.message);
});

module.exports = ready;
