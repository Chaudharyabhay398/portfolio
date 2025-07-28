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

// Logging function with timestamp and log level
const log = (level, message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
};

// Log server start
log('INFO', 'Starting server initialization');

// Log environment variables (masking sensitive data)
log('INFO', `Environment variables: MYSQL_HOST=${process.env.MYSQL_HOST}, MYSQL_USER=${process.env.MYSQL_USER}, MYSQL_DATABASE=${process.env.MYSQL_DATABASE || 'undefined'}, PORT=${process.env.PORT || 'undefined'}`);

async function initializeServer() {
  try {
    // Initial connection to create database if it doesn't exist
    log('INFO', 'Attempting initial MySQL connection');
    const initialDb = await mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '9335',
      multipleStatements: true,
    });

    log('INFO', 'Connected to MySQL for initial setup');
    await initialDb.query('CREATE DATABASE IF NOT EXISTS user_profile_db');
    log('INFO', 'Database user_profile_db created or already exists');

    // Close initial connection
    await initialDb.end();
    log('INFO', 'Initial MySQL connection closed');

    // Main database connection
    log('INFO', 'Connecting to database user_profile_db');
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

    log('INFO', 'Connected to MySQL Server with database user_profile_db');

    // Initialize classes
    log('INFO', 'Initializing route modules');
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
    log('INFO', 'All route modules initialized');

    // Initialize tables with error handling
    log('INFO', 'Initializing tables for all modules');
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
      log('INFO', `Initializing ${name} tables`);
      try {
        await instance.initializeTables();
        log('INFO', `${name} tables initialized successfully`);
      } catch (err) {
        log('ERROR', `Error initializing ${name} tables: ${err.message}`);
        tableInitializationErrors.push(`${name}: ${err.message}`);
      }
    }

    if (tableInitializationErrors.length > 0) {
      log('WARN', `Some table initializations failed: ${tableInitializationErrors.join(' | ')}`);
    } else {
      log('INFO', 'All tables initialized successfully');
    }

    // Setup routes
    log('INFO', 'Setting up routes');
    try {
      modules.forEach(({ name, instance }) => {
        log('INFO', `Setting up routes for ${name}`);
        instance.setupRoutes(app);
        log('INFO', `Routes for ${name} set up successfully`);
      });
    } catch (err) {
      log('ERROR', `Route setup error: ${err.message}`);
      throw err; // Re-throw to halt server startup if route setup fails
    }

    // Start server with port conflict handling
    const PORT = process.env.PORT || 3000;
    let currentPort = PORT;

    log('INFO', `Attempting to start server on port ${currentPort}`);
    const startServer = (port) => {
      const server = app.listen(port, () => {
        log('INFO', `Server running on port ${port}`);
      });
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log('WARN', `Port ${port} is in use. Trying port ${port + 1}...`);
          currentPort = port + 1;
          server.close();
          startServer(currentPort);
        } else {
          log('ERROR', `Server error: ${err.message}`);
          process.exit(1);
        }
      });
    };

    startServer(PORT);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      log('INFO', 'Shutting down server...');
      await db.end();
      log('INFO', 'Database connection closed');
      process.exit(0);
    });
  } catch (err) {
    log('ERROR', `Server initialization error: ${err.message}`);
    process.exit(1);
  }
}

initializeServer();
