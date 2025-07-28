const mysql = require('mysql2/promise');

class Services {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    try {
      await this.db.query('SELECT 1');
      console.log('Database connection verified for services');

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          description TEXT NOT NULL
        )
      `);
      console.log('Services table created or already exists');

      const [rows] = await this.db.query('SELECT COUNT(*) as count FROM services');
      if (rows[0].count === 0) {
        await this.db.query(`
          INSERT INTO services (title, description) VALUES
          ('Web Development', 'Building responsive and modern websites with the latest technologies.'),
          ('Mobile App Development', 'Creating intuitive and high-performance mobile applications.'),
          ('UI/UX Design', 'Designing user-friendly interfaces with a focus on experience.'),
          ('Cloud Solutions', 'Providing scalable and secure cloud-based services.'),
          ('Technical Support', 'Offering expert support and maintenance for your projects.')
        `);
        console.log('Default services inserted');
      } else {
        console.log('Services table already contains data');
      }
    } catch (err) {
      console.error('Error initializing services table:', err);
      throw new Error(`Failed to initialize services table: ${err.message}`);
    }
  }

  setupRoutes(app) {
    // Get all services
    app.get('/api/services', async (req, res) => {
      try {
        const [rows] = await this.db.query('SELECT * FROM services');
        res.json(rows);
      } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: `Failed to fetch services: ${err.message}` });
      }
    });

    // Add a new service
    app.post('/api/services', async (req, res) => {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }
      try {
        const [result] = await this.db.query(
          'INSERT INTO services (title, description) VALUES (?, ?)',
          [title, description]
        );
        res.json({ id: result.insertId, title, description });
      } catch (err) {
        console.error('Error adding service:', err);
        res.status(500).json({ error: `Failed to add service: ${err.message}` });
      }
    });

    // Update a service
    app.put('/api/services/:id', async (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }
      try {
        const [result] = await this.db.query(
          'UPDATE services SET title = ?, description = ? WHERE id = ?',
          [title, description, id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ id, title, description });
      } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ error: `Failed to update service: ${err.message}` });
      }
    });

    // Delete a service
    app.delete('/api/services/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const [result] = await this.db.query('DELETE FROM services WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
      } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ error: `Failed to delete service: ${err.message}` });
      }
    });
  }
}

module.exports = Services;