import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import About from '../components/About';
import Resume from '../components/Resume';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the contact form. Please try again later.</div>;
    }
    return this.props.children;
  }
}

function Home() {
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.pathname.replace('/', '') || 'home';
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Section with ID "${sectionId}" not found.`);
    }
  }, [location]);

  const staticData = {
    user: [{
      name: 'Abhay Chaudhary',
      profession: 'Innovative and deadline-driven Developer',
      bio: 'Passionate developer with a track record of delivering innovative and user-focused web solutions.',
      city: 'New Delhi, India',
      phone: '+91 9876543210',
      email: 'abhay@example.com',
      profile_picture: 'https://placehold.co/100x100?text=Profile'
    }],
    social_links: [
      { platform: 'Twitter', url: 'https://twitter.com/johndoe' },
      { platform: 'Facebook', url: 'https://facebook.com/johndoe' },
      { platform: 'Instagram', url: 'https://instagram.com/johndoe' },
      { platform: 'Skype', url: 'https://skype.com/johndoe' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' }
    ],
    skills: [
      { id: 1, name: 'HTML', proficiency: 80 },
      { id: 2, name: 'CSS', proficiency: 80 },
      { id: 3, name: 'JS', proficiency: 80 }
    ],
    projects: [
      { id: 1, title: 'Portfolio Website', dateMade: '2024-06-15', type: 'Web Development', image: 'https://via.placeholder.com/300x200', demo_link: 'https://demo1.com', github_link: 'https://github.com/demo1' },
      { id: 2, title: 'Task Manager App', dateMade: '2024-05-10', type: 'Mobile App', image: 'https://via.placeholder.com/300x200', demo_link: 'https://demo2.com', github_link: 'https://github.com/demo2' },
      { id: 3, title: 'E-Commerce Platform', dateMade: '2024-04-20', type: 'E-Commerce', image: 'https://via.placeholder.com/300x200', demo_link: 'https://demo3.com', github_link: 'https://github.com/demo3' },
      { id: 4, title: 'Chat Application', dateMade: '2024-03-15', type: 'Real-Time App', image: 'https://via.placeholder.com/300x200', demo_link: 'https://demo4.com', github_link: 'https://github.com/demo4' },
      { id: 5, title: 'Blog System', dateMade: '2024-02-10', type: 'CMS', image: 'https://via.placeholder.com/300x200', demo_link: 'https://demo5.com', github_link: 'https://github.com/demo5' }
    ],
    services: [
      { id: 1, title: 'Web Development', description: 'Building responsive and modern websites with the latest technologies.' },
      { id: 2, title: 'Mobile App Development', description: 'Creating intuitive and high-performance mobile applications.' },
      { id: 3, title: 'UI/UX Design', description: 'Designing user-friendly interfaces with a focus on experience.' },
      { id: 4, title: 'Cloud Solutions', description: 'Providing scalable and secure cloud-based services.' },
      { id: 5, title: 'Technical Support', description: 'Offering expert support and maintenance for your projects.' }
    ],
    testimonials: [
      { id: 1, content: 'Amazing work on my website, highly professional and creative!', author: 'John Doe', role: 'CEO, TechCorp' },
      { id: 2, content: 'The app exceeded my expectations with its smooth performance.', author: 'Jane Smith', role: 'Product Manager' },
      { id: 3, content: 'Excellent design skills, made my project stand out!', author: 'Mike Johnson', role: 'Marketing Head' },
      { id: 4, content: 'Reliable and efficient cloud solutions, highly recommended.', author: 'Sarah Williams', role: 'CTO, Cloud Innovations' },
      { id: 5, content: 'Great support team, always there when I need them!', author: 'Robert Brown', role: 'Freelancer' }
    ]
  };

  return (
    <div className="portfolio-container">
      <About id="about" user={staticData.user[0]} />
      <Resume id="resume" />
      <Skills id="skills" skills={staticData.skills} />
      <Projects id="projects" projects={staticData.projects} />
      <Services id="services" services={staticData.services} />
      <Testimonials id="testimonials" testimonials={staticData.testimonials} />
      <ErrorBoundary>
        <ContactForm id="contact" />
      </ErrorBoundary>
    </div>
  );
}

export default Home;