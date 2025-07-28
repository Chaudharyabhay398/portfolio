import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/AdminLogin.css';

function ManageAccount() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if admin is logged in and admin_id is valid on component mount
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const adminId = localStorage.getItem('admin_id');
    console.log('ManageAccount useEffect - isAdminLoggedIn:', isAdminLoggedIn, 'adminId:', adminId);
    if (isAdminLoggedIn !== 'true' || !adminId || adminId === 'undefined') {
      console.warn('Invalid or missing admin_id, redirecting to /admin-login');
      setError('Please log in again to manage your account.');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('admin_id');
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Validate passwords
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    const adminId = localStorage.getItem('admin_id');
    console.log('handleSubmit - adminId:', adminId);
    if (!adminId || adminId === 'undefined') {
      setError('Session invalid. Please log in again.');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('admin_id');
      navigate('/admin-login', { replace: true });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Sending request with:');
      console.log('isAdminLoggedIn:', localStorage.getItem('isAdminLoggedIn'));
      console.log('admin_id:', adminId);
      console.log('Request body:', { admin_id: adminId, currentPassword, newPassword });

      const response = await axios.post(
        'http://localhost:3000/api/admin/change-password',
        {
          admin_id: adminId,
          currentPassword,
          newPassword,
        },
        {
          headers: {
            'x-admin-logged-in': localStorage.getItem('isAdminLoggedIn'),
            'x-admin-id': adminId,
          },
        }
      );

      setSuccess(response.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
    } catch (error) {
      console.error('Password change error:', error);
      if (error.response?.status === 401) {
        setError(error.response.data.message || 'Unauthorized: Please log in again.');
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('admin_id');
        navigate('/admin-login', { replace: true });
      } else if (error.response?.status === 400 && error.response?.data?.message) {
        setError(error.response.data.message); // e.g., "Current password is incorrect"
      } else {
        setError('Failed to change password. Please try again.');
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
        <h2>Manage Account</h2>
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 text-green-200 p-3 rounded" role="alert">
            {success}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder=" "
              className="form-control"
            />
            <label htmlFor="currentPassword">Current Password</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder=" "
              className="form-control"
            />
            <label htmlFor="newPassword">New Password</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              placeholder=" "
              className="form-control"
            />
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
        <div className="text-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin-dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageAccount;