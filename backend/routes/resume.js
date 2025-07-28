const mysql = require('mysql2/promise');

class Resume {
  constructor(db) {
    this.db = db;
  }

  static async initializeTables(db) {
    try {
      // Drop tables for clean schema (remove after first run)
      await db.query('DROP TABLE IF EXISTS resume_summary, education, certifications, experience');

      const createSummaryTable = `
        CREATE TABLE IF NOT EXISTS resume_summary (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          profession VARCHAR(255) NOT NULL,
          bio TEXT NOT NULL,
          city VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createEducationTable = `
        CREATE TABLE IF NOT EXISTS education (
          id INT AUTO_INCREMENT PRIMARY KEY,
          degree VARCHAR(255) NOT NULL,
          start_year VARCHAR(4) NOT NULL,
          end_year VARCHAR(4),
          institution VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createCertificationsTable = `
        CREATE TABLE IF NOT EXISTS certifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          issuer VARCHAR(255) NOT NULL,
          issue_date VARCHAR(10) NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

   const createExperienceTable = `
  CREATE TABLE IF NOT EXISTS experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_year VARCHAR(4) NOT NULL,
    end_year VARCHAR(10), -- Updated from VARCHAR(4) to VARCHAR(10)
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

      const insertSummaryData = `
        INSERT INTO resume_summary (name, profession, bio, city, phone, email)
        VALUES (
          'Abhay Chaudhary',
          'Innovative and deadline-driven Developer',
          'Passionate developer with a track record of delivering innovative and user-focused web solutions.',
          'New Delhi, India',
          '+91 9876543210',
          'abhay@example.com'
        );
      `;

      const insertEducationData = `
        INSERT INTO education (degree, start_year, end_year, institution, description)
        VALUES
          ('B.Tech in Computer Science', '2016', '2020', 'XYZ University', 'Graduated with honors, specializing in software engineering.'),
          ('M.Tech in AI', '2021', '2023', 'ABC Institute', 'Focused on machine learning and data science.');
      `;

      const insertCertificationsData = `
        INSERT INTO certifications (title, issuer, issue_date, description)
        VALUES
          ('AWS Certified Developer', 'Amazon', '2022-06', 'Certified in cloud development.'),
          ('React Professional', 'Udemy', '2021-12', 'Advanced React and Redux.');
      `;

      const insertExperienceData = `
        INSERT INTO experience (title, company, start_year, end_year, description)
        VALUES
          ('Software Engineer', 'Tech Studio', '2020', '2022', 'Developed and maintained responsive web interfaces. Worked on cross-browser compatibility and performance optimization.'),
          ('Senior Developer', 'Innovate Solutions', '2022', 'Present', 'Led a team to build scalable web applications. Implemented CI/CD pipelines.');
      `;

      await db.query(createSummaryTable);
      await db.query(createEducationTable);
      await db.query(createCertificationsTable);
      await db.query(createExperienceTable);
      console.log('Resume tables created');

      await db.query(insertSummaryData);
      await db.query(insertEducationData);
      await db.query(insertCertificationsData);
      await db.query(insertExperienceData);
      console.log('Initial resume data inserted');
    } catch (err) {
      console.error('Error initializing resume tables:', err);
      throw err;
    }
  }

  async getSummary() {
    try {
      const [rows] = await this.db.query('SELECT * FROM resume_summary LIMIT 1');
      if (!rows.length) {
        // Insert default summary if none exists
        await this.db.query(`
          INSERT INTO resume_summary (name, profession, bio, city, phone, email)
          VALUES ('', '', '', '', '', '')
        `);
        const [newRows] = await this.db.query('SELECT * FROM resume_summary LIMIT 1');
        return newRows[0] || {};
      }
      return rows[0] || {};
    } catch (err) {
      console.error('Error fetching resume summary:', err);
      throw err;
    }
  }

  async updateSummary(summaryData) {
    const { name, profession, bio, city, phone, email } = summaryData;
    if (!name || !profession || !bio || !city || !phone || !email) {
      throw new Error('All summary fields are required');
    }
    try {
      const [result] = await this.db.query(
        'UPDATE resume_summary SET name = ?, profession = ?, bio = ?, city = ?, phone = ?, email = ? WHERE id = 1',
        [name, profession, bio, city, phone, email]
      );
      if (result.affectedRows === 0) {
        await this.db.query(
          'INSERT INTO resume_summary (id, name, profession, bio, city, phone, email) VALUES (1, ?, ?, ?, ?, ?, ?)',
          [name, profession, bio, city, phone, email]
        );
      }
      return { affectedRows: 1 };
    } catch (err) {
      console.error('Error updating resume summary:', err);
      throw err;
    }
  }

  async getEducation() {
    try {
      const [rows] = await this.db.query('SELECT * FROM education ORDER BY start_year DESC');
      return rows;
    } catch (err) {
      console.error('Error fetching education:', err);
      throw err;
    }
  }

  async createEducation(educationData) {
    const { degree, start_year, end_year, institution, description } = educationData;
    if (!degree || !start_year || !institution || !description) {
      throw new Error('Degree, start year, institution, and description are required');
    }
    if (!/^\d{4}$/.test(start_year) || (end_year && !/^\d{4}$/.test(end_year) && end_year !== 'Present')) {
      throw new Error('Start year and end year must be valid years or "Present"');
    }
    try {
      const [result] = await this.db.query(
        'INSERT INTO education (degree, start_year, end_year, institution, description) VALUES (?, ?, ?, ?, ?)',
        [degree, start_year, end_year || null, institution, description]
      );
      return { id: result.insertId, ...educationData };
    } catch (err) {
      console.error('Error creating education:', err);
      throw err;
    }
  }

  async updateEducation(id, educationData) {
    const { degree, start_year, end_year, institution, description } = educationData;
    if (!degree || !start_year || !institution || !description) {
      throw new Error('Degree, start year, institution, and description are required');
    }
    if (!/^\d{4}$/.test(start_year) || (end_year && !/^\d{4}$/.test(end_year) && end_year !== 'Present')) {
      throw new Error('Start year and end year must be valid years or "Present"');
    }
    try {
      const [result] = await this.db.query(
        'UPDATE education SET degree = ?, start_year = ?, end_year = ?, institution = ?, description = ? WHERE id = ?',
        [degree, start_year, end_year || null, institution, description, id]
      );
      return result;
    } catch (err) {
      console.error('Error updating education:', err);
      throw err;
    }
  }

  async deleteEducation(id) {
    try {
      const [result] = await this.db.query('DELETE FROM education WHERE id = ?', [id]);
      return result;
    } catch (err) {
      console.error('Error deleting education:', err);
      throw err;
    }
  }

  async getCertifications() {
    try {
      const [rows] = await this.db.query('SELECT * FROM certifications ORDER BY issue_date DESC');
      return rows;
    } catch (err) {
      console.error('Error fetching certifications:', err);
      throw err;
    }
  }

  async createCertification(certificationData) {
    const { title, issuer, issue_date, description } = certificationData;
    if (!title || !issuer || !issue_date || !description) {
      throw new Error('Title, issuer, issue date, and description are required');
    }
    if (!/^\d{4}-\d{2}$/.test(issue_date)) {
      throw new Error('Issue date must be in YYYY-MM format');
    }
    try {
      const [result] = await this.db.query(
        'INSERT INTO certifications (title, issuer, issue_date, description) VALUES (?, ?, ?, ?)',
        [title, issuer, issue_date, description]
      );
      return { id: result.insertId, ...certificationData };
    } catch (err) {
      console.error('Error creating certification:', err);
      throw err;
    }
  }

  async updateCertification(id, certificationData) {
    const { title, issuer, issue_date, description } = certificationData;
    if (!title || !issuer || !issue_date || !description) {
      throw new Error('Title, issuer, issue date, and description are required');
    }
    if (!/^\d{4}-\d{2}$/.test(issue_date)) {
      throw new Error('Issue date must be in YYYY-MM format');
    }
    try {
      const [result] = await this.db.query(
        'UPDATE certifications SET title = ?, issuer = ?, issue_date = ?, description = ? WHERE id = ?',
        [title, issuer, issue_date, description, id]
      );
      return result;
    } catch (err) {
      console.error('Error updating certification:', err);
      throw err;
    }
  }

  async deleteCertification(id) {
    try {
      const [result] = await this.db.query('DELETE FROM certifications WHERE id = ?', [id]);
      return result;
    } catch (err) {
      console.error('Error deleting certification:', err);
      throw err;
    }
  }

  async getExperience() {
    try {
      const [rows] = await this.db.query('SELECT * FROM experience ORDER BY start_year DESC');
      return rows;
    } catch (err) {
      console.error('Error fetching experience:', err);
      throw err;
    }
  }

  async createExperience(experienceData) {
    const { title, company, start_year, end_year, description } = experienceData;
    if (!title || !company || !start_year || !description) {
      throw new Error('Title, company, start year, and description are required');
    }
    if (!/^\d{4}$/.test(start_year) || (end_year && !/^\d{4}$/.test(end_year) && end_year !== 'Present')) {
      throw new Error('Start year and end year must be valid years or "Present"');
    }
    try {
      const [result] = await this.db.query(
        'INSERT INTO experience (title, company, start_year, end_year, description) VALUES (?, ?, ?, ?, ?)',
        [title, company, start_year, end_year || null, description]
      );
      return { id: result.insertId, ...experienceData };
    } catch (err) {
      console.error('Error creating experience:', err);
      throw err;
    }
  }

  async updateExperience(id, experienceData) {
    const { title, company, start_year, end_year, description } = experienceData;
    if (!title || !company || !start_year || !description) {
      throw new Error('Title, company, start year, and description are required');
    }
    if (!/^\d{4}$/.test(start_year) || (end_year && !/^\d{4}$/.test(end_year) && end_year !== 'Present')) {
      throw new Error('Start year and end year must be valid years or "Present"');
    }
    try {
      const [result] = await this.db.query(
        'UPDATE experience SET title = ?, company = ?, start_year = ?, end_year = ?, description = ? WHERE id = ?',
        [title, company, start_year, end_year || null, description, id]
      );
      return result;
    } catch (err) {
      console.error('Error updating experience:', err);
      throw err;
    }
  }

  async deleteExperience(id) {
    try {
      const [result] = await this.db.query('DELETE FROM experience WHERE id = ?', [id]);
      return result;
    } catch (err) {
      console.error('Error deleting experience:', err);
      throw err;
    }
  }

  setupRoutes(app) {
    app.get('/api/resume', async (req, res) => {
      try {
        const summary = await this.getSummary();
        res.json(summary);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/resume', async (req, res) => {
      try {
        const result = await this.updateSummary(req.body);
        res.json(result);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.get('/api/education', async (req, res) => {
      try {
        const education = await this.getEducation();
        res.json(education);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/education', async (req, res) => {
      try {
        const education = await this.createEducation(req.body);
        res.status(201).json(education);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.put('/api/education/:id', async (req, res) => {
      try {
        const result = await this.updateEducation(req.params.id, req.body);
        res.json(result);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete('/api/education/:id', async (req, res) => {
      try {
        const result = await this.deleteEducation(req.params.id);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/certifications', async (req, res) => {
      try {
        const certifications = await this.getCertifications();
        res.json(certifications);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/certifications', async (req, res) => {
      try {
        const certification = await this.createCertification(req.body);
        res.status(201).json(certification);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.put('/api/certifications/:id', async (req, res) => {
      try {
        const result = await this.updateCertification(req.params.id, req.body);
        res.json(result);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete('/api/certifications/:id', async (req, res) => {
      try {
        const result = await this.deleteCertification(req.params.id);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/experience', async (req, res) => {
      try {
        const experience = await this.getExperience();
        res.json(experience);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/experience', async (req, res) => {
      try {
        const experience = await this.createExperience(req.body);
        res.status(201).json(experience);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.put('/api/experience/:id', async (req, res) => {
      try {
        const result = await this.updateExperience(req.params.id, req.body);
        res.json(result);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete('/api/experience/:id', async (req, res) => {
      try {
        const result = await this.deleteExperience(req.params.id);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }
}

module.exports = Resume;