const mysql = require('mysql2/promise');

class Skills {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    try {
      // Verify database connection
      await this.db.query('SELECT 1');
      console.log('Database connection verified');

      // Create skills table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          proficiency INT NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
          type ENUM('technical', 'soft') NOT NULL
        )
      `);
      console.log('Skills table created or already exists');

      // Check if table is empty and insert default data
      const [rows] = await this.db.query('SELECT COUNT(*) as count FROM skills');
      if (rows[0].count === 0) {
        await this.db.query(`
          INSERT INTO skills (name, proficiency, type) VALUES
          ('HTML', 80, 'technical'),
          ('Communication', 85, 'soft'),
          ('CSS', 80, 'technical'),
          ('Teamwork', 90, 'soft'),
          ('JavaScript', 80, 'technical')
        `);
        console.log('Default skills inserted');
      } else {
        console.log('Skills table already contains data');
      }
    } catch (err) {
      console.error('Error initializing skills table:', err);
      throw new Error(`Failed to initialize skills table: ${err.message}`);
    }
  }

  setupRoutes(app) {
    // Get all skills
    app.get('/api/skills', async (req, res) => {
      try {
        const [rows] = await this.db.query('SELECT * FROM skills');
        res.json(rows);
      } catch (err) {
        console.error('Error fetching skills:', err);
        res.status(500).json({ error: `Failed to fetch skills: ${err.message}` });
      }
    });

    // Add a new skill
    app.post('/api/skills', async (req, res) => {
      const { name, proficiency, type } = req.body;
      if (!name || !proficiency || !type || !['technical', 'soft'].includes(type)) {
        return res.status(400).json({ error: 'Name, proficiency (0-100), and type (technical/soft) are required' });
      }
      if (proficiency < 0 || proficiency > 100) {
        return res.status(400).json({ error: 'Proficiency must be between 0 and 100' });
      }
      try {
        const [result] = await this.db.query(
          'INSERT INTO skills (name, proficiency, type) VALUES (?, ?, ?)',
          [name, proficiency, type]
        );
        res.json({ id: result.insertId, name, proficiency, type });
      } catch (err) {
        console.error('Error adding skill:', err);
        res.status(500).json({ error: `Failed to add skill: ${err.message}` });
      }
    });

    // Update a skill
    app.put('/api/skills/:id', async (req, res) => {
      const { id } = req.params;
      const { name, proficiency, type } = req.body;
      if (!name || !proficiency || !type || !['technical', 'soft'].includes(type)) {
        return res.status(400).json({ error: 'Name, proficiency (0-100), and type (technical/soft) are required' });
      }
      if (proficiency < 0 || proficiency > 100) {
        return res.status(400).json({ error: 'Proficiency must be between 0 and 100' });
      }
      try {
        const [result] = await this.db.query(
          'UPDATE skills SET name = ?, proficiency = ?, type = ? WHERE id = ?',
          [name, proficiency, type, id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Skill not found' });
        }
        res.json({ id, name, proficiency, type });
      } catch (err) {
        console.error('Error updating skill:', err);
        res.status(500).json({ error: `Failed to update skill: ${err.message}` });
      }
    });

    // Delete a skill
    app.delete('/api/skills/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const [result] = await this.db.query('DELETE FROM skills WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Skill not found' });
        }
        res.json({ message: 'Skill deleted successfully' });
      } catch (err) {
        console.error('Error deleting skill:', err);
        res.status(500).json({ error: `Failed to delete skill: ${err.message}` });
      }
    });
  }
}

module.exports = Skills;