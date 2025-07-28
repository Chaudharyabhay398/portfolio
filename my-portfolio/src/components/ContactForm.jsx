import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/ContactForm.css';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState({
    address: 'A108 Adam Street, New York, NY 535022',
    phone: '+1 5589 55488 55',
    email: 'info@example.com',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.811727658067!2d-74.01322218459495!3d40.710451879330984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a175e5d6fa1%3A0x88eec7d7fdf0a9ec!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1614550682036!5m2!1sen!2sus'
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/contact-info', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to fetch contact info: ${response.status}`);
        const data = await response.json();
        setContactInfo(data);
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError('Failed to load contact information');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Failed to submit form: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to send message: ' + err.message);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { 
      y: -5,
      scale: 1.02,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.3 }
    },
  };

  if (isLoading) return <div className="text-gray-300">Loading contact information...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <section id="contact" className="card-container">
      <motion.div
        className="contact-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="card-heading">Get in Touch</h2>
        <p className="contact-intro">
          Reach out to us for any questions or collaboration opportunities.
        </p>

        <div className="card-grid">
          <motion.div
            className="contact-item"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <h3>Our Contact Details</h3>
            <div className="info-item">
              <i className="icon">📍</i>
              <div>
                <strong>Location</strong>
                <p>{contactInfo.address}</p>
              </div>
            </div>
            <div className="info-item">
              <i className="icon">📞</i>
              <div>
                <strong>Phone</strong>
                <p>{contactInfo.phone}</p>
              </div>
            </div>
            <div className="info-item">
              <i className="icon">✉️</i>
              <div>
                <strong>Email</strong>
                <p>{contactInfo.email}</p>
              </div>
            </div>
            <iframe
              src={contactInfo.mapUrl}
              allowFullScreen=""
              loading="lazy"
              title="map"
              className="map-iframe"
            ></iframe>
          </motion.div>

          <motion.div
            className="contact-item"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <h3>Send Us a Message</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                rows="5"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button type="submit" className="form-submit">Submit Message</button>
              {status && <p className="status-message">{status}</p>}
              {error && <p className="error-message">{error}</p>}
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default ContactForm;