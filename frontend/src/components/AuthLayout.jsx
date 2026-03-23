import { Link } from 'react-router-dom';

/**
 * Shared layout for all auth pages.
 * Left: branded gradient panel with decorative blobs.
 * Right: form area with footer.
 */
const AuthLayout = ({ children, title, subtitle, panelContent }) => {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between"
           style={{ background: 'linear-gradient(145deg, #0f1f5c 0%, #1a3a8f 40%, #2563eb 80%, #3b82f6 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute top-1/2 right-[-40px] w-56 h-56 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #f0abfc, transparent)' }} />

        {/* Brand */}
        <div className="relative z-10 px-12 pt-12">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="text-4xl">🩺</span>
            <span className="text-white text-2xl font-bold tracking-wide">CareMate</span>
          </Link>
          <p className="text-blue-200 text-sm mt-1 ml-1">Smart Student Health &amp; Career Support</p>
        </div>

        {/* Center content (custom per page) */}
        <div className="relative z-10 px-12 flex-1 flex flex-col justify-center">
          {panelContent || (
            <>
              <h2 className="text-white text-4xl font-extrabold leading-tight mb-5">
                Your health,<br />your career,<br />
                <span className="text-blue-300">all in one place.</span>
              </h2>
              <div className="space-y-4 mt-2">
                {[
                  { icon: '🏥', text: 'Book doctor appointments instantly' },
                  { icon: '🛒', text: 'Pharmacy & grocery delivery on campus' },
                  { icon: '🤖', text: 'AI-powered career guidance & feedback' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-blue-100 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 px-12 pb-10">
          <p className="text-blue-300 text-xs">
            © {new Date().getFullYear()} CareMate (SSHCS). All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">

        {/* Mobile brand header (visible only on small screens) */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-5 bg-white border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <span className="text-blue-900 text-xl font-bold">CareMate</span>
          </Link>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {/* Page heading */}
          <div className="w-full max-w-md mb-7">
            <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>

          {/* Form card */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            {children}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <footer className="bg-white border-t border-gray-100 px-6 py-5">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} CareMate (SSHCS). All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xs text-gray-400 hover:text-blue-700 transition-colors">Home</Link>
              <span className="text-gray-200">|</span>
              <a href="mailto:support@caremate.lk" className="text-xs text-gray-400 hover:text-blue-700 transition-colors">Support</a>
              <span className="text-gray-200">|</span>
              <span className="text-xs text-gray-400">Privacy Policy</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default AuthLayout;
