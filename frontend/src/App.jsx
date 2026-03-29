import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import GrocerySection from './components/GrocerySection'
import FeaturesSection from './components/FeaturesSection'
import HowItWorksSection from './components/HowItWorksSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import AdminFooter from './components/AdminFooter'

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import StudentProfile from './pages/student/Profile';

// Shared pages
import PublicProfile from './pages/shared/PublicProfile';
import Contact from './pages/shared/Contact';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminMessages from './pages/admin/Messages';

const HomePage = () => (
  <div className="min-h-screen bg-white">
    <HeroSection />
    <ServicesSection />
    <GrocerySection />
    <FeaturesSection />
    <HowItWorksSection />
    <CTASection />
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <p className="text-6xl mb-4">🚫</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-500">You don't have permission to view this page.</p>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pb-10">
        <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Shared protected */}
              <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />

              {/* Doctor / shop / delivery dashboards (placeholder redirects) */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/grocery/dashboard" element={<ProtectedRoute roles={['shop_owner']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/pharmacy/dashboard" element={<ProtectedRoute roles={['shop_owner']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/delivery/dashboard" element={<ProtectedRoute roles={['delivery_person']}><StudentProfile /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute roles={['admin']}><AdminMessages /></ProtectedRoute>} />

        </Routes>
      </main>
      {isAdminRoute ? <AdminFooter /> : <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
