import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Homepage components (existing)
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import GrocerySection from './components/GrocerySection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import FeedbackForm from './pages/student/FeedbackForm';
import ComplaintForm from './pages/student/ComplaintForm';
import MyComplaints from './pages/student/MyComplaints';
import TopRated from './pages/student/TopRated';

// Shared pages
import PublicProfile from './pages/shared/PublicProfile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SentimentAnalytics from './pages/admin/SentimentAnalytics';
import ComplaintManagement from './pages/admin/ComplaintManagement';

const HomePage = () => (
  <div className="min-h-screen bg-white">
    <HeroSection />
    <ServicesSection />
    <GrocerySection />
    <FeaturesSection />
    <HowItWorksSection />
    <CTASection />
    <Footer />
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Shared protected */}
              <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />

              {/* Student routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/top-rated" element={<ProtectedRoute roles={['student']}><TopRated /></ProtectedRoute>} />
              <Route path="/student/feedback" element={<ProtectedRoute roles={['student']}><FeedbackForm /></ProtectedRoute>} />
              <Route path="/student/complaint" element={<ProtectedRoute roles={['student']}><ComplaintForm /></ProtectedRoute>} />
              <Route path="/student/complaints" element={<ProtectedRoute roles={['student']}><MyComplaints /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/sentiment" element={<ProtectedRoute roles={['admin']}><SentimentAnalytics /></ProtectedRoute>} />
              <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin']}><ComplaintManagement /></ProtectedRoute>} />

              {/* Doctor / shop / delivery dashboards (placeholder redirects) */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/shop/dashboard" element={<ProtectedRoute roles={['shop_owner']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/delivery/dashboard" element={<ProtectedRoute roles={['delivery_person']}><StudentProfile /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
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

export default App;
