const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'public', 'Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed'));
    }
  },
});

class About {
  constructor(db) {
    this.db = db;
  }

  static async initializeTables(db) {
    try {
      const createProfileTable = `
        CREATE TABLE IF NOT EXISTS user_profile (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          bio TEXT NOT NULL,
          header_profile_picture VARCHAR(255) NOT NULL,
          about_profile_picture VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          location VARCHAR(255) NOT NULL,
          linkedin VARCHAR(255) NOT NULL,
          age INT NOT NULL,
          about_footer TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createSocialLinksTable = `
        CREATE TABLE IF NOT EXISTS social_links (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          platform VARCHAR(50) NOT NULL,
          url VARCHAR(255) NOT NULL,
          FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
        );
      `;

      const insertInitialData = `
        INSERT INTO user_profile (name, bio, header_profile_picture, about_profile_picture, email, phone, location, linkedin, age, about_footer)
        VALUES (
          'Abhay Chaudhary',
          'I am a passionate developer with experience in web and mobile technologies. Dedicated to creating impactful solutions.',
          '',
          '',
          'chaudharyabhay398@gmail.com',
          '+91 9335847162',
          'Basti [UP]',
          'linkedin.com/in/abhaychaudhary',
          28,
          'Available for freelance projects and collaborations.'
        )
        ON DUPLICATE KEY UPDATE name = name;
      `;

      const insertSocialLinks = `
        INSERT INTO social_links (user_id, platform, url)
        VALUES 
          (1, 'Twitter', 'https://twitter.com/abhaychaudhary'),
          (1, 'Facebook', 'https://facebook.com/abhaychaudhary'),
          (1, 'Instagram', 'https://instagram.com/abhaychaudhary'),
          (1, 'LinkedIn', 'https://linkedin.com/in/abhaychaudhary')
        ON DUPLICATE KEY UPDATE url = VALUES(url);
      `;

      await db.query('DELETE FROM social_links WHERE user_id = 1');
      await db.query(createProfileTable);
      await db.query(createSocialLinksTable);
      await db.query(insertInitialData);
      await db.query(insertSocialLinks);
      console.log('About tables and initial data created/verified');
    } catch (err) {
      console.error('Error initializing tables:', err);
      throw err;
    }
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

  async updateProfile(id, profileData) {
    const { name, bio, header_profile_picture, about_profile_picture, email, phone, location, linkedin, age, about_footer } = profileData;
    try {
      const [result] = await this.db.query(
        'UPDATE user_profile SET name = ?, bio = ?, header_profile_picture = ?, about_profile_picture = ?, email = ?, phone = ?, location = ?, linkedin = ?, age = ?, about_footer = ? WHERE id = ?',
        [name || '', bio || '', header_profile_picture || '', about_profile_picture || '', email || '', phone || '', location || '', linkedin || '', age || 0, about_footer || '', id]
      );
      return result;
    } catch (err) {
      console.error('Error updating profile:', err);
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

  async updateSocialLink(id, linkData) {
    const { user_id, platform, url } = linkData;
    try {
      const [result] = await this.db.query(
        'UPDATE social_links SET user_id = ?, platform = ?, url = ? WHERE id = ?',
        [user_id, platform, url || '', id]
      );
      return result;
    } catch (err) {
      console.error('Error updating social link:', err);
      throw err;
    }
  }

  setupRoutes(app) {
    app.use('/Uploads', express.static(uploadDir));

    app.get('/api/profile', async (req, res) => {
      try {
        const profile = await this.getProfile();
        res.json(profile);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/profile/:id', async (req, res) => {
      try {
        const result = await this.updateProfile(req.params.id, req.body);
        res.json(result);
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

    app.put('/api/social-links/:id', async (req, res) => {
      try {
        const result = await this.updateSocialLink(req.params.id, req.body);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/upload-header-picture', upload.single('header_profile_picture'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
      }
      res.json({ header_profile_picture: `/Uploads/${req.file.filename}` });
    });

    app.post('/api/upload-about-picture', upload.single('about_profile_picture'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
      }
      res.json({ about_profile_picture: `/Uploads/${req.file.filename}` });
    });
  }
}

module.exports = About;