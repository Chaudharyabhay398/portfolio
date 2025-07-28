import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/AdminLogin.css';

function Login() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const adminId = localStorage.getItem('admin_id');
    console.log('AdminLogin useEffect - isAdminLoggedIn:', isAdminLoggedIn, 'adminId:', adminId);
    if (isAdminLoggedIn === 'true' && adminId && adminId !== 'undefined') {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Login request - adminId:', adminId, 'password:', password);
      const response = await axios.post('http://localhost:3000/api/admin/login', {
        admin_id: adminId,
        password,
      });

      if (response.data.success) {
        console.log('Login successful, setting localStorage:', {
          isAdminLoggedIn: 'true',
          admin_id: response.data.admin_id,
        });
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('admin_id', response.data.admin_id);
        navigate('/admin-dashboard', { replace: true });
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid admin ID or password.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-section">
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="login-card">
        <h2>Admin Login</h2>
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded" role="alert">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="adminId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
              placeholder=" "
              className="form-control"
            />
            <label htmlFor="adminId">Admin ID</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="form-control"
            />
            <label htmlFor="password">Password</label>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;