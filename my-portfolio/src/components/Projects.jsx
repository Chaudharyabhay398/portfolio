import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/projects', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
        const data = await res.json();
        setProjects(data);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load projects: ' + err.message);
      }
    };

    fetchProjects();
  }, []);

  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/Uploads/default-project.jpg';
    e.target.style.objectFit = 'contain';
    e.target.onerror = null; // Prevent infinite error loops
  };

  return (
    <div id = "projects" className="card-container">
      <motion.div
        className="projects-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="card-heading">My Projects</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <img
                src={project.image || '/Uploads/default-project.jpg'}
                alt={project.title}
                className="project-image"
                onError={handleImageError}
              />
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-links">
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  Live Demo
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Projects;