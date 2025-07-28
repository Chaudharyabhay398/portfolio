import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../styles/Skills.css';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/skills', { cache: 'no-store' });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Skills API not found. Please check the backend server.');
          }
          throw new Error(`Failed to fetch skills: ${response.status}`);
        }
        const data = await response.json();
        setSkills(data || []);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const technicalSkills = skills.filter((skill) => skill.type === 'technical');
  const softSkills = skills.filter((skill) => skill.type === 'soft');

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { 
      y: -5,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.3 }
    },
  };

  return (
    <section id="skills" className="card-container">
      <motion.div
        className="skills-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="card-heading">Skills</h2>

        {isLoading && (
          <motion.p
            className="text-gray-300 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Loading skills...
          </motion.p>
        )}

        {error && (
          <motion.p
            className="error-message text-center mb-8 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}

        {!isLoading && !error && (
          <>
            <p className="skills-intro text-center mb-8">
              Proficient in modern web technologies with a focus on creating responsive and user-friendly interfaces.
            </p>

            <div className="skills-grid">
              <div className="skills-left">
                <h3 className="text-2xl font-semibold mb-4">Technical Skills</h3>
                {technicalSkills.length > 0 ? (
                  technicalSkills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      className="skill-item"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <div className="skill-header">
                        <span>{skill.name}</span>
                        <span>{skill.proficiency}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill technical"
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400">No technical skills available.</p>
                )}
              </div>
              <div className="skills-right">
                <h3 className="text-2xl font-semibold mb-4">Soft Skills</h3>
                {softSkills.length > 0 ? (
                  softSkills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      className="skill-item"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <div className="skill-header">
                        <span>{skill.name}</span>
                        <span>{skill.proficiency}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill soft"
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400">No soft skills available.</p>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}

export default Skills;