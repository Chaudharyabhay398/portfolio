import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Resume.css';

function Resume() {
  const [summary, setSummary] = useState({
    name: '',
    profession: '',
    bio: '',
    city: '',
    phone: '',
    email: ''
  });
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [experience, setExperience] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumeData = async () => {
      setIsLoading(true);
      try {
        const [summaryRes, educationRes, certificationsRes, experienceRes] = await Promise.all([
          fetch('http://localhost:3000/api/resume', { cache: 'no-store' }),
          fetch('http://localhost:3000/api/education', { cache: 'no-store' }),
          fetch('http://localhost:3000/api/certifications', { cache: 'no-store' }),
          fetch('http://localhost:3000/api/experience', { cache: 'no-store' }),
        ]);

        if (!summaryRes.ok) throw new Error(`Failed to fetch summary: ${summaryRes.status}`);
        if (!educationRes.ok) throw new Error(`Failed to fetch education: ${educationRes.status}`);
        if (!certificationsRes.ok) throw new Error(`Failed to fetch certifications: ${certificationsRes.status}`);
        if (!experienceRes.ok) throw new Error(`Failed to fetch experience: ${experienceRes.status}`);

        const [summaryData, educationData, certificationsData, experienceData] = await Promise.all([
          summaryRes.json(),
          educationRes.json(),
          certificationsRes.json(),
          experienceRes.json(),
        ]);

        setSummary(summaryData || {});
        setEducation(educationData || []);
        setCertifications(certificationsData || []);
        setExperience(experienceData || []);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load resume data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { 
      y: -5,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.3 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  return (
    <section id="resume" className="resume-page resume-container">
      <motion.div
        className="resume-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="card-heading">Resume</h2>

        {isLoading && (
          <motion.p
            className="text-gray-300 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Loading resume data...
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
            <p className="resume-intro text-center mb-8">
              {summary.bio || 'No bio available.'}
            </p>

            <div className="resume-grid">
              <div className="resume-left">
                <motion.div
                  className="resume-item"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <h3 className="text-2xl font-semibold mb-4">Summary</h3>
                  <motion.div variants={itemVariants}>
                    <h4 className="text-xl font-medium">{summary.name || 'Name not provided'}</h4>
                    <p className="">{summary.profession || 'Profession not provided'}</p>
                    <ul className="mt-3 space-y-1">
                      <li>{summary.city || 'Location not provided'}</li>
                      <li>{summary.phone || 'Phone not provided'}</li>
                      <li>
                        <a
                          href={summary.email ? `mailto:${summary.email}` : '#'}
                          className="hover:underline"
                        >
                          {summary.email || 'Email not provided'}
                        </a>
                      </li>
                    </ul>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="resume-item mt-6"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <h3 className="text-2xl font-semibold mb-4">Education</h3>
                  <AnimatePresence>
                    {education.length > 0 ? (
                      education.map((edu) => (
                        <motion.div
                          key={edu.id}
                          className="timeline-item mb-4 last:mb-0"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <h4 className="text-lg font-medium">{edu.degree}</h4>
                          <p className="">{`${edu.start_year} - ${edu.end_year || 'Present'}`}</p>
                          <p className="italic">{edu.institution}</p>
                          <p className="mt-1">{edu.description}</p>
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        className=""
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        No education entries available.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className="resume-right">
                <motion.div
                  className="resume-item"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <h3 className="text-2xl font-semibold mb-4">Certifications</h3>
                  <AnimatePresence>
                    {certifications.length > 0 ? (
                      certifications.map((cert) => (
                        <motion.div
                          key={cert.id}
                          className="timeline-item mb-4 last:mb-0"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <h4 className="text-lg font-medium">{cert.title}</h4>
                          <p className="">{cert.issue_date}</p>
                          <p className="italic">{cert.issuer}</p>
                          <p className="mt-1">{cert.description}</p>
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        className=""
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        No certifications available.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="resume-item mt-6"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <h3 className="text-2xl font-semibold mb-4">Professional Experience</h3>
                  <AnimatePresence>
                    {experience.length > 0 ? (
                      experience.map((exp) => (
                        <motion.div
                          key={exp.id}
                          className="timeline-item mb-4 last:mb-0"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <h4 className="text-lg font-medium">{exp.title}</h4>
                          <p className="">{`${exp.start_year} - ${exp.end_year || 'Present'}`}</p>
                          <p className="italic">{exp.company}</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {exp.description.split('. ').filter(point => point.trim()).map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        className=""
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        No professional experience available.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}

export default Resume;