const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const About = require('./routes/about');
const Header = require('./routes/header');
const Project = require('./routes/Project');
const Resume = require('./routes/resume');
const Skills = require('./routes/skills');
const Services = require('./routes/services');
const Testimonials = require('./routes/testimonials');
const Contact = require('./routes/contact');
const VisitorCount = require('./routes/visitorCount');
const Admin = require('./routes/login');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

async function initializeServer() {
  try {
    // Initial connection to create database if it doesn't exist
    const initialDb = await mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '9335',
      multipleStatements: true,
    });

    console.log('Connected to MySQL for initial setup');
    await initialDb.query('CREATE DATABASE IF NOT EXISTS user_profile_db');
    console.log('Database user_profile_db created or already exists');

    // Main database connection
    const db = await mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'user_profile_db',
      multipleStatements: true,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });

    console.log('Connected to MySQL Server!');

    // Initialize classes
    const about = new About(db);
    const header = new Header(db);
    const project = new Project(db);
    const resume = new Resume(db);
    const skills = new Skills(db);
    const services = new Services(db);
    const testimonials = new Testimonials(db);
    const contact = new Contact(db);
    const visitorCount = new VisitorCount(db);
    const admin = new Admin(db);

    // Initialize tables with error handling
    const tableInitializationErrors = [];
    const modules = [
      { name: 'About', instance: about },
      { name: 'Header', instance: header },
      { name: 'Project', instance: project },
      { name: 'Resume', instance: resume },
      { name: 'Skills', instance: skills },
      { name: 'Services', instance: services },
      { name: 'Testimonials', instance: testimonials },
      { name: 'Contact', instance: contact },
      { name: 'VisitorCount', instance: visitorCount },
      { name: 'Admin', instance: admin },
    ];

    for (const { name, instance } of modules) {
      try {
        await instance.initializeTables();
        console.log(`${name} tables initialized`);
      } catch (err) {
        console.error(`Error initializing ${name} tables:`, err.message);
        tableInitializationErrors.push(`${name}: ${err.message}`);
      }
    }

    if (tableInitializationErrors.length > 0) {
      console.warn('Some table initializations failed:', tableInitializationErrors.join(' | '));
    } else {
      console.log('All tables initialized successfully');
    }

    // Setup routes
    modules.forEach(({ instance }) => instance.setupRoutes(app));

    // Start server with port conflict handling
    const PORT = process.env.PORT || 3000;
    let currentPort = PORT;

    const startServer = (port) => {
      const server = app.listen(port, () => console.log(`Server running on port ${port}`));
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} is in use. Trying port ${port + 1}...`);
          currentPort = port + 1;
          server.close();
          startServer(currentPort);
        } else {
          console.error('Server error:', err.message);
          process.exit(1);
        }
      });
    };

    startServer(PORT);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Shutting down server...');
      await db.end();
      process.exit(0);
    });
  } catch (err) {
    console.error('Server initialization error:', err.message);
    process.exit(1);
  }
}

initializeServer();
