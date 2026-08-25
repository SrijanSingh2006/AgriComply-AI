/**
 * PostgreSQL database adapter.
 * 
 * Drop-in replacement for the SQLite config/db.js.
 * Automatically converts SQLite-style ? placeholders to PostgreSQL $1, $2, ...
 * so all existing models (User.js, Document.js, Rules.js) work unchanged.
 * 
 * Requires: DATABASE_URL environment variable (Render PostgreSQL connection string)
 */
const { Pool } = require('pg');

// Render provides DATABASE_URL automatically when you attach a PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Convert SQLite-style ? positional params to PostgreSQL $1, $2, ...
 * Also converts SQLite-specific syntax to PostgreSQL equivalents.
 */
function toPostgres(sql) {
  let i = 0;
  // Replace ? with $1, $2, ...
  sql = sql.replace(/\?/g, () => `$${++i}`);
  // SQLite AUTOINCREMENT → PostgreSQL SERIAL (for schema creation only)
  sql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  // SQLite datetime('now') → PostgreSQL NOW()
  sql = sql.replace(/datetime\('now'\)/gi, 'NOW()');
  // SQLite DATETIME DEFAULT CURRENT_TIMESTAMP → PostgreSQL TIMESTAMP DEFAULT NOW()
  sql = sql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT NOW()');
  sql = sql.replace(/DATETIME DEFAULT NOW\(\)/gi, 'TIMESTAMP DEFAULT NOW()');
  return sql;
}

const db = {
  /**
   * Execute a SQL query.
   * Returns [rows] for SELECT, [{ insertId, affectedRows }] for others.
   * Compatible with the MySQL2-style interface used by all models.
   */
  execute: async (sql, params = []) => {
    const pgSql = toPostgres(sql);
    try {
      const result = await pool.query(pgSql, params);
      const trimmed = sql.trim().toUpperCase();

      if (trimmed.startsWith('SELECT')) {
        return [result.rows];
      } else if (trimmed.startsWith('INSERT')) {
        // Return insertId (the new row's id if RETURNING is used, else 0)
        const insertId = result.rows && result.rows[0] ? result.rows[0].id : 0;
        return [{ insertId, affectedRows: result.rowCount }];
      } else {
        return [{ insertId: 0, affectedRows: result.rowCount }];
      }
    } catch (err) {
      console.error('DB Error:', err.message, '| SQL:', sql);
      throw err;
    }
  },

  // Expose pool for raw queries if needed
  raw: pool,
};

module.exports = db;