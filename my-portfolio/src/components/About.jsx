import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/About.css';

function About() {
  const [user, setUser] = useState({
    name: '',
    bio: '',
    about_profile_picture: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    age: 0,
    about_footer: '',
  });

  const [socialLinks, setSocialLinks] = useState([
    { platform: 'Twitter', url: '' },
    { platform: 'Facebook', url: '' },
    { platform: 'Instagram', url: '' },
    { platform: 'LinkedIn', url: '' },
  ]);

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch('http://localhost:3000/api/profile', { cache: 'no-store' });
        if (!profileRes.ok) throw new Error(`Failed to fetch profile: ${profileRes.status}`);
        const profileData = await profileRes.json();
        setUser({
          name: profileData.name || '',
          bio: profileData.bio || '',
          about_profile_picture: profileData.about_profile_picture || '/Uploads/default-about.jpg',
          email: profileData.email || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          linkedin: profileData.linkedin || '',
          age: profileData.age || 0,
          about_footer: profileData.about_footer || '',
        });

        const linksRes = await fetch('http://localhost:3000/api/social-links/1', { cache: 'no-store' });
        if (!linksRes.ok) throw new Error(`Failed to fetch social links: ${linksRes.status}`);
        const linksData = await linksRes.json();
        const fixedPlatforms = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn'];
        const updatedLinks = fixedPlatforms.map((platform) => ({
          platform,
          url: linksData.find((link) => link.platform === platform)?.url || '',
        }));
        setSocialLinks(updatedLinks);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load data: ' + err.message);
      }
    };

    fetchData();
  }, []);

  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/Uploads/default-about.jpg';
    e.target.style.objectFit = 'contain';
    e.target.onerror = null;
  };

  return (
    <div id="about" className="about-page card-container">
      <motion.div
        className="about-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="card-heading">About Me</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="about-grid">
          <div className="about-left">
            <img
              src={user.about_profile_picture || '/Uploads/default-about.jpg'}
              alt="Profile"
              className="about-image"
              onError={handleImageError}
            />
          </div>
          <div className="about-right">
            <div className="about-details">
              <h3>Personal Info</h3>
              <p className="about-intro">Web Developer</p>
              <div className="info-lists">
                <ul>
                  <li><strong>Name:</strong> {user.name}</li>
                  <li><strong>Age:</strong> {user.age}</li>
                  <li><strong>Location:</strong> {user.location}</li>
                </ul>
                <ul>
                  <li><strong>Email:</strong> {user.email}</li>
                  <li><strong>Phone:</strong> {user.phone}</li>
                  <li><strong>LinkedIn:</strong> <a href={`https://${user.linkedin}`} target="_blank" rel="noopener noreferrer">{user.linkedin}</a></li>
                </ul>
              </div>
            </div>
            <div className="about-footer">{user.about_footer}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default About;