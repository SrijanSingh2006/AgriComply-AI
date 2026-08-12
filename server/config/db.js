const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.VERCEL 
  ? path.join('/tmp', 'agricomply.db') 
  : path.join(__dirname, '..', 'agricomply.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// MySQL2-compatible wrapper so existing models work unchanged
// Models expect: const [rows] = await db.execute(sql, params);
const db = {
  execute: async (sql, params = []) => {
    // Replace MySQL NOW() with SQLite equivalent
    sql = sql.replace(/NOW\(\)/gi, "datetime('now')");
    
    const trimmed = sql.trim().toUpperCase();
    const isSelect = trimmed.startsWith('SELECT');
    
    try {
      if (isSelect) {
        const rows = sqlite.prepare(sql).all(...params);
        return [rows];
      } else {
        const result = sqlite.prepare(sql).run(...params);
        return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }];
      }
    } catch (err) {
      console.error('DB Error:', err.message, '| SQL:', sql);
      throw err;
    }
  },

  // Direct access for raw queries if needed
  raw: sqlite
};

module.exports = db;