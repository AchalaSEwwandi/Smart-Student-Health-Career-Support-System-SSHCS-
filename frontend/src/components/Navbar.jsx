import { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const DASHBOARD_LINKS = {
  student: '/student/dashboard',
  doctor: '/doctor/dashboard',
  shop_owner: '/shop/dashboard',
  delivery_person: '/delivery/dashboard',
  admin: '/admin/dashboard',
};

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/#services', label: 'Health Services' },
  { to: '/#delivery', label: 'Delivery' },
  { to: '/#ai', label: 'AI Assistant' },
  { to: '/#about', label: 'About' },
  { to: '/#contact', label: 'Contact' },
];

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardPath = DASHBOARD_LINKS[role] || '/';

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-lg">❤</span>
            </div>
            <span className="text-white text-lg font-bold">
              Care<span className="text-green-400">Mate</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {(!isAuthenticated || role === 'student') ? (
              <>
                {NAV_LINKS.map(({ to, label }) => (
                  <Fragment key={label}>
                    <Link
                      to={to}
                      className="text-white/80 hover:text-white text-sm font-medium transition"
                    >
                      {label}
                    </Link>
                    {/* Inject Dropdown after AI Assistant for authenticated students */}
                    {label === 'AI Assistant' && isAuthenticated && role === 'student' && (
                      <div className="relative group">
                        <button className="text-white/80 hover:text-white text-sm font-medium transition flex items-center gap-1 focus:outline-none focus:ring-0 cursor-pointer pb-2 -mb-2">
                          My Dashboard <span className="text-[10px]">▼</span>
                        </button>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                          <div className="bg-white rounded-xl shadow-xl w-48 py-2 border border-gray-100 flex flex-col items-center">
                            <Link to="/student/dashboard" className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-h-50 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/student/complaints" className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition">Complaints</Link>
                            <Link to="/student/top-rated" className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition">Top Rated</Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </Fragment>
                ))}
              </>
            ) : (
              <>
                <Link to={dashboardPath} className="text-white/80 hover:text-white text-sm">
                  Dashboard
                </Link>

                {role === 'admin' && (
                  <>
                    <Link to="/admin/users" className="text-white/80 hover:text-white text-sm">Users</Link>
                    <Link to="/admin/complaints" className="text-white/80 hover:text-white text-sm">Complaints</Link>
                    <Link to="/admin/sentiment" className="text-white/80 hover:text-white text-sm">Analytics</Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="px-5 py-2 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition"
                >
                  Login
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  className="px-5 py-2 border border-green-400 text-green-400 rounded-full text-sm font-semibold hover:bg-green-400 hover:text-white transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Link to="/profile" className="flex items-center gap-2">
                  {user?.avatar ? (
                    <img
                      src={`http://localhost:5000${user.avatar}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-green-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-white">{user?.name}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-2">
            {(!isAuthenticated || role === 'student') ? (
              <>
                {NAV_LINKS.map(({ to, label }) => (
                  <Fragment key={label}>
                    <Link
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="block text-white/80 hover:text-white py-2"
                    >
                      {label}
                    </Link>
                    {label === 'AI Assistant' && isAuthenticated && role === 'student' && (
                      <div className="pl-4 border-l-2 border-white/20 my-2 space-y-2">
                        <Link to="/student/dashboard" onClick={() => setMobileOpen(false)} className="block text-white/70 hover:text-white text-sm py-1">➔ Dashboard</Link>
                        <Link to="/student/complaints" onClick={() => setMobileOpen(false)} className="block text-white/70 hover:text-white text-sm py-1">➔ Complaints</Link>
                        <Link to="/student/top-rated" onClick={() => setMobileOpen(false)} className="block text-white/70 hover:text-white text-sm py-1">➔ Top Rated</Link>
                      </div>
                    )}
                  </Fragment>
                ))}

                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="block text-center mt-2 bg-green-500 text-white py-2 rounded-full">
                      Login
                    </Link>
                    <Link to="/register" className="block text-center border border-green-400 text-green-400 py-2 mt-2 rounded-full">
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-white py-2">Profile</Link>
                    <button onClick={handleLogout} className="block text-red-400 py-2 w-full text-left">
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="block text-white py-2">Dashboard</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-white py-2">Profile</Link>

                <button onClick={handleLogout} className="block text-red-400 py-2 w-full text-left">
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;