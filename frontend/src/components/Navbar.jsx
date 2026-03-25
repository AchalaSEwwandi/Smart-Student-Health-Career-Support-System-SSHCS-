import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navLinks = [
  { name: 'Home', href: '#home', anchor: true },
  { name: 'Health Services', href: '#services', anchor: true },
  { name: 'AI Assistant', href: '#services', anchor: true },
  { name: 'About', href: '#features', anchor: true },
  { name: 'Contact', href: '#footer', anchor: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg shadow-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Care<span className="text-accent-light">Mate</span>
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-blue-100 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
            {/* Delivery nav link */}
            <button
              id="nav-delivery-btn"
              onClick={() => navigate('/delivery')}
              className="px-4 py-2 text-sm font-medium text-accent-light hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M10 12a1 1 0 102 0 1 1 0 00-2 0z" />
              </svg>
              Delivery
            </button>
            <a
              href="#cta"
              className="ml-3 px-5 py-2 text-sm font-semibold bg-accent text-white rounded-full shadow-lg shadow-accent/30 hover:bg-accent-dark hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Login
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-1 bg-primary-dark/50 backdrop-blur-sm">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => { setMobileOpen(false); navigate('/delivery'); }}
            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-accent-light hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            🛵 Delivery
          </button>
          <a
            href="#cta"
            onClick={() => setMobileOpen(false)}
            className="block text-center mt-2 px-5 py-2.5 text-sm font-semibold bg-accent text-white rounded-full shadow-lg shadow-accent/30"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
