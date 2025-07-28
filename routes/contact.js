class Contact {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS contact_info (
          id INT PRIMARY KEY,
          address VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          mapUrl TEXT NOT NULL
        )
      `);
      // Insert default contact info if not exists
      await this.db.query(`
        INSERT INTO contact_info (id, address, phone, email, mapUrl)
        VALUES (1, 'A108 Adam Street, New York, NY 535022', '+1 5589 55488 55', 'info@example.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.811727658067!2d-74.01322218459495!3d40.710451879330984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a175e5d6fa1%3A0x88eec7d7fdf0a9ec!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1614550682036!5m2!1sen!2sus')
        ON DUPLICATE KEY UPDATE id = id
      `);
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Contact tables initialized');
    } catch (err) {
      console.error('Error initializing contact tables:', err);
      throw err;
    }
  }

  setupRoutes(app) {
    // Get contact info
    app.get('/api/contact-info', async (req, res) => {
      try {
        const [rows] = await this.db.query('SELECT * FROM contact_info WHERE id = 1');
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Contact info not found' });
        }
        res.json(rows[0]);
      } catch (err) {
        console.error('Error fetching contact info:', err);
        res.status(500).json({ error: 'Failed to fetch contact info' });
      }
    });

    // Update contact info
    app.put('/api/contact-info', async (req, res) => {
      const { address, phone, email, mapUrl } = req.body;
      if (!address || !phone || !email || !mapUrl) {
        return res.status(400).json({ error: 'Address, phone, email, and mapUrl are required' });
      }
      try {
        const [result] = await this.db.query(
          `INSERT INTO contact_info (id, address, phone, email, mapUrl)
           VALUES (1, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           address = ?, phone = ?, email = ?, mapUrl = ?`,
          [address, phone, email, mapUrl, address, phone, email, mapUrl]
        );
        res.json({ id: 1, address, phone, email, mapUrl });
      } catch (err) {
        console.error('Error updating contact info:', err);
        res.status(500).json({ error: 'Failed to update contact info' });
      }
    });

    // Get all contact submissions
    app.get('/api/contact-submissions', async (req, res) => {
      try {
        const [submissions] = await this.db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
        res.json(submissions);
      } catch (err) {
        console.error('Error fetching contact submissions:', err);
        res.status(500).json({ error: 'Failed to fetch contact submissions' });
      }
    });

    // Create a new contact submission
    app.post('/api/contact-submissions', async (req, res) => {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Name, email, subject, and message are required' });
      }
      try {
        const [result] = await this.db.query(
          'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
          [name, email, subject, message]
        );
        res.status(201).json({ id: result.insertId, name, email, subject, message, created_at: new Date() });
      } catch (err) {
        console.error('Error creating contact submission:', err);
        res.status(500).json({ error: 'Failed to create contact submission' });
      }
    });
  }
}

module.exports = Contact;