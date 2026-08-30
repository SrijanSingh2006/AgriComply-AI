/**
 * SQLite database adapter using better-sqlite3.
 *
 * Provides the same execute() interface previously used by the PostgreSQL adapter,
 * so all models (User.js, Document.js, Rules.js) work without any changes.
 * Uses the local agricomply.db file.
 */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'agricomply.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');

const db = {
  /**
   * Execute a SQL query.
   * Returns [rows] for SELECT, [{ insertId, affectedRows }] for others.
   * Compatible with the interface used by all models.
   * Supports ? positional params natively (SQLite style).
   */
  execute: async (sql, params = []) => {
    try {
      const trimmed = sql.trim().toUpperCase();

      if (trimmed.startsWith('SELECT')) {
        const stmt = sqlite.prepare(sql);
        const rows = stmt.all(...params);
        return [rows];
      } else if (trimmed.startsWith('INSERT')) {
        // Strip RETURNING clause — not supported in older SQLite builds
        const cleanSql = sql.replace(/\s+RETURNING\s+\w+/i, '');
        const stmt = sqlite.prepare(cleanSql);
        const info = stmt.run(...params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
      } else {
        const stmt = sqlite.prepare(sql);
        const info = stmt.run(...params);
        return [{ insertId: 0, affectedRows: info.changes }];
      }
    } catch (err) {
      console.error('DB Error:', err.message, '| SQL:', sql);
      throw err;
    }
  },

  // Expose raw sqlite instance for advanced usage
  raw: sqlite,
};

module.exports = db;