const path = require('path');
const db = require('../config/db');

const presentDocument = (doc) => {
  const storedFilename = doc.stored_filename || doc.file_path || '';
  const filename = doc.file_name || doc.original_filename || doc.filename || storedFilename;
  const extension = path.extname(filename || storedFilename).toLowerCase();

  return {
    ...doc,
    filename,
    stored_filename: storedFilename,
    type: extension === '.pdf' ? 'application/pdf' : 'image/jpeg',
    size: 0,
  };
};

class Document {
  static async create(data) {
    const storedFilename = data.storedFilename || data.filename;
    const originalFilename = data.originalFilename || data.filename || storedFilename;
    const sql = `
      INSERT INTO documents (user_id, file_name, file_path, tag)
      VALUES (?, ?, ?, ?)
      RETURNING id
    `;
    const [result] = await db.execute(sql, [
      data.user_id,
      originalFilename,
      storedFilename,
      data.tag,
    ]);

    return { id: result.insertId, ...data, filename: originalFilename, stored_filename: storedFilename };
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT id, user_id, file_name, file_path AS stored_filename, tag, upload_date
      FROM documents
      WHERE user_id = ?
      ORDER BY upload_date DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows.map(presentDocument);
  }

  static async findById(id) {
    const sql = `
      SELECT id, user_id, file_name, file_path AS stored_filename, tag, upload_date
      FROM documents
      WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows.length ? presentDocument(rows[0]) : null;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM documents WHERE id = ?', [id]);
    return result;
  }

  static async update(id, data) {
    const storedFilename = data.storedFilename || data.filename;
    const originalFilename = data.originalFilename || data.filename || storedFilename;
    const sql = `
      UPDATE documents
      SET file_name = ?, file_path = ?, upload_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [originalFilename, storedFilename, id]);
    return result;
  }
}

module.exports = Document;
