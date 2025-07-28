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

class Project {
  constructor(db) {
    this.db = db;
  }

  static async initializeTables(db) {
    try {
      // Drop the table if it exists to ensure a clean schema
      await db.query('DROP TABLE IF EXISTS projects');

      const createProjectsTable = `
        CREATE TABLE projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          image VARCHAR(255) NOT NULL,
          github VARCHAR(255) NOT NULL,
          demo VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const insertInitialData = `
        INSERT INTO projects (title, description, image, github, demo)
        VALUES
          (
            'Portfolio Website',
            'A responsive portfolio website showcasing personal projects, skills, and contact details.',
            '/Uploads/portfolio.png',
            'https://github.com/abhaychaudhary/portfolio',
            'https://abhaychaudhary.github.io/portfolio'
          ),
          (
            'Task Manager App',
            'A full-stack to-do application built using MERN stack for task management.',
            '/Uploads/task-manager.png',
            'https://github.com/abhaychaudhary/task-manager',
            'https://task-manager-demo.herokuapp.com'
          ),
          (
            'Weather Forecast App',
            'A weather app that provides current weather and forecasts using OpenWeather API.',
            '/Uploads/weather-app.png',
            'https://github.com/abhaychaudhary/weather-app',
            'https://weather-app-demo.herokuapp.com'
          )
        ON DUPLICATE KEY UPDATE title = title;
      `;

      await db.query(createProjectsTable);
      console.log('Projects table created');
      await db.query(insertInitialData);
      console.log('Initial project data inserted');
    } catch (err) {
      console.error('Error initializing projects table:', err);
      throw err;
    }
  }

  async getProjects() {
    try {
      const [rows] = await this.db.query('SELECT * FROM projects');
      return rows;
    } catch (err) {
      console.error('Error fetching projects:', err);
      throw err;
    }
  }

  async getProjectById(id) {
    try {
      const [rows] = await this.db.query('SELECT * FROM projects WHERE id = ?', [id]);
      return rows[0] || {};
    } catch (err) {
      console.error('Error fetching project:', err);
      throw err;
    }
  }

  async createProject(projectData) {
    const { title, description, image, github, demo } = projectData;
    try {
      const [result] = await this.db.query(
        'INSERT INTO projects (title, description, image, github, demo) VALUES (?, ?, ?, ?, ?)',
        [title || '', description || '', image || '', github || '', demo || '']
      );
      return { id: result.insertId, ...projectData };
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  }

  async updateProject(id, projectData) {
    const { title, description, image, github, demo } = projectData;
    try {
      const [result] = await this.db.query(
        'UPDATE projects SET title = ?, description = ?, image = ?, github = ?, demo = ? WHERE id = ?',
        [title || '', description || '', image || '', github || '', demo || '', id]
      );
      return result;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  }

  async deleteProject(id) {
    try {
      const [result] = await this.db.query('DELETE FROM projects WHERE id = ?', [id]);
      return result;
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  }

  setupRoutes(app) {
    app.get('/api/projects', async (req, res) => {
      try {
        const projects = await this.getProjects();
        res.json(projects);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/projects/:id', async (req, res) => {
      try {
        const project = await this.getProjectById(req.params.id);
        res.json(project);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/projects', async (req, res) => {
      try {
        const project = await this.createProject(req.body);
        res.status(201).json(project);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/projects/:id', async (req, res) => {
      try {
        const result = await this.updateProject(req.params.id, req.body);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/projects/:id', async (req, res) => {
      try {
        const result = await this.deleteProject(req.params.id);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/upload-project-image', upload.single('project_image'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
      }
      res.json({ project_image: `/Uploads/${req.file.filename}` });
    });
  }
}

module.exports = Project;