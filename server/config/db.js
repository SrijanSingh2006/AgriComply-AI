const { dbPath } = require('./storage');

let ready = Promise.resolve();
let db;

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PGPOOL_MAX || 3),
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
  });

  db = {
    isPostgres: true,
    raw: pool,
    setReady(promise) {
      ready = promise;
    },
    waitReady: () => ready,
    execute: async (sql, params = []) => {
      try {
        await ready;
        let index = 0;
        const postgresSql = sql.replace(/\?/g, () => `$${++index}`);
        const result = await pool.query(postgresSql, params);

        if (/^\s*(SELECT|WITH)\b/i.test(sql)) {
          return [result.rows];
        }

        return [{
          insertId: result.rows?.[0]?.id || 0,
          affectedRows: result.rowCount || 0,
        }];
      } catch (err) {
        console.error('DB Error:', err.message, '| SQL:', sql);
        throw err;
      }
    },
  };
} else {
  const Database = require('better-sqlite3');
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');

  db = {
    isPostgres: false,
    raw: sqlite,
    setReady(promise) {
      ready = promise;
    },
    waitReady: () => ready,
    execute: async (sql, params = []) => {
      try {
        await ready;
        const trimmed = sql.trim().toUpperCase();

        if (trimmed.startsWith('SELECT')) {
          const stmt = sqlite.prepare(sql);
          return [stmt.all(...params)];
        }

        if (trimmed.startsWith('INSERT')) {
          const cleanSql = sql.replace(/\s+RETURNING\s+\w+/i, '');
          const info = sqlite.prepare(cleanSql).run(...params);
          return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
        }

        const info = sqlite.prepare(sql).run(...params);
        return [{ insertId: 0, affectedRows: info.changes }];
      } catch (err) {
        console.error('DB Error:', err.message, '| SQL:', sql);
        throw err;
      }
    },
  };
}

module.exports = db;
