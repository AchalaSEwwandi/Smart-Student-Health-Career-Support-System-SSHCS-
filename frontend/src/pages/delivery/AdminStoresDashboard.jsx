import { useNavigate } from 'react-router-dom';

const BG      = '#081225';
const CARD    = '#14233c';
const BORDER  = '#28476b';
const PRIMARY = '#3b82f6';
const TEXT    = '#f8fafc';
const MUTED   = '#94a3b8';

const navStyle = {
  background: 'rgba(8,18,37,0.95)',
  borderBottom: `1px solid ${BORDER}`,
  backdropFilter: 'blur(12px)',
  position: 'sticky', top: 0, zIndex: 50,
};

const stores = [
  {
    slug: 'cargils',
    name: 'Cargils',
    icon: '🏬',
    description: 'Leading supermarket chain. Manages groceries, essentials and packaged goods for campus students.',
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.25)',
    bg: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
  },
  {
    slug: 'abenayaka',
    name: 'Abenayaka Stores',
    icon: '🛒',
    description: 'Local campus store offering fresh produce, snacks and daily essentials at student-friendly prices.',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
    bg: 'linear-gradient(135deg, #065f46, #10b981)',
  },
  {
    slug: 'dewnini',
    name: 'Dewnini Stores',
    icon: '🧺',
    description: 'Specialises in household items, stationery and personal care products for hostel life.',
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
    bg: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
  },
];

export default function AdminStoresDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .store-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important; }
        .store-card:hover { transform: translateY(-6px) !important; }
        .manage-btn:hover { filter: brightness(1.15); }
        .back-btn-admin:hover { color: ${TEXT} !important; }
      `}</style>

      {/* Navbar */}
      <nav style={navStyle}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px rgba(59,130,246,0.3)` }}>
              <span style={{ fontSize: '1.1rem' }}>🏪</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT, margin: 0 }}>Admin Panel</p>
              <p style={{ fontSize: '0.7rem', color: PRIMARY, margin: 0 }}>Store Management</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="back-btn-admin"
              onClick={() => navigate('/delivery')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to User Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '1.25rem' }}>
            <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#93c5fd' }}>Admin Dashboard</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: TEXT, margin: '0 0 0.875rem', lineHeight: 1.2 }}>
            Store Management Dashboard
          </h1>
          <p style={{ fontSize: '1rem', color: MUTED, maxWidth: '36rem', margin: '0 auto', lineHeight: 1.7 }}>
            Select a store to manage orders, deliveries, payments, and performance metrics.
          </p>
        </div>

        {/* Stats row */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2.5rem', animationDelay: '0.08s' }}>
          {[
            { icon: '🏪', value: '3', label: 'Active Stores', color: PRIMARY },
            { icon: '📦', value: 'Live', label: 'Order Tracking', color: '#10b981' },
            { icon: '💳', value: 'Real-time', label: 'Payment Data', color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '1.25rem', padding: '1.25rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <p style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color, margin: '0 0 0.2rem' }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Store cards */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem', animationDelay: '0.14s' }}>
          {stores.map((store) => (
            <div
              key={store.slug}
              className="store-card"
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 32px ${store.glow}`; e.currentTarget.style.borderColor = store.accent; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 28px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = BORDER; }}
            >
              {/* Banner */}
              <div style={{ height: '7rem', background: store.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: '9rem', height: '9rem', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))', position: 'relative', zIndex: 1 }}>{store.icon}</span>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', color: TEXT, margin: '0 0 0.625rem' }}>{store.name}</h2>
                <p style={{ fontSize: '0.875rem', color: MUTED, lineHeight: 1.6, margin: '0 0 1.5rem', flex: 1 }}>{store.description}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {['Orders', 'Deliveries', 'Payments', 'Stats'].map((tag) => (
                    <span key={tag} style={{ fontSize: '0.7rem', fontWeight: 600, color: store.accent, background: `${store.glow}`, border: `1px solid ${store.accent}44`, borderRadius: '999px', padding: '0.2rem 0.625rem' }}>{tag}</span>
                  ))}
                </div>

                <button
                  id={`manage-store-${store.slug}`}
                  className="manage-btn"
                  onClick={() => navigate(`/admin/delivery/stores/${store.slug}`)}
                  style={{ width: '100%', padding: '0.8rem', fontWeight: 700, fontSize: '0.9rem', color: '#fff', background: store.bg, border: 'none', borderRadius: '0.875rem', cursor: 'pointer', transition: 'filter 0.2s', boxShadow: `0 4px 16px ${store.glow}` }}
                >
                  Manage Store →
                </button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.78rem', color: '#334155' }}>
          SSHCS Admin Panel · Store Management · Data is fetched live from MongoDB
        </p>
      </div>
    </div>
  );
}
