import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_STYLES = {
  Pending:            { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b', border: 'rgba(245,158,11,0.35)',  icon: '⏳' },
  Processing:         { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)',   icon: '📦' },
  'Out for Delivery': { bg: 'rgba(249,115,22,0.12)',  text: '#f97316', border: 'rgba(249,115,22,0.35)',  icon: '🛵' },
  Delivered:          { bg: 'rgba(16,185,129,0.12)',  text: '#10b981', border: 'rgba(16,185,129,0.35)',  icon: '✅' },
};

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
  borderRadius: '1rem',
};

function getSessionKey() {
  let key = localStorage.getItem('sshcs_session_key');
  if (!key) {
    key = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('sshcs_session_key', key);
  }
  return key;
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const sessionKey = getSessionKey();
    axios
      .get('http://localhost:5000/api/orders/history', { headers: { 'X-Session-Key': sessionKey } })
      .then((res) => { setOrders(res.data.data || []); setFetchError(''); })
      .catch((err) => {
        setFetchError(err?.response?.data?.message || 'Unable to load order history. Please check your connection and try again.');
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'N/A'; }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .order-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important; }
        .order-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 24px ${GLOW} !important; border-color: ${PRIMARY} !important; }
        .track-btn:hover { background: rgba(59,130,246,0.25) !important; color: #93c5fd !important; }
        .rate-btn:hover { background: #1d4ed8 !important; }
        .confirm-btn:hover { background: rgba(16,185,129,0.3) !important; }
        .btn-new-order:hover { background: linear-gradient(135deg,#2563eb,#1d4ed8) !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,0.5) !important; }
        .back-btn:hover { color: ${TEXT} !important; }
        .retry-link:hover { text-decoration: none; opacity: 0.8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.45s ease both; }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);} }
        .float-icon { animation: float 3s ease-in-out infinite; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.4), 0 0 16px ${GLOW} !important; border-color: rgba(59,130,246,0.35) !important; }
        .stat-card { transition: all 0.25s ease; }
      `}</style>

      {/* Navbar */}
      <nav style={navStyle}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Page Header */}
        <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.875rem', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', border: `1px solid rgba(59,130,246,0.25)`, marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: PRIMARY }}>📋 Order History</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.25rem)', fontWeight: 800, color: TEXT, margin: '0 0 0.25rem' }}>My Orders</h1>
            <p style={{ fontSize: '0.875rem', color: MUTED, margin: 0 }}>Track your past and active campus deliveries</p>
          </div>
          <button
            className="btn-new-order"
            onClick={() => navigate('/delivery/shops')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 700, borderRadius: '0.75rem', background: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px rgba(59,130,246,0.4)`, fontSize: '0.875rem', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Order
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', border: `4px solid rgba(59,130,246,0.2)`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: '0.875rem', color: MUTED }}>Loading your orders...</p>
          </div>
        )}

        {/* Fetch Error */}
        {!loading && fetchError && (
          <div className="fade-up" style={{ padding: '1.25rem', borderRadius: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <svg width="18" height="18" fill="#fca5a5" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: '0.1rem' }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fca5a5', margin: '0 0 0.25rem' }}>Failed to load orders</p>
              <p style={{ fontSize: '0.8rem', color: '#f87171', margin: '0 0 0.5rem' }}>{fetchError}</p>
              <button className="retry-link" onClick={() => window.location.reload()} style={{ fontSize: '0.75rem', color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>↺ Retry</button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !fetchError && orders.length === 0 && (
          <div className="fade-up" style={{ ...cardBase, padding: '5rem 2rem', textAlign: 'center', background: `linear-gradient(160deg, #14233c 0%, #0e1c32 100%)` }}>
            <div className="float-icon" style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 8px 24px rgba(59,130,246,0.3))' }}>📭</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: TEXT, margin: '0 0 0.625rem' }}>No orders yet</h2>
            <p style={{ fontSize: '0.9rem', color: MUTED, margin: '0 0 0.5rem', maxWidth: '24rem', marginLeft: 'auto', marginRight: 'auto' }}>
              You haven't placed any orders from this device.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 2rem', maxWidth: '24rem', marginLeft: 'auto', marginRight: 'auto' }}>
              Orders are tied to this browser session. Place an order and it will appear here.
            </p>
            <button
              onClick={() => navigate('/delivery/shops')}
              style={{ padding: '0.875rem 2.25rem', borderRadius: '0.875rem', background: `linear-gradient(135deg, ${PRIMARY}, #1d4ed8)`, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 6px 24px rgba(59,130,246,0.45)`, fontSize: '0.95rem', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(59,130,246,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,130,246,0.45)'; }}
            >
              🛒 Place Your First Order
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !fetchError && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Stats Row */}
            <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '0.25rem' }}>
              {[
                { label: 'Total Orders', value: orders.length, icon: '📋' },
                { label: 'Delivered',    value: orders.filter(o => o.status === 'Delivered').length, icon: '✅' },
                { label: 'In Progress',  value: orders.filter(o => o.status !== 'Delivered').length, icon: '⚡' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="stat-card"
                  style={{ ...cardBase, padding: '1.25rem', textAlign: 'center', animationDelay: `${i * 0.06}s` }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{s.icon}</div>
                  <p style={{ fontWeight: 800, fontSize: '1.5rem', color: PRIMARY, margin: '0 0 0.25rem', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Order Cards */}
            {orders.map((order, oi) => {
              const s = STATUS_STYLES[order.status] || { bg: 'rgba(255,255,255,0.05)', text: '#cbd5e1', border: 'rgba(255,255,255,0.1)', icon: '❓' };
              const shopDisplayName = order.shopName || order.shop?.name || 'Campus Shop';

              return (
                <div
                  key={order._id}
                  className="order-card fade-up"
                  style={{ ...cardBase, overflow: 'hidden', animationDelay: `${oi * 0.07}s` }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: `1px solid rgba(40,71,107,0.5)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(59,130,246,0.1)', border: `1px solid rgba(59,130,246,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏪</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.925rem', color: TEXT, margin: '0 0 0.1rem' }}>{shopDisplayName}</p>
                        <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '999px', background: s.bg, color: s.text, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}>
                      {s.icon} {order.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem 1.5rem' }}>

                    {/* Amount Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.875rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'Item Total', val: `Rs. ${order.totalAmount}` },
                        { label: 'Delivery Fee', val: `Rs. ${order.deliveryCharge || 50}` },
                        { label: 'Grand Total', val: `Rs. ${order.grandTotal}`, green: true },
                        { label: 'Items', val: `${order.items?.length || 0} item(s)` },
                      ].map((a) => (
                        <div key={a.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', border: `1px solid rgba(40,71,107,0.4)` }}>
                          <p style={{ fontSize: '0.7rem', color: MUTED, margin: '0 0 0.2rem' }}>{a.label}</p>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: a.green ? '#10b981' : '#cbd5e1', margin: 0 }}>{a.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Item Tags */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {order.items.map((item, i) => (
                          <span key={i} style={{ fontSize: '0.72rem', fontWeight: 500, padding: '0.25rem 0.7rem', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: PRIMARY, border: `1px solid rgba(59,130,246,0.2)` }}>
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Status Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.7rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, ...(order.isDeliveryConfirmed ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' } : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }) }}>
                        {order.isDeliveryConfirmed ? '✅ Delivery Confirmed' : '⏸ Awaiting Confirmation'}
                      </span>
                      <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.7rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, ...(order.isRated ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' } : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }) }}>
                        {order.isRated ? '⭐ Rated' : '☆ Not Rated'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        className="track-btn"
                        onClick={() => navigate(`/delivery/tracking/${order._id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: PRIMARY, border: `1px solid rgba(59,130,246,0.2)`, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        Track Order
                      </button>
                      {order.status === 'Delivered' && !order.isRated && (
                        <button
                          className="rate-btn"
                          onClick={() => navigate(`/delivery/rating/${order._id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', fontSize: '0.8rem', fontWeight: 700, background: PRIMARY, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px rgba(59,130,246,0.35)`, transition: 'all 0.2s' }}
                        >
                          ⭐ Rate
                        </button>
                      )}
                      {order.status === 'Delivered' && !order.isDeliveryConfirmed && (
                        <button
                          className="confirm-btn"
                          onClick={() => navigate(`/delivery/confirmation/${order._id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          ✅ Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
