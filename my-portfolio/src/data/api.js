import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const adminLogin = async (admin_id, password) => {
  const response = await axios.post('/admin/login', { admin_id, password });
  return response.data;
};

export const fetchPortfolioData = async (token) => {
  const response = await axios.get('/portfolio', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchAboutData = async () => {
  const response = await axios.get('/about');
  return response.data;
};

export const updateAbout = async (token, data) => {
  return await axios.put('/admin/about', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateUser = async (token, data) => {
  return await axios.put('/admin/user', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateSocialLinks = async (token, data) => {
  return await axios.put('/admin/social-links', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateSkill = async (token, data) => {
  return await axios.put('/admin/skill', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addSkill = async (token, data) => {
  return await axios.post('/admin/skill', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteSkill = async (token, id) => {
  return await axios.delete(`/admin/skill/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateProject = async (token, data) => {
  return await axios.put('/admin/project', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addProject = async (token, data) => {
  return await axios.post('/admin/project', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteProject = async (token, id) => {
  return await axios.delete(`/admin/project/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateTestimonial = async (token, data) => {
  return await axios.put('/admin/testimonial', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addTestimonial = async (token, data) => {
  return await axios.post('/admin/testimonial', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteTestimonial = async (token, id) => {
  return await axios.delete(`/admin/testimonial/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateService = async (token, data) => {
  return await axios.put('/admin/service', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addService = async (token, data) => {
  return await axios.post('/admin/service', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteService = async (token, id) => {
  return await axios.delete(`/admin/service/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateEducation = async (token, data) => {
  return await axios.put('/admin/education', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addEducation = async (token, data) => {
  return await axios.post('/admin/education', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteEducation = async (token, id) => {
  return await axios.delete(`/admin/education/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateExperience = async (token, data) => {
  return await axios.put('/admin/experience', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addExperience = async (token, data) => {
  return await axios.post('/admin/experience', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteExperience = async (token, id) => {
  return await axios.delete(`/admin/experience/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCertification = async (token, data) => {
  return await axios.put('/admin/certification', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addCertification = async (token, data) => {
  return await axios.post('/admin/certification', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteCertification = async (token, id) => {
  return await axios.delete(`/admin/certification/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const submitContactForm = async (token, data) => {
  return await axios.post('/contact-messages', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchContactMessages = async (token) => {
  return await axios.get('/contact-messages', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateContactMessage = async (token, data) => {
  return await axios.put('/contact-messages', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteContactMessage = async (token, id) => {
  return await axios.delete(`/contact-messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateContactSettings = async (token, data) => {
  return await axios.put('/contact-settings', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateStyle = async (token, data) => {
  return await axios.put('/admin/style', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};