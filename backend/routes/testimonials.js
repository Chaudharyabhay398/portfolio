const mysql = require('mysql2/promise');

class Testimonials {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    try {
      await this.db.query('SELECT 1');
      console.log('Database connection verified for testimonials');

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id INT AUTO_INCREMENT PRIMARY KEY,
          content TEXT NOT NULL,
          author VARCHAR(100) NOT NULL,
          role VARCHAR(100) NOT NULL
        )
      `);
      console.log('Testimonials table created or already exists');

      const [rows] = await this.db.query('SELECT COUNT(*) as count FROM testimonials');
      if (rows[0].count === 0) {
        await this.db.query(`
          INSERT INTO testimonials (content, author, role) VALUES
          ('Amazing work on my website, highly professional and creative!', 'John Doe', 'CEO, TechCorp'),
          ('The app exceeded my expectations with its smooth performance.', 'Jane Smith', 'Product Manager'),
          ('Excellent design skills, made my project stand out!', 'Mike Johnson', 'Marketing Head'),
          ('Reliable and efficient cloud solutions, highly recommended.', 'Sarah Williams', 'CTO, Cloud Innovations'),
          ('Great support team, always there when I need them!', 'Robert Brown', 'Freelancer')
        `);
        console.log('Default testimonials inserted');
      } else {
        console.log('Testimonials table already contains data');
      }
    } catch (err) {
      console.error('Error initializing testimonials table:', err);
      throw new Error(`Failed to initialize testimonials table: ${err.message}`);
    }
  }

  setupRoutes(app) {
    // Get all testimonials
    app.get('/api/testimonials', async (req, res) => {
      try {
        const [rows] = await this.db.query('SELECT * FROM testimonials');
        res.json(rows);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        res.status(500).json({ error: `Failed to fetch testimonials: ${err.message}` });
      }
    });

    // Add a new testimonial
    app.post('/api/testimonials', async (req, res) => {
      const { content, author, role } = req.body;
      if (!content || !author || !role) {
        return res.status(400).json({ error: 'Content, author, and role are required' });
      }
      try {
        const [result] = await this.db.query(
          'INSERT INTO testimonials (content, author, role) VALUES (?, ?, ?)',
          [content, author, role]
        );
        res.json({ id: result.insertId, content, author, role });
      } catch (err) {
        console.error('Error adding testimonial:', err);
        res.status(500).json({ error: `Failed to add testimonial: ${err.message}` });
      }
    });

    // Update a testimonial
    app.put('/api/testimonials/:id', async (req, res) => {
      const { id } = req.params;
      const { content, author, role } = req.body;
      if (!content || !author || !role) {
        return res.status(400).json({ error: 'Content, author, and role are required' });
      }
      try {
        const [result] = await this.db.query(
          'UPDATE testimonials SET content = ?, author = ?, role = ? WHERE id = ?',
          [content, author, role, id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json({ id, content, author, role });
      } catch (err) {
        console.error('Error updating testimonial:', err);
        res.status(500).json({ error: `Failed to update testimonial: ${err.message}` });
      }
    });

    // Delete a testimonial
    app.delete('/api/testimonials/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const [result] = await this.db.query('DELETE FROM testimonials WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json({ message: 'Testimonial deleted successfully' });
      } catch (err) {
        console.error('Error deleting testimonial:', err);
        res.status(500).json({ error: `Failed to delete testimonial: ${err.message}` });
      }
    });
  }
}

module.exports = Testimonials;