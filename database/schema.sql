CREATE DATABASE portfolio_db;
USE portfolio_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  email VARCHAR(255),
  github VARCHAR(255),
  linkedin VARCHAR(255),
  profile_picture VARCHAR(255)
);

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  proficiency INT NOT NULL
);

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  demo_link VARCHAR(255),
  github_link VARCHAR(255)
);

CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  role VARCHAR(255)
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Sample Data
INSERT INTO users (name, bio, email, github, linkedin, profile_picture) VALUES
('John Doe', 'Full-stack developer with 5 years of experience in building web applications.', 'john.doe@example.com', 'https://github.com/johndoe', 'https://linkedin.com/in/johndoe', 'https://example.com/profile.jpg');

INSERT INTO skills (name, proficiency) VALUES
('React', 90),
('Node.js', 85),
('MySQL', 80),
('Tailwind CSS', 95);

INSERT INTO projects (title, description, image, demo_link, github_link) VALUES
('E-commerce Platform', 'A full-stack e-commerce app built with React and Node.js.', 'https://example.com/project1.jpg', 'https://demo1.com', 'https://github.com/johndoe/project1'),
('Portfolio Website', 'A personal portfolio website with dynamic content.', 'https://example.com/project2.jpg', 'https://demo2.com', 'https://github.com/johndoe/project2');

INSERT INTO testimonials (author, content, role) VALUES
('Jane Smith', 'John delivered an amazing project on time!', 'Client'),
('Mike Johnson', 'Highly skilled and professional developer.', 'Colleague');

INSERT INTO services (title, description) VALUES
('Web Development', 'Building responsive and modern web applications.'),
('Backend API', 'Creating secure and scalable RESTful APIs.');

INSERT INTO admins (admin_id, password) VALUES
('admin123', '$2a$10$J9z3X8y7Zx2W1qK5vJ9z3eJ9z3X8y7Zx2W1qK5vJ9z3eJ9z3X8y7');
-- Password is 'adminpass' (hashed with bcrypt)