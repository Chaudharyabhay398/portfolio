import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaHome, FaUser, FaFileAlt, FaTools, FaBriefcase, FaCogs, FaComment, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  const [user, setUser] = useState({
    name: '',
    bio: '',
    header_profile_picture: '',
    designation: '',
  });

  const [socialLinks, setSocialLinks] = useState([
    { platform: 'Twitter', url: '' },
    { platform: 'Facebook', url: '' },
    { platform: 'Instagram', url: '' },
    { platform: 'LinkedIn', url: '' },
  ]);

  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch('http://localhost:3000/api/profile', { cache: 'no-store' });
        if (!profileRes.ok) throw new Error(`Failed to fetch profile: ${profileRes.status}`);
        const profileData = await profileRes.json();
        setUser({
          name: profileData.name || '',
          bio: profileData.bio || '',
          header_profile_picture: profileData.header_profile_picture || '/Uploads/default-header.jpg',
          designation: profileData.designation || 'Designation not available',
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
        setError('Failed to load header data: ' + err.message);
      }
    };

    fetchData();
  }, []);

  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/Uploads/default-header.jpg';
    e.target.style.objectFit = 'contain';
    e.target.onerror = null;
  };

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    if (sectionId === 'home') {
      window.location.href = '/'; // Refresh and redirect to main dashboard
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setExpanded(false);
      } else {
        console.error(`Section with ID "${sectionId}" not found. Add <div id="${sectionId}"> to the corresponding component.`);
      }
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    navigate('/admin-login'); // Redirect to login page
    setExpanded(false);
  };

  const handleProfileClick = () => {
    alert('Profile clicked! Implement modal or page navigation here.'); // Placeholder for profile action
  };

  return (
    <>
      <header className="sidebar d-none d-md-block">
        <div className="sidebar-container">
          <div className="profile">
            <img
              src={user.header_profile_picture || '/Uploads/default-header.jpg'}
              alt="Profile"
              onError={handleImageError}
              className="profile-image"
              onClick={handleProfileClick}
            />
           
            <p>{user.bio || 'Bio not available'}</p>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="social-icons">
            {socialLinks.map((link) => (
              <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.platform === 'LinkedIn' && <FaLinkedin size={24} />}
                {link.platform === 'Twitter' && <FaTwitter size={24} />}
                {link.platform === 'Facebook' && <FaFacebook size={24} />}
                {link.platform === 'Instagram' && <FaInstagram size={24} />}
              </a>
            ))}
          </div>

          <nav className="nav-links">
            <a href="#home" onClick={(e) => handleSectionClick(e, 'home')}>
              <FaHome className="icon" /> <span>Home</span>
            </a>
            <a href="#about" onClick={(e) => handleSectionClick(e, 'about')}>
              <FaUser className="icon" /> <span>About</span>
            </a>
            <a href="#resume" onClick={(e) => handleSectionClick(e, 'resume')}>
              <FaFileAlt className="icon" /> <span>Resume</span>
            </a>
            <a href="#skills" onClick={(e) => handleSectionClick(e, 'skills')}>
              <FaTools className="icon" /> <span>Skills</span>
            </a>
            <a href="#projects" onClick={(e) => handleSectionClick(e, 'projects')}>
              <FaBriefcase className="icon" /> <span>Projects</span>
            </a>
            <a href="#services" onClick={(e) => handleSectionClick(e, 'services')}>
              <FaCogs className="icon" /> <span>Services</span>
            </a>
            <a href="#testimonials" onClick={(e) => handleSectionClick(e, 'testimonials')}>
              <FaComment className="icon" /> <span>Testimonials</span>
            </a>
            <a href="#contact" onClick={(e) => handleSectionClick(e, 'contact')}>
              <FaEnvelope className="icon" /> <span>Contact</span>
            </a>
            <a href="#admin-login" onClick={handleAdminClick}>
              <FaShieldAlt className="icon" /> <span>Admin</span>
            </a>
          </nav>
        </div>
      </header>

      <Navbar expand="md" expanded={expanded} onToggle={() => setExpanded(!expanded)} className="d-md-none navbar-custom">
        <Container>
          <div className="profile d-flex align-items-center flex-wrap">
            <img
              src={user.header_profile_picture || '/Uploads/default-header.jpg'}
              alt="Profile"
              onError={handleImageError}
              className="profile-image me-2"
              style={{ width: '80px', height: '80px' }}
              onClick={handleProfileClick}
            />
            <div className="me-2">
              <h1 className="mb-0" style={{ fontSize: '1.2rem' }}>{user.name || 'User Name'}</h1>
              <p className="mb-1" style={{ fontSize: '0.9rem' }}>{user.bio || 'Bio not available'}</p>
              <div className="social-icons d-flex">
                {socialLinks.map((link) => (
                  <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="me-2">
                    {link.platform === 'LinkedIn' && <FaLinkedin size={20} />}
                    {link.platform === 'Twitter' && <FaTwitter size={20} />}
                    {link.platform === 'Facebook' && <FaFacebook size={20} />}
                    {link.platform === 'Instagram' && <FaInstagram size={20} />}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ms-auto" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="flex-column">
              <Nav.Link href="#home" onClick={(e) => handleSectionClick(e, 'home')}>
                <FaHome className="icon me-1" /> Home
              </Nav.Link>
              <Nav.Link href="#about" onClick={(e) => handleSectionClick(e, 'about')}>
                <FaUser className="icon me-1" /> About
              </Nav.Link>
              <Nav.Link href="#resume" onClick={(e) => handleSectionClick(e, 'resume')}>
                <FaFileAlt className="icon me-1" /> Resume
              </Nav.Link>
              <Nav.Link href="#skills" onClick={(e) => handleSectionClick(e, 'skills')}>
                <FaTools className="icon me-1" /> Skills
              </Nav.Link>
              <Nav.Link href="#projects" onClick={(e) => handleSectionClick(e, 'projects')}>
                <FaBriefcase className="icon me-1" /> Projects
              </Nav.Link>
              <Nav.Link href="#services" onClick={(e) => handleSectionClick(e, 'services')}>
                <FaCogs className="icon me-1" /> Services
              </Nav.Link>
              <Nav.Link href="#testimonials" onClick={(e) => handleSectionClick(e, 'testimonials')}>
                <FaComment className="icon me-1" /> Testimonials
              </Nav.Link>
              <Nav.Link href="#contact" onClick={(e) => handleSectionClick(e, 'contact')}>
                <FaEnvelope className="icon me-1" /> Contact
              </Nav.Link>
              <Nav.Link href="#admin-login" onClick={handleAdminClick}>
                <FaShieldAlt className="icon me-1" /> Admin
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;