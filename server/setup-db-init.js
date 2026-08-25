/**
 * PostgreSQL DB initializer — runs on every server start.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to run multiple times.
 * Compatible with Render's PostgreSQL free tier.
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

async function initDb() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Farmer',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        file_name TEXT,
        file_path TEXT,
        tag TEXT,
        upload_date TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS compliance_rules (
        id SERIAL PRIMARY KEY,
        rule_name TEXT,
        required_doc_tag TEXT,
        penalty_amount REAL,
        due_date TEXT,
        applicable_role TEXT NOT NULL DEFAULT 'ALL'
      );

      CREATE TABLE IF NOT EXISTS schemes (
        id SERIAL PRIMARY KEY,
        scheme_name TEXT,
        description TEXT,
        required_docs_json TEXT
      );
    `);

    // Seed compliance rules if empty
    const ruleCount = await client.query('SELECT COUNT(*) as count FROM compliance_rules');
    if (parseInt(ruleCount.rows[0].count) === 0) {
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
      for (const [rule_name, required_doc_tag, applicable_role, due_date] of rules) {
        await client.query(
          'INSERT INTO compliance_rules (rule_name, required_doc_tag, applicable_role, due_date) VALUES ($1, $2, $3, $4)',
          [rule_name, required_doc_tag, applicable_role, due_date]
        );
      }
      console.log(`✅ Seeded ${rules.length} compliance rules`);
    }

    // Seed schemes if empty
    const schemeCount = await client.query('SELECT COUNT(*) as count FROM schemes');
    if (parseInt(schemeCount.rows[0].count) === 0) {
      const schemes = [
        ['Kisan Credit Card', '["PAN", "LandRecord"]'],
        ['Tractor Loan', '["Aadhaar", "Quotation", "LandRecord"]'],
      ];
      for (const [scheme_name, required_docs_json] of schemes) {
        await client.query(
          'INSERT INTO schemes (scheme_name, required_docs_json) VALUES ($1, $2)',
          [scheme_name, required_docs_json]
        );
      }
      console.log(`✅ Seeded ${schemes.length} schemes`);
    }

    // Seed demo user if missing
    const demoEmail = 'ss1@gmail.com';
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [demoEmail]);
    if (existing.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('123', 10);
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Demo User', demoEmail, hashedPassword, 'Farmer']
      );
      console.log('✅ Demo user seeded: ss1@gmail.com / 123');
    }

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (err) {
    console.error('❌ DB Init Error:', err.message);
    // Don't crash the server if DB init fails — it may already be initialized
  } finally {
    client.release();
  }
}

// Run async init and don't block server startup
initDb().catch(err => console.error('DB init failed:', err.message));
