const mysql = require('mysql2/promise');
const express = require('express');
require('dotenv').config();

class VisitorCount {
  constructor(db) {
    this.db = db;
    this.router = express.Router();
  }

  async initializeTables() {
    try {
      const connection = await this.db.getConnection();
      await connection.query(`USE user_profile_db`);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS visitor_count (
          id INT PRIMARY KEY AUTO_INCREMENT,
          count INT NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      const [rows] = await connection.query('SELECT 1 FROM visitor_count WHERE id = 1');
      if (rows.length === 0) {
        await connection.query('INSERT INTO visitor_count (count) VALUES (0)');
      }
      connection.release();
      console.log('Visitor count table initialized successfully');
    } catch (err) {
      console.error('Error initializing visitor count table:', err.message);
      throw err;
    }
  }

  setupRoutes(app) {
    app.use('/api/visitor-count', this.router);

    this.router.get('/', async (req, res) => {
      try {
        const [rows] = await this.db.query('SELECT count FROM visitor_count WHERE id = 1');
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Visitor count not found' });
        }
        res.json({ count: rows[0].count });
      } catch (err) {
        console.error('Error fetching visitor count:', err.message);
        res.status(500).json({ error: 'Failed to fetch visitor count' });
      }
    });

    this.router.post('/', async (req, res) => {
      const { increment } = req.body;
      if (!increment) {
        return res.status(400).json({ error: 'Invalid request: increment field required' });
      }

      try {
        const [result] = await this.db.query(
          'UPDATE visitor_count SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Visitor count not found' });
        }
        const [rows] = await this.db.query('SELECT count FROM visitor_count WHERE id = 1');
        res.json({ count: rows[0].count });
      } catch (err) {
        console.error('Error incrementing visitor count:', err.message);
        res.status(500).json({ error: 'Failed to increment visitor count' });
      }
    });
  }
}

module.exports = VisitorCount;