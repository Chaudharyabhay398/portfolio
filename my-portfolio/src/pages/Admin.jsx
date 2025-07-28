import { Navigate } from 'react-router-dom';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

function Admin() {
  const isAuthenticated = localStorage.getItem('isAdminLoggedIn') === 'true';
  return isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin-login" replace />;
}

export default Admin;