const db = require('../config/db');

class Document {
  // 1. Create (Upload)
  static async create(data) {
    // REMOVED 'type' and 'size' from INSERT
    // We only insert columns we know exist: user_id, file_path, tag
    const sql = `INSERT INTO documents (user_id, file_path, tag) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.user_id, 
      data.filename, // mapped to file_path
      data.tag
    ]);
    return { id: result.insertId, ...data };
  }

  // 2. Find All by User
  static async findByUserId(userId) {
    // REMOVED 'type' and 'size' from SELECT
    // Added logic to mock 'type' for the frontend based on extension
    const sql = `SELECT id, user_id, file_path as filename, tag, upload_date FROM documents WHERE user_id = ? ORDER BY upload_date DESC`;
    const [rows] = await db.execute(sql, [userId]);
    
    // Helper: Add a fake 'type' property so frontend icons still work
    return rows.map(doc => ({
        ...doc,
        type: doc.filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        size: 0 // Mock size since DB column is missing
    }));
  }

  // 3. Find Single File by ID
  static async findById(id) {
    const sql = `SELECT id, user_id, file_path as filename, tag, upload_date FROM documents WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    
    if (rows.length > 0) {
        const doc = rows[0];
        return {
            ...doc,
            type: doc.filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
            size: 0
        };
    }
    return null;
  }

  // 4. Delete File
  static async delete(id) {
    const sql = `DELETE FROM documents WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  }

  // 5. Update (Replace) File
  static async update(id, data) {
    // REMOVED 'type' and 'size' from UPDATE
    const sql = `UPDATE documents SET file_path = ?, upload_date = NOW() WHERE id = ?`;
    const [result] = await db.execute(sql, [
      data.filename, 
      id
    ]);
    return result;
  }
}

module.exports = Document;