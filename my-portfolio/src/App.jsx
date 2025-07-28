import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Header from './components/Header';
import About from './components/About';
import Resume from './components/Resume';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/AdminLogin';
import ManageAccount from './components/ManageAccount';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/admindashboard.css';
import './styles/footer.css';

// Protects routes that require authentication
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAdminLoggedIn') === 'true';
  const adminId = localStorage.getItem('admin_id');
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'adminId:', adminId);
  if (!isAuthenticated || !adminId || adminId === 'undefined') {
    console.log('Unauthorized access to protected route, redirecting to /admin-login');
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

// Protects public routes
function ProtectedPublicRoute({ children }) {
  const location = useLocation();
  const allowedRoutes = [
    '/',
    '/about',
    '/resume',
    '/skills',
    '/projects',
    '/services',
    '/testimonials',
    '/contact',
    '/admin-login',
    '/admin',
  ];
  if (!allowedRoutes.includes(location.pathname)) {
    console.log(`Direct access to ${location.pathname} blocked, redirecting to /`);
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAdminLoggedIn') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('isAdminLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      const sectionId = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (sectionId) {
        console.warn(`Section with ID "${sectionId}" not found. Ensure <div id="${sectionId}"> exists.`);
      }
    }, 100);
    return () => clearTimeout(scrollTimeout);
  }, [location.pathname]);

  console.log('Navigated to:', location.pathname);

  const showHeaderAndFooter = [
    '/',
    '/about',
    '/resume',
    '/skills',
    '/projects',
    '/services',
    '/testimonials',
    '/contact',
    '/admin-login',
    '/admin',
  ].includes(location.pathname);

  return (
    <div className="d-flex flex-column min-vh-100">
      {showHeaderAndFooter && <Header />}
      <main className="flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedPublicRoute>
                <Home id="home" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedPublicRoute>
                <About id="about" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedPublicRoute>
                <Resume id="resume" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedPublicRoute>
                <Skills id="skills" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedPublicRoute>
                <Projects id="projects" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedPublicRoute>
                <Services id="services" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/testimonials"
            element={
              <ProtectedPublicRoute>
                <Testimonials id="testimonials" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedPublicRoute>
                <ContactForm id="contact" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/admin-login"
            element={
              <ProtectedPublicRoute>
                <Login id="admin-login" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedPublicRoute>
                <Login id="admin" />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard id="admin-dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-account"
            element={
              <ProtectedRoute>
                <ManageAccount id="manage-account" />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showHeaderAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;