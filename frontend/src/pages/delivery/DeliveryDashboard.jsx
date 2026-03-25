import { useNavigate } from 'react-router-dom';

/* ─── design tokens ─── */
const BG      = '#081225';
const CARD    = '#14233c';
const BORDER  = '#28476b';
const PRIMARY = '#3b82f6';
const GLOW    = 'rgba(59,130,246,0.18)';
const TEXT    = '#f8fafc';
const MUTED   = '#94a3b8';

const navStyle = {
  background: 'rgba(8,18,37,0.92)',
  borderBottom: `1px solid ${BORDER}`,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  position: 'sticky',
  top: 0,
  zIndex: 50,
};

const cardBase = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  borderRadius: '1.25rem',
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();

  const featureCards = [
    {
      id: 'action-start-order',
      icon: '🛒',
      iconBg: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`,
      iconGlow: 'rgba(59,130,246,0.4)',
      title: 'Place New Order',
      description: 'Select a shop, browse products and checkout in minutes.',
      cta: 'Order now',
      ctaColor: PRIMARY,
      hoverBorder: PRIMARY,
      hoverGlow: GLOW,
      onClick: () => navigate('/delivery/shops'),
    },
    {
      id: 'action-view-history',
      icon: '📋',
      iconBg: 'linear-gradient(135deg, #4338ca, #6366f1)',
      iconGlow: 'rgba(99,102,241,0.4)',
      title: 'Order History',
      description: 'View all your past orders, status and delivery details.',
      cta: 'View history',
      ctaColor: '#a5b4fc',
      hoverBorder: '#6366f1',
      hoverGlow: 'rgba(99,102,241,0.18)',
      onClick: () => navigate('/delivery/history'),
    },
    {
      id: 'action-notifications',
      icon: '🔔',
      iconBg: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
      iconGlow: 'rgba(14,165,233,0.4)',
      title: 'Notices',
      isNotice: true,
    },
  ];

  const notices = [
    { dot: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', msg: 'System ready. Start your first order!' },
    { dot: PRIMARY,   bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', msg: '3 shops available on campus today' },
    { dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', msg: 'Flat delivery charge: Rs. 50 per order' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .feature-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important; }
        .feature-card:hover { transform: translateY(-5px) !important; }
        .stat-mini:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.4), 0 0 16px ${GLOW} !important; border-color: rgba(59,130,246,0.35) !important; }
        .stat-mini { transition: all 0.25s ease; }
        .hero-btn-primary:hover { background: rgba(255,255,255,0.95) !important; transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,0,0,0.3) !important; }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.2) !important; transform: translateY(-2px); }
        .back-btn:hover { color: ${TEXT} !important; }
        .icon-box { transition: transform 0.25s ease; }
        .feature-card:hover .icon-box { transform: scale(1.08) rotate(-2deg); }
        .cta-link { transition: gap 0.25s ease; }
        .feature-card:hover .cta-link { gap: 0.625rem !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);} }
        .truck-float { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.4);opacity:0.7;} }
        .live-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
      `}</style>

      {/* Navbar */}
      <nav style={navStyle}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${GLOW}` }}>
              <span className="truck-float" style={{ fontSize: '1.1rem', display: 'inline-block' }}>🚚</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT, margin: 0, lineHeight: 1.2 }}>SSHCS Delivery</p>
              <p style={{ fontSize: '0.7rem', color: PRIMARY, margin: 0, lineHeight: 1 }}>Campus Delivery Service</p>
            </div>
          </div>
          <button
            className="back-btn"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Back to Home
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Hero Banner */}
        <div
          className="fade-up"
          style={{
            borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '2rem',
            background: 'linear-gradient(135deg, #0f2460 0%, #1e3a8a 40%, #2563eb 100%)',
            boxShadow: '0 12px 48px rgba(37,99,235,0.4), 0 0 0 1px rgba(59,130,246,0.2)',
            position: 'relative',
          }}
        >
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: '-4rem', right: '-4rem', width: '18rem', height: '18rem', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-3rem', left: '30%', width: '12rem', height: '12rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
            {/* Left */}
            <div style={{ padding: 'clamp(2rem,4vw,3.5rem)', position: 'relative', zIndex: 1 }}>
              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '1.25rem' }}>
                <span className="live-dot" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Live Delivery Active</span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', fontWeight: 800, color: TEXT, lineHeight: 1.15, margin: '0 0 0.875rem' }}>
                Campus Delivery,<br />
                <span style={{ color: '#93c5fd' }}>Made Simple.</span>
              </h1>
              <p style={{ fontSize: 'clamp(0.875rem,1.5vw,1.1rem)', color: 'rgba(219,234,254,0.85)', marginBottom: '1.75rem', lineHeight: 1.6, maxWidth: '32rem' }}>
                Order groceries, essentials & more from campus shops — delivered straight to your hostel door.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  id="start-new-order-btn"
                  className="hero-btn-primary"
                  onClick={() => navigate('/delivery/shops')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', fontWeight: 700, borderRadius: '0.875rem', background: '#f8fafc', color: '#1e3a8a', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', fontSize: '0.95rem', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
                >
                  🛒 Start New Order
                </button>
                <button
                  id="view-order-history-btn"
                  className="hero-btn-secondary"
                  onClick={() => navigate('/delivery/history')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', fontWeight: 600, borderRadius: '0.875rem', background: 'rgba(255,255,255,0.1)', color: TEXT, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
                >
                  📋 View History
                </button>
              </div>
            </div>

            {/* Right — decorative emojis */}
            <div style={{ padding: '2rem 2.5rem 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', opacity: 0.7 }}>
              {['🚚', '📦', '🏪'].map((em, i) => (
                <div key={i} style={{ fontSize: '2.5rem', animation: `float ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.4}s`, display: 'inline-block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>{em}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem', animationDelay: '0.08s' }}>
          {[
            { icon: '🏪', value: '3', label: 'Campus Shops', color: PRIMARY },
            { icon: '⚡', value: '~30 min', label: 'Avg. Delivery', color: '#f59e0b' },
            { icon: '💳', value: 'Rs. 50', label: 'Delivery Charge', color: '#10b981' },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-mini"
              style={{ ...cardBase, padding: '1.25rem', textAlign: 'center', cursor: 'default' }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <p style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color, margin: '0 0 0.25rem', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '1.25rem', animationDelay: '0.14s' }}>

          {featureCards.map((card) => (
            <div
              key={card.id}
              id={card.id}
              className="feature-card"
              onClick={card.onClick}
              style={{
                ...cardBase,
                padding: '2rem',
                cursor: card.onClick ? 'pointer' : 'default',
              }}
              onMouseEnter={e => {
                if (!card.onClick) return;
                e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 32px ${card.hoverGlow}`;
                e.currentTarget.style.borderColor = card.hoverBorder;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              {/* Icon */}
              <div
                className="icon-box"
                style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: `0 6px 20px ${card.iconGlow}`, marginBottom: '1.25rem' }}
              >
                {card.icon}
              </div>

              <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: TEXT, margin: '0 0 0.625rem' }}>{card.title}</h3>

              {card.isNotice ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {notices.map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0.875rem', borderRadius: '0.75rem', background: n.bg, border: `1px solid ${n.border}` }}>
                      <span className="live-dot" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: n.dot, marginTop: '0.3rem', flexShrink: 0, display: 'inline-block' }} />
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#cbd5e1', margin: 0 }}>{n.msg}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '0.875rem', color: MUTED, lineHeight: 1.6, margin: '0 0 1.25rem' }}>{card.description}</p>
                  <div className="cta-link" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: card.ctaColor }}>
                    <span>{card.cta}</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
