import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_STYLES = {
  Pending:           { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B', border: 'rgba(245,158,11,0.3)',  icon: '⏳' },
  Processing:        { bg: 'rgba(96,165,250,0.1)',   text: '#60A5FA', border: 'rgba(96,165,250,0.25)', icon: '📦' },
  'Out for Delivery':{ bg: 'rgba(249,115,22,0.1)',   text: '#F97316', border: 'rgba(249,115,22,0.3)',  icon: '🛵' },
  Delivered:         { bg: 'rgba(16,185,129,0.1)',   text: '#10B981', border: 'rgba(16,185,129,0.3)', icon: '✅' },
};

// Get or generate the persistent session key
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
      .get('http://localhost:5000/api/orders/history', {
        headers: { 'X-Session-Key': sessionKey },
      })
      .then((res) => {
        setOrders(res.data.data || []);
        setFetchError('');
      })
      .catch((err) => {
        setFetchError(
          err?.response?.data?.message ||
          'Unable to load order history. Please check your connection and try again.'
        );
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-LK', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return 'N/A'; }
  };

  const darkCard = {
    background: '#1E293B',
    border: '1px solid rgba(96,165,250,0.1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  };

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Navbar */}
      <nav
        style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/delivery')}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: '#60A5FA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2563EB' }}>
              <span className="text-sm">🚚</span>
            </div>
            <span className="font-bold text-sm" style={{ color: '#F8FAFC' }}>SSHCS Delivery</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#F8FAFC' }}>Order History</h1>
            <p className="text-sm" style={{ color: '#CBD5E1' }}>Your past and active delivery orders</p>
          </div>
          <button
            onClick={() => navigate('/delivery/shops')}
            className="flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all duration-200 text-sm shrink-0 hover:-translate-y-0.5"
            style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            + New Order
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: 'rgba(96,165,250,0.3)', borderTopColor: '#60A5FA' }}
            />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading your orders...</p>
          </div>
        )}

        {/* Fetch Error */}
        {!loading && fetchError && (
          <div
            className="p-5 rounded-2xl flex items-start gap-3 mb-6"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#FCA5A5' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#FCA5A5' }}>Failed to load orders</p>
              <p className="text-xs mt-0.5" style={{ color: '#F87171' }}>{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs mt-2 underline"
                style={{ color: '#60A5FA' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !fetchError && orders.length === 0 && (
          <div className="rounded-3xl p-16 text-center" style={darkCard}>
            <div className="text-7xl mb-5">📭</div>
            <h2 className="font-bold text-xl mb-2" style={{ color: '#F8FAFC' }}>No orders yet</h2>
            <p className="text-sm mb-2" style={{ color: '#CBD5E1' }}>
              You haven't placed any orders from this device.
            </p>
            <p className="text-xs mb-6" style={{ color: '#475569' }}>
              Orders are tied to this browser session. Place an order and it will appear here.
            </p>
            <button
              onClick={() => navigate('/delivery/shops')}
              className="px-8 py-3 rounded-2xl font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
            >
              Place Your First Order
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !fetchError && orders.length > 0 && (
          <div className="space-y-4">

            {/* Summary Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { label: 'Total Orders',  value: orders.length },
                { label: 'Delivered',     value: orders.filter(o => o.status === 'Delivered').length },
                { label: 'In Progress',   value: orders.filter(o => o.status !== 'Delivered').length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 text-center"
                  style={darkCard}
                >
                  <p className="font-extrabold text-xl" style={{ color: '#60A5FA' }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {orders.map((order) => {
              const s = STATUS_STYLES[order.status] || { bg: 'rgba(255,255,255,0.05)', text: '#CBD5E1', border: 'rgba(255,255,255,0.1)', icon: '❓' };
              const shopDisplayName = order.shopName || order.shop?.name || 'Campus Shop';

              return (
                <div
                  key={order._id}
                  className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                  style={darkCard}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'}
                >
                  {/* Order Header */}
                  <div
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: '1px solid rgba(96,165,250,0.07)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}
                      >
                        🏪
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#F8FAFC' }}>{shopDisplayName}</p>
                        <p className="text-xs" style={{ color: '#64748B' }}>{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
                      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                    >
                      {s.icon} {order.status}
                    </span>
                  </div>

                  {/* Order Body */}
                  <div className="px-5 py-4">

                    {/* Amounts Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#64748B' }}>Item Total</p>
                        <p className="font-semibold text-sm" style={{ color: '#CBD5E1' }}>Rs. {order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#64748B' }}>Delivery Fee</p>
                        <p className="font-semibold text-sm" style={{ color: '#CBD5E1' }}>Rs. {order.deliveryCharge || 50}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#64748B' }}>Grand Total</p>
                        <p className="font-bold text-sm" style={{ color: '#10B981' }}>Rs. {order.grandTotal}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#64748B' }}>Items Count</p>
                        <p className="font-semibold text-sm" style={{ color: '#CBD5E1' }}>{order.items?.length || 0} item(s)</p>
                      </div>
                    </div>

                    {/* Item Tags */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {order.items.map((item, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(37,99,235,0.1)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.2)' }}
                          >
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Status Badges Row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={
                          order.isDeliveryConfirmed
                            ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
                            : { background: 'rgba(255,255,255,0.04)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        {order.isDeliveryConfirmed ? '✅ Delivery Confirmed' : '⏸ Awaiting Confirmation'}
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={
                          order.isRated
                            ? { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }
                            : { background: 'rgba(255,255,255,0.04)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        {order.isRated ? '⭐ Rated' : '☆ Not Rated'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/delivery/tracking/${order._id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                        style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.25)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.2)'; e.currentTarget.style.color = '#93C5FD'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.12)'; e.currentTarget.style.color = '#60A5FA'; }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Track Order
                      </button>
                      {order.status === 'Delivered' && !order.isRated && (
                        <button
                          onClick={() => navigate(`/delivery/rating/${order._id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                          style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                          onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                        >
                          ⭐ Rate
                        </button>
                      )}
                      {order.status === 'Delivered' && !order.isDeliveryConfirmed && (
                        <button
                          onClick={() => navigate(`/delivery/confirmation/${order._id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
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
