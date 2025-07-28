const mysql = require('mysql2/promise');

class Header {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    console.log('Header tables creation skipped; handled by About');
  }

  async getProfile() {
    try {
      const [rows] = await this.db.query('SELECT * FROM user_profile WHERE id = 1 LIMIT 1');
      return rows[0] || {};
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  }

  async getSocialLinks(userId) {
    try {
      const [rows] = await this.db.query('SELECT * FROM social_links WHERE user_id = ?', [userId]);
      return rows;
    } catch (err) {
      console.error('Error fetching social links:', err);
      throw err;
    }
  }

  setupRoutes(app) {
    app.get('/api/profile', async (req, res) => {
      try {
        const profile = await this.getProfile();
        res.json(profile);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/social-links/:userId', async (req, res) => {
      try {
        const links = await this.getSocialLinks(req.params.userId);
        res.json(links);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }
}

module.exports = Header;
