import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/admindashboard.css';
import axios from 'axios';

function AdminDashboard() {
  const [user, setUser] = useState({
    id: 1,
    name: '',
    bio: '',
    header_profile_picture: '',
    about_profile_picture: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    age: 0,
    about_footer: '',
  });

  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'Twitter', url: '' },
    { id: 2, platform: 'Facebook', url: '' },
    { id: 3, platform: 'Instagram', url: '' },
    { id: 4, platform: 'LinkedIn', url: '' },
  ]);

  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    image: '',
    github: '',
    demo: '',
  });

  const [summary, setSummary] = useState({
    name: '',
    profession: '',
    bio: '',
    city: '',
    phone: '',
    email: '',
  });
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    start_year: '',
    end_year: '',
    institution: '',
    description: '',
  });
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    description: '',
  });
  const [experience, setExperience] = useState([]);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    start_year: '',
    end_year: '',
    description: '',
  });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiency: '',
    type: 'technical',
  });
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ title: '', description: '' });
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ content: '', author: '', role: '' });
  const [editServiceId, setEditServiceId] = useState(null);
  const [editTestimonialId, setEditTestimonialId] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    address: '',
    phone: '',
    email: '',
    mapUrl: ''
  });
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [activeSection, setActiveSection] = useState('header');
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  // Section refs for scrolling
  const headerRef = useRef(null);
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const resumeRef = useRef(null);
  const skillsRef = useRef(null);
  const servicesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const contactRef = useRef(null);

  const sections = {
    header: headerRef,
    about: aboutRef,
    projects: projectsRef,
    resume: resumeRef,
    skills: skillsRef,
    services: servicesRef,
    testimonials: testimonialsRef,
    contact: contactRef,
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsNavOpen(false);
    const sectionRef = sections[section];
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/admin/logout', {}, {
        headers: {
          'x-admin-logged-in': localStorage.getItem('isAdminLoggedIn'),
          'x-admin-id': localStorage.getItem('admin_id'),
        },
      });
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('admin_id');
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('admin_id');
      navigate('/admin', { replace: true });
    }
  };

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
      navigate('/admin', { replace: true });
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const profileRes = await fetch('http://localhost:3000/api/profile', { cache: 'no-store' });
        if (!profileRes.ok) throw new Error(`Failed to fetch profile: ${profileRes.status}`);
        const profileData = await profileRes.json();
        setUser({
          id: profileData.id || 1,
          name: profileData.name || '',
          bio: profileData.bio || '',
          header_profile_picture: profileData.header_profile_picture || '',
          about_profile_picture: profileData.about_profile_picture || '',
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
        const updatedLinks = fixedPlatforms.map((platform, index) => ({
          id: linksData.find((link) => link.platform === platform)?.id || index + 1,
          platform,
          url: linksData.find((link) => link.platform === platform)?.url || '',
        }));
        setSocialLinks(updatedLinks);

        const projectsRes = await fetch('http://localhost:3000/api/projects', { cache: 'no-store' });
        if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${projectsRes.status}`);
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        const resumeErrors = [];
        let summaryData = {}, educationData = [], certificationsData = [], experienceData = [], skillsData = [], servicesData = [], testimonialsData = [], contactInfoData = {}, contactSubmissionsData = [];

        try {
          const summaryRes = await fetch('http://localhost:3000/api/resume', { cache: 'no-store' });
          if (!summaryRes.ok) {
            if (summaryRes.status === 404) {
              resumeErrors.push('Resume summary API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch summary: ${summaryRes.status}`);
            }
          } else {
            summaryData = await summaryRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const educationRes = await fetch('http://localhost:3000/api/education', { cache: 'no-store' });
          if (!educationRes.ok) {
            if (educationRes.status === 404) {
              resumeErrors.push('Education API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch education: ${educationRes.status}`);
            }
          } else {
            educationData = await educationRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const certificationsRes = await fetch('http://localhost:3000/api/certifications', { cache: 'no-store' });
          if (!certificationsRes.ok) {
            if (certificationsRes.status === 404) {
              resumeErrors.push('Certifications API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch certifications: ${certificationsRes.status}`);
            }
          } else {
            certificationsData = await certificationsRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const experienceRes = await fetch('http://localhost:3000/api/experience', { cache: 'no-store' });
          if (!experienceRes.ok) {
            if (experienceRes.status === 404) {
              resumeErrors.push('Experience API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch experience: ${experienceRes.status}`);
            }
          } else {
            experienceData = await experienceRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const skillsRes = await fetch('http://localhost:3000/api/skills', { cache: 'no-store' });
          if (!skillsRes.ok) {
            if (skillsRes.status === 404) {
              resumeErrors.push('Skills API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch skills: ${skillsRes.status}`);
            }
          } else {
            skillsData = await skillsRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const servicesRes = await fetch('http://localhost:3000/api/services', { cache: 'no-store' });
          if (!servicesRes.ok) {
            if (servicesRes.status === 404) {
              resumeErrors.push('Services API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch services: ${servicesRes.status}`);
            }
          } else {
            servicesData = await servicesRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const testimonialsRes = await fetch('http://localhost:3000/api/testimonials', { cache: 'no-store' });
          if (!testimonialsRes.ok) {
            if (testimonialsRes.status === 404) {
              resumeErrors.push('Testimonials API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch testimonials: ${testimonialsRes.status}`);
            }
          } else {
            testimonialsData = await testimonialsRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const contactInfoRes = await fetch('http://localhost:3000/api/contact-info', { cache: 'no-store' });
          if (!contactInfoRes.ok) {
            if (contactInfoRes.status === 404) {
              resumeErrors.push('Contact Info API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch contact info: ${contactInfoRes.status}`);
            }
          } else {
            contactInfoData = await contactInfoRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        try {
          const contactSubmissionsRes = await fetch('http://localhost:3000/api/contact-submissions', { cache: 'no-store' });
          if (!contactSubmissionsRes.ok) {
            if (contactSubmissionsRes.status === 404) {
              resumeErrors.push('Contact Submissions API not found. Please check the backend server.');
            } else {
              throw new Error(`Failed to fetch contact submissions: ${contactSubmissionsRes.status}`);
            }
          } else {
            contactSubmissionsData = await contactSubmissionsRes.json();
          }
        } catch (err) {
          resumeErrors.push(err.message);
        }

        setSummary(summaryData || {});
        setEducation(educationData || []);
        setCertifications(certificationsData || []);
        setExperience(experienceData || []);
        setSkills(skillsData || []);
        setServices(servicesData || []);
        setTestimonials(testimonialsData || []);
        setContactInfo(contactInfoData || {});
        setContactSubmissions(contactSubmissionsData || []);

        if (resumeErrors.length > 0) {
          setError(resumeErrors.join(' | '));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleHeaderImageChange = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('header_profile_picture', file);
    try {
      const res = await fetch('http://localhost:3000/api/upload-header-picture', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Failed to upload header image: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const newImagePath = data.header_profile_picture;
      setUser((prev) => ({ ...prev, header_profile_picture: newImagePath }));
      await updateProfileWithImage(newImagePath, 'header_profile_picture');
      setError('');
    } catch (err) {
      console.error('Error uploading header image:', err);
      setError('Failed to upload header image: ' + err.message);
    }
  };

  const handleAboutImageChange = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('about_profile_picture', file);
    try {
      const res = await fetch('http://localhost:3000/api/upload-about-picture', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Failed to upload about image: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const newImagePath = data.about_profile_picture;
      setUser((prev) => ({ ...prev, about_profile_picture: newImagePath }));
      await updateProfileWithImage(newImagePath, 'about_profile_picture');
      setError('');
    } catch (err) {
      console.error('Error uploading about image:', err);
      setError('Failed to upload about image: ' + err.message);
    }
  };

  const updateProfileWithImage = async (imagePath, field) => {
    try {
      const profileData = { ...user, [field]: imagePath };
      const res = await fetch(`http://localhost:3000/api/profile/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error(`Failed to update profile with image: ${res.status}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
    } catch (err) {
      console.error('Error updating profile with image:', err);
      throw err;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const profileRes = await fetch(`http://localhost:3000/api/profile/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!profileRes.ok) throw new Error(`Failed to update profile: ${profileRes.status}`);
      const profileResult = await profileRes.json();
      if (profileResult.error) throw new Error(profileResult.error);

      for (let link of socialLinks) {
        const linkData = { user_id: 1, platform: link.platform, url: link.url || '' };
        const linkRes = await fetch(`http://localhost:3000/api/social-links/${link.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData),
        });
        if (!linkRes.ok) throw new Error(`Failed to update social link for ${link.platform}: ${linkRes.status}`);
        const linkResult = await linkRes.json();
        if (linkResult.error) throw new Error(linkResult.error);
      }

      setError('');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to save changes: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProjectImageChange = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('project_image', file);
    try {
      const res = await fetch('http://localhost:3000/api/upload-project-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Failed to upload project image: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNewProject((prev) => ({ ...prev, image: data.project_image }));
      setError('');
    } catch (err) {
      console.error('Error uploading project image:', err);
      setError('Failed to upload project image: ' + err.message);
    }
  };

  const handleEditProjectImage = async (e, projectId) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('project_image', file);
    try {
      const res = await fetch('http://localhost:3000/api/upload-project-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Failed to upload project image: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const updatedProjects = projects.map((p) =>
        p.id === projectId ? { ...p, image: data.project_image } : p
      );
      setProjects(updatedProjects);
      setError('');
    } catch (err) {
      console.error('Error uploading project image:', err);
      setError('Failed to upload project image: ' + err.message);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) throw new Error(`Failed to add project: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProjects([...projects, data]);
      setNewProject({ title: '', description: '', image: '', github: '', demo: '' });
      setError('');
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Failed to add project: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProject = async (project) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setError('');
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProjects(projects.filter((p) => p.id !== projectId));
      setError('');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSummary = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!summary.name || !summary.profession || !summary.bio || !summary.city || !summary.phone || !summary.email) {
        throw new Error('All summary fields are required');
      }
      const res = await fetch('http://localhost:3000/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Resume API not found. Please check the backend server.');
        }
        throw new Error(`Failed to update summary: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setError('');
    } catch (err) {
      console.error('Error updating summary:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!newEducation.degree || !newEducation.start_year || !newEducation.institution || !newEducation.description) {
        throw new Error('Degree, start year, institution, and description are required');
      }
      if (!/^\d{4}$/.test(newEducation.start_year) || (newEducation.end_year && !/^\d{4}$/.test(newEducation.end_year) && newEducation.end_year !== 'Present')) {
        throw new Error('Start year and end year must be valid years or "Present"');
      }
      const res = await fetch('http://localhost:3000/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEducation),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Education API not found. Please check the backend server.');
        }
        throw new Error(`Failed to add education: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEducation([...education, data]);
      setNewEducation({ degree: '', start_year: '', end_year: '', institution: '', description: '' });
      setError('');
    } catch (err) {
      console.error('Error adding education:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEducation = async (edu) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!edu.degree || !edu.start_year || !edu.institution || !edu.description) {
        throw new Error('Degree, start year, institution, and description are required');
      }
      if (!/^\d{4}$/.test(edu.start_year) || (edu.end_year && !/^\d{4}$/.test(edu.end_year) && edu.end_year !== 'Present')) {
        throw new Error('Start year and end year must be valid years or "Present"');
      }
      const res = await fetch(`http://localhost:3000/api/education/${edu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edu),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Education API not found. Please check the backend server.');
        }
        throw new Error(`Failed to update education: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEducation(education.map((item) => (item.id === edu.id ? { ...item, ...edu } : item)));
      setError('');
    } catch (err) {
      console.error('Error updating education:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEducation = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/education/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Education API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete education: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEducation(education.filter((e) => e.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting education:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!newCertification.title || !newCertification.issuer || !newCertification.issue_date || !newCertification.description) {
        throw new Error('Title, issuer, issue date, and description are required');
      }
      if (!/^\d{4}-\d{2}$/.test(newCertification.issue_date)) {
        throw new Error('Issue date must be in YYYY-MM format (e.g., 2022-06)');
      }
      const res = await fetch('http://localhost:3000/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCertification),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Certifications API not found. Please check the backend server.');
        }
        throw new Error(`Failed to add certification: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCertifications([...certifications, data]);
      setNewCertification({ title: '', issuer: '', issue_date: '', description: '' });
      setError('');
    } catch (err) {
      console.error('Error adding certification:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCertification = async (cert) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!cert.title || !cert.issuer || !cert.issue_date || !cert.description) {
        throw new Error('Title, issuer, issue date, and description are required');
      }
      if (!/^\d{4}-\d{2}$/.test(cert.issue_date)) {
        throw new Error('Issue date must be in YYYY-MM format (e.g., 2022-06)');
      }
      const res = await fetch(`http://localhost:3000/api/certifications/${cert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cert),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Certifications API not found. Please check the backend server.');
        }
        throw new Error(`Failed to update certification: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCertifications(certifications.map((item) => (item.id === cert.id ? { ...item, ...cert } : item)));
      setError('');
    } catch (err) {
      console.error('Error updating certification:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCertification = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/certifications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Certifications API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete certification: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCertifications(certifications.filter((c) => c.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting certification:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!newExperience.title || !newExperience.company || !newExperience.start_year || !newExperience.description) {
        throw new Error('Title, company, start year, and description are required');
      }
      if (!/^\d{4}$/.test(newExperience.start_year) || (newExperience.end_year && !/^\d{4}$/.test(newExperience.end_year) && newExperience.end_year !== 'Present')) {
        throw new Error('Start year and end year must be valid years or "Present"');
      }
      const res = await fetch('http://localhost:3000/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExperience),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Experience API not found. Please check the backend server.');
        }
        throw new Error(`Failed to add experience: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExperience([...experience, data]);
      setNewExperience({ title: '', company: '', start_year: '', end_year: '', description: '' });
      setError('');
    } catch (err) {
      console.error('Error adding experience:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateExperience = async (exp) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!exp.title || !exp.company || !exp.start_year || !exp.description) {
        throw new Error('Title, company, start year, and description are required');
      }
      if (!/^\d{4}$/.test(exp.start_year) || (exp.end_year && !/^\d{4}$/.test(exp.end_year) && exp.end_year !== 'Present')) {
        throw new Error('Start year and end year must be valid years or "Present"');
      }
      const res = await fetch(`http://localhost:3000/api/experience/${exp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Experience API not found. Please check the backend server.');
        }
        throw new Error(`Failed to update experience: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExperience(experience.map((item) => (item.id === exp.id ? { ...item, ...exp } : item)));
      setError('');
    } catch (err) {
      console.error('Error updating experience:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/experience/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Experience API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete experience: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExperience(experience.filter((e) => e.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting experience:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!newSkill.name || !newSkill.proficiency || !newSkill.type) {
        throw new Error('Name, proficiency, and type are required');
      }
      const proficiency = parseInt(newSkill.proficiency);
      if (isNaN(proficiency) || proficiency < 0 || proficiency > 100) {
        throw new Error('Proficiency must be a number between 0 and 100');
      }
      const res = await fetch('http://localhost:3000/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSkill, proficiency }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Skills API not found. Please check the backend server.');
        }
        throw new Error(`Failed to add skill: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSkills([...skills, data]);
      setNewSkill({ name: '', proficiency: '', type: 'technical' });
      setError('');
    } catch (err) {
      console.error('Error adding skill:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSkill = async (skill) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!skill.name || !skill.proficiency || !skill.type) {
        throw new Error('Name, proficiency, and type are required');
      }
      const proficiency = parseInt(skill.proficiency);
      if (isNaN(proficiency) || proficiency < 0 || proficiency > 100) {
        throw new Error('Proficiency must be a number between 0 and 100');
      }
      const res = await fetch(`http://localhost:3000/api/skills/${skill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...skill, proficiency }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Skills API not found. Please check the backend server.');
        }
        throw new Error(`Failed to update skill: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSkills(skills.map((item) => (item.id === skill.id ? { ...item, ...data } : item)));
      setError('');
    } catch (err) {
      console.error('Error updating skill:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/skills/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Skills API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete skill: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSkills(skills.filter((s) => s.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!newService.title || !newService.description) {
        throw new Error('Title and description are required');
      }
      const url = editServiceId ? `http://localhost:3000/api/services/${editServiceId}` : 'http://localhost:3000/api/services';
      const method = editServiceId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Services API not found. Please check the backend server.');
        }
        throw new Error(`Failed to save service: ${response.status}`);
      }
      const savedService = await response.json();
      if (editServiceId) {
        setServices(services.map((service) => (service.id === editServiceId ? savedService : service)));
      } else {
        setServices([...services, savedService]);
      }
      setNewService({ title: '', description: '' });
      setEditServiceId(null);
      setError('');
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!newTestimonial.content || !newTestimonial.author || !newTestimonial.role) {
        throw new Error('Content, author, and role are required');
      }
      const url = editTestimonialId ? `http://localhost:3000/api/testimonials/${editTestimonialId}` : 'http://localhost:3000/api/testimonials';
      const method = editTestimonialId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTestimonial),
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Testimonials API not found. Please check the backend server.');
        }
        throw new Error(`Failed to save testimonial: ${response.status}`);
      }
      const savedTestimonial = await response.json();
      if (editTestimonialId) {
        setTestimonials(testimonials.map((t) => (t.id === editTestimonialId ? savedTestimonial : t)));
      } else {
        setTestimonials([...testimonials, savedTestimonial]);
      }
      setNewTestimonial({ content: '', author: '', role: '' });
      setEditTestimonialId(null);
      setError('');
    } catch (err) {
      console.error('Error saving testimonial:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Services API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete service: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setServices(services.filter((service) => service.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/testimonials/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Testimonials API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete testimonial: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setTestimonials(testimonials.filter((t) => t.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteContactSubmission = async (id) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/contact-submissions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Contact Submissions API not found. Please check the backend server.');
        }
        throw new Error(`Failed to delete contact submission: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setContactSubmissions(contactSubmissions.filter((submission) => submission.id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting contact submission:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateContactInfo = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setError('');
    try {
      if (!contactInfo.address || !contactInfo.phone || !contactInfo.email) {
        throw new Error('Address, phone, and email are required');
      }
      const res = await fetch('http://localhost:3000/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo),
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Contact Info API not found. Please check the backend server.');
        }
        throw new Error(`Failed to update contact info: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setError('');
    } catch (err) {
      console.error('Error updating contact info:', err);
      setError('Failed to update contact info: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = e.target.alt === 'Header Image'
      ? '/Uploads/default_image.jpg'
      : e.target.alt === 'About Image'
      ? '/Uploads/default-user.jpg'
      : '/Uploads/default-project.jpg';
    e.target.style.objectFit = 'contain';
    e.target.onerror = null;
  };

  return (
    <div className="admin-dashboard min-vh-100 bg-dark text-white">
      {/* Navigation */}
      <nav className="navbar navbar-expand-md bg-dark-gray shadow fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand text-xl">Admin Dashboard</span>
          <input
            type="checkbox"
            id="menu-toggle"
            className="menu-toggle d-none"
            checked={isNavOpen}
            onChange={() => setIsNavOpen(!isNavOpen)}
          />
          <label htmlFor="menu-toggle" className="navbar-toggler" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </label>
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto mb-2 mb-md-0">
              {['header', 'about', 'projects', 'resume', 'skills', 'services', 'testimonials', 'contact'].map((section) => (
                <li key={section} className="nav-item">
                  <button
                    className={`nav-link px-3 ${activeSection === section ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                    onClick={() => handleSectionChange(section)}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                </li>
              ))}
              <li className="nav-item">
                <Link
                  to="/manage-account"
                  className={`nav-link px-3 ${activeSection === 'manage-account' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                  onClick={() => {
                    setActiveSection('manage-account');
                    setIsNavOpen(false);
                  }}
                >
                  Manage Account
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link px-3 bg-red-600 text-white"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container pt-5 mt-5">
        <h1 className="dashboard-title text-center mb-4">Admin Dashboard</h1>
        {isLoading && (
          <p className="text-center text-muted mb-4">Loading data...</p>
        )}
        {error && (
          <div className="alert alert-danger text-center mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Header Section */}
        <div ref={headerRef} className={`card mx-auto mb-4 ${activeSection === 'header' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Edit Header</h2>
            <img
              src={user.header_profile_picture || '/Uploads/default-header.jpg'}
              alt="Header Image"
              onError={handleImageError}
              className="img-fluid rounded mb-3"
              style={{ maxWidth: '200px', height: 'auto' }}
            />
            <form>
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleHeaderImageChange}
                  className="form-control"
                />
              </div>
            </form>
            <div className="mb-3">
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Name"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <textarea
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                placeholder="Bio"
                className="form-control"
                rows="4"
              />
            </div>
            <h3 className="h5 mb-2">Social Links</h3>
            {socialLinks.map((link, index) => (
              <div key={link.platform} className="social-link row mb-3">
                <div className="col-md-4 mb-2 mb-md-0">
                  <input
                    type="text"
                    value={link.platform}
                    disabled
                    placeholder="Platform"
                    className="form-control bg-secondary text-light"
                  />
                </div>
                <div className="col-md-8">
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...socialLinks];
                      newLinks[index].url = e.target.value;
                      setSocialLinks(newLinks);
                    }}
                    placeholder={`${link.platform} URL`}
                    className="form-control"
                  />
                </div>
              </div>
            ))}
            <form onSubmit={handleUpdate}>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Save Header
              </button>
            </form>
          </div>
        </div>

        {/* About Section */}
        <div ref={aboutRef} className={`card mx-auto mb-4 ${activeSection === 'about' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Edit About Page</h2>
            <img
              src={user.about_profile_picture || '/Uploads/default-about.jpg'}
              alt="About Image"
              onError={handleImageError}
              className="img-fluid rounded mb-3"
              style={{ maxWidth: '200px', height: 'auto' }}
            />
            <form>
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleAboutImageChange}
                  className="form-control"
                />
              </div>
            </form>
            <div className="mb-3">
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Name"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="number"
                value={user.age}
                onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) || 0 })}
                placeholder="Age"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={user.location}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
                placeholder="Location"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Email"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                placeholder="Phone"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={user.linkedin}
                onChange={(e) => setUser({ ...user, linkedin: e.target.value })}
                placeholder="LinkedIn"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <textarea
                value={user.about_footer}
                onChange={(e) => setUser({ ...user, about_footer: e.target.value })}
                placeholder="About Footer"
                className="form-control"
                rows="4"
              />
            </div>
            <form onSubmit={handleUpdate}>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Save About
              </button>
            </form>
          </div>
        </div>

        {/* Projects Section */}
        <div ref={projectsRef} className={`card mx-auto mb-4 ${activeSection === 'projects' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Manage Projects</h2>
            <h3 className="h5 mb-2">Add New Project</h3>
            <form onSubmit={handleAddProject} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Project Title"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Project Description"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleProjectImageChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newProject.github}
                  onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                  placeholder="GitHub URL"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newProject.demo}
                  onChange={(e) => setNewProject({ ...newProject, demo: e.target.value })}
                  placeholder="Live Demo URL"
                  required
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Add Project
              </button>
            </form>

            <h3 className="h5 mb-2">Existing Projects</h3>
            {projects.length === 0 && (
              <p className="text-muted">No projects available.</p>
            )}
            {projects.map((project) => (
              <div key={project.id} className="card mb-3">
                <div className="card-body">
                  <img
                    src={project.image || '/Uploads/default-project.jpg'}
                    alt={project.title}
                    className="img-fluid rounded mb-3"
                    onError={handleImageError}
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                  <div className="mb-3">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => {
                        const updatedProjects = projects.map((p) =>
                          p.id === project.id ? { ...p, title: e.target.value } : p
                        );
                        setProjects(updatedProjects);
                      }}
                      placeholder="Project Title"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const updatedProjects = projects.map((p) =>
                          p.id === project.id ? { ...p, description: e.target.value } : p
                        );
                        setProjects(updatedProjects);
                      }}
                      placeholder="Project Description"
                      className="form-control"
                      rows="4"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleEditProjectImage(e, project.id)}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={project.github}
                      onChange={(e) => {
                        const updatedProjects = projects.map((p) =>
                          p.id === project.id ? { ...p, github: e.target.value } : p
                        );
                        setProjects(updatedProjects);
                      }}
                      placeholder="GitHub URL"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={project.demo}
                      onChange={(e) => {
                        const updatedProjects = projects.map((p) =>
                          p.id === project.id ? { ...p, demo: e.target.value } : p
                        );
                        setProjects(updatedProjects);
                      }}
                      placeholder="Live Demo URL"
                      className="form-control"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleUpdateProject(project)}
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      Update Project
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Section */}
        <div ref={resumeRef} className={`card mx-auto mb-4 ${activeSection === 'resume' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Manage Resume</h2>
            <p className="text-warning mb-3">
              Note: Updating Name, Bio, Email, or Phone here will not automatically update the Header/About sections. Update those separately if needed.
            </p>
            <h3 className="h5 mb-2">Edit Summary</h3>
            <form onSubmit={handleUpdateSummary} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={summary.name}
                  onChange={(e) => setSummary({ ...summary, name: e.target.value })}
                  placeholder="Name"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={summary.profession}
                  onChange={(e) => setSummary({ ...summary, profession: e.target.value })}
                  placeholder="Profession"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <textarea
                  value={summary.bio}
                  onChange={(e) => setSummary({ ...summary, bio: e.target.value })}
                  placeholder="Bio"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={summary.city}
                  onChange={(e) => setSummary({ ...summary, city: e.target.value })}
                  placeholder="City"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={summary.phone}
                  onChange={(e) => setSummary({ ...summary, phone: e.target.value })}
                  placeholder="Phone"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  value={summary.email}
                  onChange={(e) => setSummary({ ...summary, email: e.target.value })}
                  placeholder="Email"
                  required
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Update Summary
              </button>
            </form>

            <h3 className="h5 mb-2">Add Education</h3>
            <form onSubmit={handleAddEducation} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  placeholder="Degree"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newEducation.start_year}
                  onChange={(e) => setNewEducation({ ...newEducation, start_year: e.target.value })}
                  placeholder="Start Year (e.g., 2020)"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newEducation.end_year}
                  onChange={(e) => setNewEducation({ ...newEducation, end_year: e.target.value })}
                  placeholder="End Year (e.g., 2022 or Present)"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  placeholder="Institution"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <textarea
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  placeholder="Description"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Add Education
              </button>
            </form>

            <h3 className="h5 mb-2">Existing Education</h3>
            {education.length === 0 && (
              <p className="text-muted">No education entries available.</p>
            )}
            {education.map((edu) => (
              <div key={edu.id} className="card mb-3">
                <div className="card-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updatedEducation = education.map((item) =>
                          item.id === edu.id ? { ...item, degree: e.target.value } : item
                        );
                        setEducation(updatedEducation);
                      }}
                      placeholder="Degree"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={edu.start_year}
                      onChange={(e) => {
                        const updatedEducation = education.map((item) =>
                          item.id === edu.id ? { ...item, start_year: e.target.value } : item
                        );
                        setEducation(updatedEducation);
                      }}
                      placeholder="Start Year (e.g., 2020)"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={edu.end_year}
                      onChange={(e) => {
                        const updatedEducation = education.map((item) =>
                          item.id === edu.id ? { ...item, end_year: e.target.value } : item
                        );
                        setEducation(updatedEducation);
                      }}
                      placeholder="End Year (e.g., 2022 or Present)"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updatedEducation = education.map((item) =>
                          item.id === edu.id ? { ...item, institution: e.target.value } : item
                        );
                        setEducation(updatedEducation);
                      }}
                      placeholder="Institution"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      value={edu.description}
                      onChange={(e) => {
                        const updatedEducation = education.map((item) =>
                          item.id === edu.id ? { ...item, description: e.target.value } : item
                        );
                        setEducation(updatedEducation);
                      }}
                      placeholder="Description"
                      className="form-control"
                      rows="4"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleUpdateEducation(edu)}
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      Update Education
                    </button>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete Education
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <h3 className="h5 mb-2">Add Certification</h3>
            <form onSubmit={handleAddCertification} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newCertification.title}
                  onChange={(e) => setNewCertification({ ...newCertification, title: e.target.value })}
                  placeholder="Certification Title"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                  placeholder="Issuer"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newCertification.issue_date}
                  onChange={(e) => setNewCertification({ ...newCertification, issue_date: e.target.value })}
                  placeholder="Issue Date (YYYY-MM, e.g., 2022-06)"
                  required
                  className="form-control"
                />
                <small className="form-text text-muted">Enter issue date in YYYY-MM format (e.g., 2022-06).</small>
              </div>
              <div className="mb-3">
                <textarea
                  value={newCertification.description}
                  onChange={(e) => setNewCertification({ ...newCertification, description: e.target.value })}
                  placeholder="Description"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Add Certification
              </button>
            </form>

            <h3 className="h5 mb-2">Existing Certifications</h3>
            {certifications.length === 0 && (
              <p className="text-muted">No certifications available.</p>
            )}
            {certifications.map((cert) => (
              <div key={cert.id} className="card mb-3">
                <div className="card-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => {
                        const updatedCertifications = certifications.map((item) =>
                          item.id === cert.id ? { ...item, title: e.target.value } : item
                        );
                        setCertifications(updatedCertifications);
                      }}
                      placeholder="Certification Title"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => {
                        const updatedCertifications = certifications.map((item) =>
                          item.id === cert.id ? { ...item, issuer: e.target.value } : item
                        );
                        setCertifications(updatedCertifications);
                      }}
                      placeholder="Issuer"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={cert.issue_date}
                      onChange={(e) => {
                        const updatedCertifications = certifications.map((item) =>
                          item.id === cert.id ? { ...item, issue_date: e.target.value } : item
                        );
                        setCertifications(updatedCertifications);
                      }}
                      placeholder="Issue Date (YYYY-MM, e.g., 2022-06)"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      value={cert.description}
                      onChange={(e) => {
                        const updatedCertifications = certifications.map((item) =>
                          item.id === cert.id ? { ...item, description: e.target.value } : item
                        );
                        setCertifications(updatedCertifications);
                      }}
                      placeholder="Description"
                      className="form-control"
                      rows="4"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleUpdateCertification(cert)}
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      Update Certification
                    </button>
                    <button
                      onClick={() => handleDeleteCertification(cert.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete Certification
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <h3 className="h5 mb-2">Add Professional Experience</h3>
            <form onSubmit={handleAddExperience} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                  placeholder="Job Title"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  placeholder="Company"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newExperience.start_year}
                  onChange={(e) => setNewExperience({ ...newExperience, start_year: e.target.value })}
                  placeholder="Start Year (e.g., 2020)"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newExperience.end_year}
                  onChange={(e) => setNewExperience({ ...newExperience, end_year: e.target.value })}
                  placeholder="End Year (e.g., 2022 or Present)"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  placeholder="Description"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Add Experience
              </button>
            </form>

            <h3 className="h5 mb-2">Existing Professional Experience</h3>
            {experience.length === 0 && (
              <p className="text-muted">No professional experience available.</p>
            )}
            {experience.map((exp) => (
              <div key={exp.id} className="card mb-3">
                <div className="card-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const updatedExperience = experience.map((item) =>
                          item.id === exp.id ? { ...item, title: e.target.value } : item
                        );
                        setExperience(updatedExperience);
                      }}
                      placeholder="Job Title"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updatedExperience = experience.map((item) =>
                          item.id === exp.id ? { ...item, company: e.target.value } : item
                        );
                        setExperience(updatedExperience);
                      }}
                      placeholder="Company"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={exp.start_year}
                      onChange={(e) => {
                        const updatedExperience = experience.map((item) =>
                          item.id === exp.id ? { ...item, start_year: e.target.value } : item
                        );
                        setExperience(updatedExperience);
                      }}
                      placeholder="Start Year (e.g., 2020)"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={exp.end_year}
                      onChange={(e) => {
                        const updatedExperience = experience.map((item) =>
                          item.id === exp.id ? { ...item, end_year: e.target.value } : item
                        );
                        setExperience(updatedExperience);
                      }}
                      placeholder="End Year (e.g., 2022 or Present)"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const updatedExperience = experience.map((item) =>
                          item.id === exp.id ? { ...item, description: e.target.value } : item
                        );
                        setExperience(updatedExperience);
                      }}
                      placeholder="Description"
                      className="form-control"
                      rows="4"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleUpdateExperience(exp)}
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      Update Experience
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
{/* Skills Section */}
        <div ref={skillsRef} className={`card mx-auto mb-4 ${activeSection === 'skills' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Manage Skills</h2>
            <h3 className="h5 mb-2">Add Skill</h3>
            <form onSubmit={handleAddSkill} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="Skill Name"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                  placeholder="Proficiency (0-100)"
                  required
                  min="0"
                  max="100"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <select
                  value={newSkill.type}
                  onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
                  className="form-control"
                >
                  <option value="technical">Technical</option>
                  <option value="soft">Soft</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Add Skill
              </button>
            </form>

            <h3 className="h5 mb-2">Existing Skills</h3>
            {skills.length === 0 && (
              <p className="text-muted">No skills available.</p>
            )}
            {skills.map((skill) => (
              <div key={skill.id} className="card mb-3">
                <div className="card-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => {
                        const updatedSkills = skills.map((item) =>
                          item.id === skill.id ? { ...item, name: e.target.value } : item
                        );
                        setSkills(updatedSkills);
                      }}
                      placeholder="Skill Name"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="number"
                      value={skill.proficiency}
                      onChange={(e) => {
                        const updatedSkills = skills.map((item) =>
                          item.id === skill.id ? { ...item, proficiency: e.target.value } : item
                        );
                        setSkills(updatedSkills);
                      }}
                      placeholder="Proficiency (0-100)"
                      min="0"
                      max="100"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <select
                      value={skill.type}
                      onChange={(e) => {
                        const updatedSkills = skills.map((item) =>
                          item.id === skill.id ? { ...item, type: e.target.value } : item
                        );
                        setSkills(updatedSkills);
                      }}
                      className="form-control"
                    >
                      <option value="technical">Technical</option>
                      <option value="soft">Soft</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleUpdateSkill(skill)}
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      Update Skill
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete Skill
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div ref={servicesRef} className={`card mx-auto mb-4 ${activeSection === 'services' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Manage Services</h2>
            <h3 className="h5 mb-2">{editServiceId ? 'Edit Service' : 'Add Service'}</h3>
            <form onSubmit={handleServiceSubmit} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  placeholder="Service Title"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Service Description"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-primary"
                >
                  {editServiceId ? 'Update Service' : 'Add Service'}
                </button>
                {editServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewService({ title: '', description: '' });
                      setEditServiceId(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="h5 mb-2">Existing Services</h3>
            {services.length === 0 && (
              <p className="text-muted">No services available.</p>
            )}
            {services.map((service) => (
              <div key={service.id} className="card mb-3">
                <div className="card-body">
                  <h4 className="card-title h6">{service.title}</h4>
                  <p>{service.description}</p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        setNewService({ title: service.title, description: service.description });
                        setEditServiceId(service.id);
                      }}
                      className="btn btn-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div ref={testimonialsRef} className={`card mx-auto mb-4 ${activeSection === 'testimonials' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Manage Testimonials</h2>
            <h3 className="h5 mb-2">{editTestimonialId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
            <form onSubmit={handleTestimonialSubmit} className="mb-4">
              <div className="mb-3">
                <textarea
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  placeholder="Testimonial Content"
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newTestimonial.author}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
                  placeholder="Author Name"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={newTestimonial.role}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                  placeholder="Author Role"
                  required
                  className="form-control"
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-primary"
                >
                  {editTestimonialId ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
                {editTestimonialId && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTestimonial({ content: '', author: '', role: '' });
                      setEditTestimonialId(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="h5 mb-2">Existing Testimonials</h3>
            {testimonials.length === 0 && (
              <p className="text-muted">No testimonials available.</p>
            )}
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card mb-3">
                <div className="card-body">
                  <p>{testimonial.content}</p>
                  <p><strong>{testimonial.author}</strong> - {testimonial.role}</p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        setNewTestimonial({
                          content: testimonial.content,
                          author: testimonial.author,
                          role: testimonial.role,
                        });
                        setEditTestimonialId(testimonial.id);
                      }}
                      className="btn btn-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div ref={contactRef} className={`card mx-auto mb-4 ${activeSection === 'contact' ? '' : 'd-none'}`}>
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Manage Contact Information</h2>
            <h3 className="h5 mb-2">Edit Contact Info</h3>
            <form onSubmit={handleUpdateContactInfo} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  placeholder="Address"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="Phone"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="Email"
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={contactInfo.mapUrl}
                  onChange={(e) => setContactInfo({ ...contactInfo, mapUrl: e.target.value })}
                  placeholder="Google Maps Embed URL"
                  className="form-control"
                />
                <small className="form-text text-muted">
                  Optional: Provide a Google Maps embed URL for location display.
                </small>
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                Update Contact Info
              </button>
            </form>

            <h3 className="h5 mb-2">Contact Form Submissions</h3>
            {contactSubmissions.length === 0 && (
              <p className="text-muted">No contact submissions available.</p>
            )}
            {contactSubmissions.map((submission) => (
              <div key={submission.id} className="card mb-3">
                <div className="card-body">
                  <p><strong>Name:</strong> {submission.name}</p>
                  <p><strong>Email:</strong> {submission.email}</p>
                  <p><strong>Message:</strong> {submission.message}</p>
                  <p><strong>Submitted:</strong> {new Date(submission.created_at).toLocaleString()}</p>
                  <button
                    onClick={() => handleDeleteContactSubmission(submission.id)}
                    disabled={isUpdating}
                    className="btn btn-danger"
                  >
                    Delete Submission
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;