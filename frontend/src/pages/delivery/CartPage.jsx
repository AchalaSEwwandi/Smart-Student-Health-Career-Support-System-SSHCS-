import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STEPS = ['Shop', 'Products', 'Cart', 'Payment'];

// Generate or reuse a persistent session key for this browser
function getSessionKey() {
  let key = localStorage.getItem('sshcs_session_key');
  if (!key) {
    key = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('sshcs_session_key', key);
  }
  return key;
}

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qtyErrors, setQtyErrors] = useState({});

  const shopId = sessionStorage.getItem('shopId') || '';
  const shopName = sessionStorage.getItem('shopName') || 'Shop';

  useEffect(() => {
    const items = JSON.parse(sessionStorage.getItem('cart') || '[]');
    setCart(items);
  }, []);

  const updateQty = (id, val) => {
    const qty = parseInt(val);
    if (isNaN(qty) || qty <= 0) {
      setQtyErrors((e) => ({ ...e, [id]: 'Quantity must be at least 1' }));
      return;
    }
    if (qty > 99) {
      setQtyErrors((e) => ({ ...e, [id]: 'Maximum quantity is 99' }));
      return;
    }
    setQtyErrors((e) => { const n = { ...e }; delete n[id]; return n; });
    const updated = cart.map((i) => (i._id === id ? { ...i, quantity: qty } : i));
    setCart(updated);
    sessionStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter((i) => i._id !== id);
    setCart(updated);
    sessionStorage.setItem('cart', JSON.stringify(updated));
    setQtyErrors((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  const itemTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = 50;
  const grandTotal = itemTotal + deliveryCharge;

  const placeOrder = async () => {
    if (cart.length === 0) { setError('Your cart is empty! Please add items first.'); return; }
    if (cart.some((i) => !i.quantity || i.quantity <= 0)) { setError('Please ensure all item quantities are at least 1.'); return; }
    if (Object.keys(qtyErrors).length > 0) { setError('Please fix quantity errors before proceeding.'); return; }

    setError('');
    setLoading(true);

    const sessionKey = getSessionKey();

    const orderPayload = {
      shopId,
      shopName,  // send shopName so backend can store it as a plain string
      items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      deliveryAddress: 'Campus Hostel',
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders', orderPayload, {
        headers: { 'X-Session-Key': sessionKey },
      });
      const orderId = res.data.data._id;
      sessionStorage.setItem('orderId', orderId);
      sessionStorage.setItem('orderMeta', JSON.stringify({ itemTotal, deliveryCharge, grandTotal, shopName }));
      sessionStorage.removeItem('cart');
      navigate(`/delivery/payment/${orderId}`);
    } catch (err) {
      setError('Failed to place order. Please try again. (' + (err?.response?.data?.message || 'Server error') + ')');
    } finally {
      setLoading(false);
    }
  };

  const darkCard = { background: '#1E293B', border: '1px solid rgba(96,165,250,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Navbar */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: '#60A5FA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
          <span className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.25)' }}>
            From: {shopName}
          </span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>Step 3 of 4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: '#F8FAFC' }}>Your Cart</h1>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Review your items before placing the order</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={i === 2
                  ? { background: '#2563EB', color: '#F8FAFC', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }
                  : i < 2
                  ? { background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >{i + 1}. {s}</span>
              {i < 3 && <svg className="w-4 h-4" style={{ color: '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
            </div>
          ))}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl p-16 text-center" style={darkCard}>
            <div className="text-7xl mb-5">🛒</div>
            <h2 className="font-bold text-xl mb-2" style={{ color: '#F8FAFC' }}>Your cart is empty</h2>
            <p className="text-sm mb-6" style={{ color: '#CBD5E1' }}>Go back and add some items from a shop.</p>
            <button
              onClick={() => navigate('/delivery/shops')}
              className="px-8 py-3 rounded-2xl font-semibold transition-all duration-200"
              style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
            >
              Browse Shops
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Cart Items */}
            <div className="rounded-3xl overflow-hidden" style={darkCard}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                <h3 className="font-bold" style={{ color: '#F8FAFC' }}>Order Items</h3>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.2)' }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ borderTop: 'none' }}>
                {cart.map((item, idx) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 px-6 py-4"
                    style={idx < cart.length - 1 ? { borderBottom: '1px solid rgba(96,165,250,0.06)' } : {}}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#F8FAFC' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>Rs. {item.price} each</p>
                      {qtyErrors[item._id] && (
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#FCA5A5' }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          {qtyErrors[item._id]}
                        </p>
                      )}
                    </div>
                    <input
                      type="number" min="1" max="99" value={item.quantity}
                      onChange={(e) => updateQty(item._id, e.target.value)}
                      className="w-16 px-2 py-2 text-center rounded-xl text-sm focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: qtyErrors[item._id] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(96,165,250,0.2)',
                        color: '#F8FAFC',
                      }}
                    />
                    <p className="font-bold text-sm w-20 text-right" style={{ color: '#10B981' }}>Rs. {item.price * item.quantity}</p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#FCA5A5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171'; }}
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="rounded-3xl overflow-hidden" style={darkCard}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                <h3 className="font-bold" style={{ color: '#F8FAFC' }}>Price Summary</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#94A3B8' }}>Item Total ({cart.length} items)</span>
                  <span style={{ color: '#CBD5E1' }}>Rs. {itemTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#94A3B8' }}>Delivery Charge</span>
                  <span style={{ color: '#CBD5E1' }}>Rs. {deliveryCharge}</span>
                </div>
                <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(96,165,250,0.1)' }}>
                  <span className="font-bold" style={{ color: '#F8FAFC' }}>Grand Total</span>
                  <span className="font-extrabold text-lg" style={{ color: '#10B981' }}>Rs. {grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-2xl flex items-center gap-2 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {/* Place Order */}
            <button
              id="place-order-btn"
              onClick={placeOrder}
              disabled={loading}
              className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 24px rgba(37,99,235,0.45)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
