const db = require('../config/db');

class User {
  static async create(name, email, password, role = 'Farmer') {
    return db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id',
      [name, email, password, role]
    );
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }
}

module.exports = User;