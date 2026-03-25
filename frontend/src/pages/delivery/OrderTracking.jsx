import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const STATUS_STEPS = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];
const STATUS_META = {
  Pending:          { icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',  desc: 'Order received, awaiting confirmation'   },
  Processing:       { icon: '📦', color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)', desc: 'Order is being prepared at the shop'    },
  'Out for Delivery':{ icon: '🛵', color: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  desc: 'Your order is on its way to you!'       },
  Delivered:        { icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)', desc: 'Order has been delivered'               },
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchTracking = () => {
    axios
      .get(`http://localhost:5000/api/orders/${orderId}/tracking`)
      .then((res) => setTracking(res.data.data))
      .catch(() => setTracking({
        orderId,
        status: 'Processing',
        shopName: sessionStorage.getItem('shopName') || 'Campus Shop',
        grandTotal: JSON.parse(sessionStorage.getItem('orderMeta') || '{}').grandTotal || 0,
        deliveryPersonName: 'Kamal Perera',
        createdAt: new Date().toISOString(),
      }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTracking();
    intervalRef.current = setInterval(fetchTracking, 8000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const simulateNext = async () => {
    const idx = STATUS_STEPS.indexOf(tracking?.status);
    if (idx < STATUS_STEPS.length - 1) {
      const nextStatus = STATUS_STEPS[idx + 1];
      try { await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: nextStatus }); } catch (_) {}
      setTracking((t) => ({ ...t, status: nextStatus }));
    }
  };

  const currentIdx = STATUS_STEPS.indexOf(tracking?.status || 'Pending');
  const progressPct = Math.round(((currentIdx + 1) / STATUS_STEPS.length) * 100);
  const currentMeta = STATUS_META[tracking?.status] || STATUS_META.Pending;

  const darkCard = { background: '#1E293B', border: '1px solid rgba(96,165,250,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Navbar */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
          <span className="font-bold text-sm" style={{ color: '#F8FAFC' }}>Order Tracking</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: '#F8FAFC' }}>Track Your Order</h1>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Real-time delivery updates</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(96,165,250,0.3)', borderTopColor: '#60A5FA' }} />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading order info...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Status Banner */}
            <div
              className="rounded-3xl p-6 flex items-center gap-5"
              style={{ background: currentMeta.bg, border: `1px solid ${currentMeta.border}`, boxShadow: `0 4px 20px ${currentMeta.bg}` }}
            >
              <div className="text-5xl">{currentMeta.icon}</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: currentMeta.color, opacity: 0.8 }}>Current Status</p>
                <p className="font-extrabold text-2xl leading-tight" style={{ color: currentMeta.color }}>{tracking?.status}</p>
                <p className="text-sm mt-0.5" style={{ color: currentMeta.color, opacity: 0.75 }}>{currentMeta.desc}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="rounded-3xl overflow-hidden" style={darkCard}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                <h3 className="font-bold text-sm" style={{ color: '#F8FAFC' }}>Order Details</h3>
              </div>
              <div className="px-6 py-4 grid grid-cols-2 gap-4">
                {[
                  { label: 'Order ID', value: String(tracking?.orderId).slice(0, 18) + '...' },
                  { label: 'Shop', value: tracking?.shopName || '—' },
                  { label: 'Total Paid', value: `Rs. ${tracking?.grandTotal || 0}`, green: true },
                  { label: 'Delivery Person', value: tracking?.deliveryPersonName || 'Assigning...' },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-xs mb-0.5" style={{ color: '#64748B' }}>{d.label}</p>
                    <p className="font-semibold text-sm" style={{ color: d.green ? '#10B981' : '#F8FAFC' }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stepper */}
            <div className="rounded-3xl overflow-hidden" style={darkCard}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                <h3 className="font-bold text-sm" style={{ color: '#F8FAFC' }}>Order Progress</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.25)' }}>
                  {progressPct}%
                </span>
              </div>
              <div className="px-6 py-5">
                {/* Progress bar */}
                <div className="h-2 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #1D4ED8, #60A5FA)', boxShadow: '0 0 8px rgba(96,165,250,0.5)' }}
                  />
                </div>
                <div className="space-y-3">
                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentIdx;
                    const active = idx === currentIdx;
                    const meta = STATUS_META[step];
                    return (
                      <div
                        key={step}
                        className="flex items-center gap-4 p-3 rounded-2xl transition-all duration-200"
                        style={active ? { background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' } : {}}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all duration-200"
                          style={done
                            ? { background: '#2563EB', boxShadow: '0 4px 12px rgba(37,99,235,0.5)' }
                            : { background: 'rgba(255,255,255,0.05)' }
                          }
                        >
                          {idx < currentIdx ? (
                            <svg className="w-6 h-6" style={{ color: '#fff' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span style={done ? {} : { filter: 'grayscale(1)', opacity: 0.4 }}>{meta.icon}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: done ? '#F8FAFC' : '#475569' }}>{step}</p>
                          {active && <p className="text-xs animate-pulse mt-0.5" style={{ color: '#60A5FA' }}>← In progress</p>}
                          {idx < currentIdx && <p className="text-xs mt-0.5" style={{ color: '#10B981' }}>Completed</p>}
                          {!done && !active && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{meta.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Demo Simulate */}
            {tracking?.status !== 'Delivered' && (
              <button
                id="simulate-next-status-btn"
                onClick={simulateNext}
                className="w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,165,250,0.2)', color: '#60A5FA' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; e.currentTarget.style.color = '#93C5FD'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#60A5FA'; }}
              >
                🔄 Simulate Next Status (Demo)
              </button>
            )}

            {tracking?.status === 'Delivered' ? (
              <button
                id="confirm-delivery-btn"
                onClick={() => navigate(`/delivery/confirmation/${orderId}`)}
                className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                style={{ background: '#10B981', color: '#fff', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
              >
                ✅ Confirm Delivery Received
              </button>
            ) : (
              <button
                id="go-to-confirmation-btn"
                onClick={() => navigate(`/delivery/confirmation/${orderId}`)}
                className="w-full py-3 font-semibold rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
              >
                Mark as Received
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
