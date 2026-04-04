import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function DeliveryConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!orderId) navigate('/delivery'); }, [orderId]);

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try { await axios.post(`http://localhost:5000/api/orders/${orderId}/confirm`); } catch (_) {}
    setConfirmed(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4" style={{ background: '#0F172A' }}>
      <div className="max-w-md w-full">
        {!confirmed ? (
          <div className="rounded-3xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid rgba(96,165,250,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            {/* Banner */}
            <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}>
              <div className="text-6xl mb-3 animate-bounce">📦</div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#F8FAFC' }}>Your Order Has Arrived!</h1>
              <p className="text-sm" style={{ color: 'rgba(219,234,254,0.8)' }}>Please confirm receipt of your delivery</p>
            </div>
            {/* Body */}
            <div className="p-8">
              <div className="space-y-3 mb-6">
                {[
                  { icon: '📋', msg: 'Check that all items in your order have been delivered correctly.' },
                  { icon: '✔️', msg: 'Confirming helps us mark the delivery complete and improve our service.' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                    <span className="text-lg mt-0.5">{n.icon}</span>
                    <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{n.msg}</p>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  id="confirm-received-btn"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Confirming...</>
                    : '✅ Yes, I Received My Order'
                  }
                </button>
                <button
                  onClick={() => navigate(`/delivery/tracking/${orderId}`)}
                  className="w-full py-3 rounded-2xl transition-all duration-200 text-sm font-medium"
                  style={{ background: 'transparent', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; e.currentTarget.style.color = '#93C5FD'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#60A5FA'; }}
                >
                  Back to Tracking
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            {/* Success Banner */}
            <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}>
              <div className="text-6xl mb-3">🎉</div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#F8FAFC' }}>Delivery Confirmed!</h1>
              <p className="text-sm" style={{ color: 'rgba(209,250,229,0.85)' }}>Thank you for confirming your delivery</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#CBD5E1' }}>
                Your order has been marked as delivered. We hope you enjoy your items! Please take a moment to rate your experience.
              </p>
              <div className="flex items-center justify-center gap-2 mb-8">
                {[1,2,3,4,5].map(i => <span key={i} className="text-2xl">⭐</span>)}
              </div>
              <div className="space-y-3">
                <button
                  id="go-to-rating-btn"
                  onClick={() => navigate(`/delivery/rating/${orderId}`)}
                  className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                >
                  ⭐ Rate Your Experience
                </button>
                <button
                  onClick={() => navigate('/delivery')}
                  className="w-full py-3 rounded-2xl transition-all duration-200 text-sm font-medium"
                  style={{ background: 'transparent', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; e.currentTarget.style.color = '#93C5FD'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#60A5FA'; }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
