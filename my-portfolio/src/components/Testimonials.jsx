import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/Testimonials.css';

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/testimonials');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data = await response.json();
        setTestimonials(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) return <div className="text-gray-400">Loading testimonials...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div  id  = "testimonials" className="card-container">
      <motion.div
        className="testimonials-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <h2 className="card-heading">Testimonials</h2>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <p className="quote">" {testimonial.content} "</p>
              <p className="author">{testimonial.author}</p>
              <p className="role">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Testimonials;