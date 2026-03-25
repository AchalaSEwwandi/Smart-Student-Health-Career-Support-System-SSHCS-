import { useNavigate } from 'react-router-dom';

export default function DeliveryDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Top Navbar */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#2563EB' }}>
              <span className="text-lg">🚚</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#F8FAFC' }}>SSHCS Delivery</p>
              <p className="text-xs" style={{ color: '#60A5FA' }}>Campus Delivery Service</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: '#60A5FA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero Banner */}
        <div
          className="rounded-3xl overflow-hidden mb-10 relative"
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)',
            boxShadow: '0 8px 40px rgba(37,99,235,0.35)',
          }}
        >
          <div className="grid lg:grid-cols-2 items-center">
            {/* Left */}
            <div className="p-8 lg:p-12 relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Live Delivery Active</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4" style={{ color: '#F8FAFC' }}>
                Campus Delivery,<br />
                <span style={{ color: '#93C5FD' }}>Made Simple.</span>
              </h1>
              <p className="text-base lg:text-lg mb-8 leading-relaxed" style={{ color: 'rgba(219,234,254,0.85)' }}>
                Order groceries, essentials & more from campus shops — delivered straight to your hostel door.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="start-new-order-btn"
                  onClick={() => navigate('/delivery/shops')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 font-bold rounded-2xl text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#F8FAFC', color: '#1E3A8A', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E0F2FE'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  🛒 Start New Order
                </button>
                <button
                  id="view-order-history-btn"
                  onClick={() => navigate('/delivery/history')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-2xl text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  📋 View History
                </button>
              </div>
            </div>

            {/* Right — illustration */}
            <div className="hidden lg:flex items-end justify-center relative h-72 overflow-hidden">
              <img
                src="/delivery-hero.png"
                alt="Campus delivery illustration"
                className="absolute bottom-0 right-0 h-full w-full object-cover object-center"
                style={{ opacity: 0.85, mixBlendMode: 'luminosity', filter: 'brightness(1.1) saturate(0.5) hue-rotate(220deg)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30,58,138,0.6), transparent)' }} />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🏪', value: '3', label: 'Campus Shops' },
            { icon: '⚡', value: '~30 min', label: 'Avg. Delivery' },
            { icon: '💳', value: 'Rs. 50', label: 'Delivery Charge' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: '#1E293B',
                border: '1px solid rgba(96,165,250,0.12)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-bold text-xl" style={{ color: '#60A5FA' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Start Order */}
          <div
            className="group rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2"
            style={{
              background: '#1E293B',
              border: '1px solid rgba(37,99,235,0.25)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
            onClick={() => navigate('/delivery/shops')}
            id="action-start-order"
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 40px rgba(37,99,235,0.4)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)'; }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-5"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
            >
              <span className="text-2xl">🛒</span>
            </div>
            <h3 className="font-bold text-xl mb-2" style={{ color: '#F8FAFC' }}>Place New Order</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#CBD5E1' }}>
              Select a shop, browse products and checkout in minutes.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-3 transition-all duration-200" style={{ color: '#60A5FA' }}>
              <span>Order now</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Order History */}
          <div
            className="group rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2"
            style={{
              background: '#1E293B',
              border: '1px solid rgba(96,165,250,0.15)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
            onClick={() => navigate('/delivery/history')}
            id="action-view-history"
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 40px rgba(96,165,250,0.25)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.15)'; }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-5"
              style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
            >
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-bold text-xl mb-2" style={{ color: '#F8FAFC' }}>Order History</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#CBD5E1' }}>
              View all your past orders, their status and delivery details.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-3 transition-all duration-200" style={{ color: '#A5B4FC' }}>
              <span>View history</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: '#1E293B',
              border: '1px solid rgba(96,165,250,0.12)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-5"
              style={{ background: 'linear-gradient(135deg, #0369A1, #0EA5E9)', boxShadow: '0 4px 16px rgba(14,165,233,0.35)' }}
            >
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="font-bold text-xl mb-4" style={{ color: '#F8FAFC' }}>Notices</h3>
            <div className="space-y-3">
              {[
                { dot: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', msg: 'System ready. Start your first order!' },
                { dot: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', msg: '3 shops available on campus today' },
                { dot: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', msg: 'Flat delivery charge: Rs. 50 per order' },
              ].map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl"
                  style={{ background: n.bg, border: `1px solid ${n.border}` }}
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.dot }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#CBD5E1' }}>{n.msg}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
