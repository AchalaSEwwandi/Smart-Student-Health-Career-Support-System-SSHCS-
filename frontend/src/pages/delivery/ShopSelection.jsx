import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FALLBACK_SHOPS = [
  { _id: 'cargils', name: 'Cargils', description: 'Leading supermarket chain with a wide variety of fresh & packaged goods.', location: 'Main Campus, Block A' },
  { _id: 'abenayaka', name: 'Abenayaka Stores', description: 'Fresh groceries & daily essentials at affordable prices.', location: 'Campus Gate 2' },
  { _id: 'dewnini', name: 'Dewnini Stores', description: 'Variety store for stationery, personal care & daily needs.', location: 'Student Area, Block C' },
];

const shopEmoji = (name) => {
  if (name.toLowerCase().includes('cargils')) return '🏪';
  if (name.toLowerCase().includes('abenayaka')) return '🛒';
  return '🏬';
};

const STEPS = [
  { label: 'Shop', icon: '🏪' },
  { label: 'Products', icon: '📦' },
  { label: 'Cart', icon: '🛒' },
  { label: 'Payment', icon: '💳' },
];

/* ─── shared token styles ─── */
const BG   = '#081225';
const CARD = '#14233c';
const BORDER = '#28476b';
const PRIMARY = '#3b82f6';
const GLOW = 'rgba(59,130,246,0.18)';
const TEXT  = '#f8fafc';
const MUTED = '#94a3b8';

const navStyle = {
  background: 'rgba(8,18,37,0.92)',
  borderBottom: `1px solid ${BORDER}`,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const cardBase = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 0 ${GLOW}`,
  borderRadius: '1rem',
  transition: 'all 0.25s ease',
};

export default function ShopSelection() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/shops')
      .then((res) => setShops(res.data.data && res.data.data.length > 0 ? res.data.data : FALLBACK_SHOPS))
      .catch(() => setShops(FALLBACK_SHOPS))
      .finally(() => setLoading(false));
  }, []);

  const handleShopClick = (shop) => {
    setSelected(shop._id);
    setError('');
    setTimeout(() => {
      navigate(`/delivery/products/${shop._id}`, { state: { shopName: shop.name } });
    }, 160);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .shop-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${PRIMARY}, 0 0 24px ${GLOW} !important; border-color: ${PRIMARY} !important; }
        .shop-card.selected { border-color: ${PRIMARY} !important; box-shadow: 0 0 0 2px ${PRIMARY}, 0 0 32px ${GLOW} !important; }
        .btn-primary:hover { background: linear-gradient(135deg,#2563eb,#1d4ed8) !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,0.5) !important; }
        .back-btn:hover { color: ${TEXT} !important; }
        .step-pulse { animation: stepPulse 2s ease-in-out infinite; }
        @keyframes stepPulse { 0%,100%{box-shadow:0 0 12px rgba(59,130,246,0.4);} 50%{box-shadow:0 0 24px rgba(59,130,246,0.8);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* Navbar */}
      <nav style={{ ...navStyle, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            className="back-btn"
            onClick={() => navigate('/delivery')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${GLOW}` }}>
              <span style={{ fontSize: '0.9rem' }}>🚚</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT }}>SSHCS Delivery</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', border: `1px solid rgba(59,130,246,0.3)`, marginBottom: '1rem' }}>
            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: PRIMARY, display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: PRIMARY }}>Step 1 of 4</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: TEXT, margin: '0 0 0.5rem' }}>Select a Shop</h1>
          <p style={{ fontSize: '0.9rem', color: MUTED, margin: 0 }}>Choose from available campus shops to start your order</p>
        </div>

        {/* Step Progress */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem' }}>
          {STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={i === 0 ? 'step-pulse' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                  ...(i === 0
                    ? { background: PRIMARY, color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#475569', border: `1px solid rgba(255,255,255,0.08)` }),
                }}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: '2rem', height: '2px', background: i < 0 ? PRIMARY : 'rgba(255,255,255,0.08)', margin: '0 0.125rem' }} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', border: `4px solid rgba(59,130,246,0.2)`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <p style={{ fontSize: '0.875rem', color: MUTED }}>Loading shops...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shops.map((shop, idx) => (
              <div
                key={shop._id}
                id={`shop-${shop.name?.toLowerCase().replace(/\s+/g, '-')}`}
                className={`shop-card fade-up ${selected === shop._id ? 'selected' : ''}`}
                style={{
                  ...cardBase,
                  display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem',
                  cursor: 'pointer', animationDelay: `${idx * 0.08}s`,
                  ...(selected === shop._id
                    ? { background: 'rgba(59,130,246,0.1)', borderColor: PRIMARY, boxShadow: `0 0 0 2px ${PRIMARY}, 0 0 32px ${GLOW}` }
                    : {}),
                }}
                onClick={() => handleShopClick(shop)}
              >
                {/* Icon */}
                <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '1rem', background: selected === shop._id ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.08)', border: `1px solid rgba(59,130,246,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                  {shopEmoji(shop.name)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: TEXT, margin: 0 }}>{shop.name}</h2>
                    {selected === shop._id && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: PRIMARY, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{shop.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: PRIMARY }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {shop.location}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: selected === shop._id ? PRIMARY : 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={selected === shop._id ? '#fff' : PRIMARY} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}

            {/* Continue CTA */}
            {selected && (
              <button
                className="btn-primary fade-up"
                onClick={() => {
                  const shop = shops.find((s) => s._id === selected);
                  if (shop) navigate(`/delivery/products/${shop._id}`, { state: { shopName: shop.name } });
                }}
                style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', borderRadius: '0.875rem', background: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`, color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: `0 4px 24px rgba(59,130,246,0.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.25s' }}
              >
                Continue to Products
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
