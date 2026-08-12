const db = require('../config/db');

class Rules {
  static async getAllCompliance() {
    const [rows] = await db.execute('SELECT * FROM compliance_rules');
    return rows;
  }

  static async getAllSchemes() {
    const [rows] = await db.execute('SELECT * FROM schemes');
    return rows;
  }
}

module.exports = Rules;