
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Health Services', href: '/student/doctors' },
  { name: 'Delivery', href: '#grocery' },
  { name: 'AI Assistant', href: '#services' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isStudentRoute = location.pathname.startsWith('/student');

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 bg-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-white tracking-tight">
                Care<span className="text-green-400">Mate</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} className="px-4 py-2 text-sm font-medium text-blue-100 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200">
                  {link.name}
                </Link>
              ))}
              
              {!user ? (
                  <Link to="/login" className="ml-3 px-5 py-2 text-sm font-semibold bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all">
                    Login
                  </Link>
              ) : (
                  <div className="ml-4 flex items-center space-x-4">
                      <span className="text-white text-sm font-semibold">Hello, {user.name}</span>
                      <button onClick={logout} className="px-5 py-2 text-sm font-semibold bg-red-500 text-white rounded-full hover:bg-red-600 transition-all">
                          Logout
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Sub Navigation for Student Health Services */}
      {isStudentRoute && user && user.role === 'student' && (
          <div className="bg-blue-100 border-b border-blue-200 shadow-sm">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex items-center space-x-6 py-3">
                     <Link to="/student/doctors" className="text-blue-800 font-semibold text-sm hover:text-blue-600 flex items-center">🔍 FIND DOCTORS</Link>
                     <Link to="/student/appointments" className="text-blue-800 font-semibold text-sm hover:text-blue-600 flex items-center">📅 MY APPOINTMENTS</Link>
                     <Link to="#" className="text-white bg-blue-700 font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-blue-800 flex items-center">💊 PHARMACY</Link>
                 </div>
             </div>
          </div>
      )}
    </>
  );
}
