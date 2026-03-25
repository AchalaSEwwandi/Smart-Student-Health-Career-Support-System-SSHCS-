import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STEPS = [
  { label: 'Shop', icon: '🏪' },
  { label: 'Products', icon: '📦' },
  { label: 'Cart', icon: '🛒' },
  { label: 'Payment', icon: '💳' },
];

/* ─── shared design tokens ─── */
const BG     = '#081225';
const CARD   = '#14233c';
const BORDER = '#28476b';
const PRIMARY = '#3b82f6';
const GLOW   = 'rgba(59,130,246,0.18)';
const TEXT   = '#f8fafc';
const MUTED  = '#94a3b8';

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

  const shopId   = sessionStorage.getItem('shopId')   || '';
  const shopName = sessionStorage.getItem('shopName') || 'Shop';

  useEffect(() => {
    const items = JSON.parse(sessionStorage.getItem('cart') || '[]');
    setCart(items);
  }, []);

  const updateQty = (id, val) => {
    const qty = parseInt(val);
    if (isNaN(qty) || qty <= 0) { setQtyErrors((e) => ({ ...e, [id]: 'Quantity must be at least 1' })); return; }
    if (qty > 99)               { setQtyErrors((e) => ({ ...e, [id]: 'Maximum quantity is 99' })); return; }
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

  const itemTotal      = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = 50;
  const grandTotal     = itemTotal + deliveryCharge;

  const placeOrder = async () => {
    if (cart.length === 0)                            { setError('Your cart is empty! Please add items first.'); return; }
    if (cart.some((i) => !i.quantity || i.quantity <= 0)) { setError('Please ensure all item quantities are at least 1.'); return; }
    if (Object.keys(qtyErrors).length > 0)            { setError('Please fix quantity errors before proceeding.'); return; }

    setError('');
    setLoading(true);
    const sessionKey = getSessionKey();
    const orderPayload = {
      shopId,
      shopName,
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

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .cart-item-row:hover { background: rgba(59,130,246,0.05) !important; }
        .qty-input:focus { border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; outline: none; }
        .remove-btn:hover { background: rgba(239,68,68,0.25) !important; color: #fca5a5 !important; }
        .btn-primary { background: linear-gradient(135deg, ${PRIMARY}, #1d4ed8); }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg,#2563eb,#1d4ed8) !important; transform: translateY(-2px); box-shadow: 0 10px 32px rgba(59,130,246,0.55) !important; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .back-btn:hover { color: ${TEXT} !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.45s ease both; }
        @keyframes spin{to{transform:rotate(360deg);}}
        .step-pulse { animation: stepPulse 2s ease-in-out infinite; }
        @keyframes stepPulse { 0%,100%{box-shadow:0 0 12px rgba(59,130,246,0.4);}50%{box-shadow:0 0 24px rgba(59,130,246,0.8);} }
      `}</style>

      {/* Navbar */}
      <nav style={navStyle}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Products
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.875rem', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', color: PRIMARY, border: `1px solid rgba(59,130,246,0.25)` }}>
            From: {shopName}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', border: `1px solid rgba(59,130,246,0.3)`, marginBottom: '1rem' }}>
            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: PRIMARY, display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: PRIMARY }}>Step 3 of 4</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: TEXT, margin: '0 0 0.5rem' }}>Your Cart</h1>
          <p style={{ fontSize: '0.9rem', color: MUTED, margin: 0 }}>Review your items before placing the order</p>
        </div>

        {/* Step Progress */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem' }}>
          {STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={i === 2 ? 'step-pulse' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                  ...(i === 2
                    ? { background: PRIMARY, color: '#fff' }
                    : i < 2
                    ? { background: 'rgba(59,130,246,0.15)', color: PRIMARY, border: `1px solid rgba(59,130,246,0.3)` }
                    : { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }),
                }}
              >
                <span>{step.icon}</span><span>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: '2rem', height: '2px', background: i < 2 ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)', margin: '0 0.125rem' }} />
              )}
            </div>
          ))}
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="fade-up" style={{ ...cardBase, padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '1.25rem', filter: 'drop-shadow(0 4px 16px rgba(59,130,246,0.3))' }}>🛒</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: TEXT, marginBottom: '0.5rem' }}>Your cart is empty</h2>
            <p style={{ fontSize: '0.875rem', color: MUTED, marginBottom: '1.75rem' }}>Go back and add some items from a shop.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/delivery/shops')}
              style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 4px 20px rgba(59,130,246,0.4)`, transition: 'all 0.25s' }}
            >Browse Shops</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Cart Items Card */}
            <div className="fade-up" style={cardBase}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid rgba(59,130,246,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontWeight: 700, color: TEXT, fontSize: '1rem', margin: 0 }}>Order Items</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', color: PRIMARY, border: `1px solid rgba(59,130,246,0.2)` }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                {cart.map((item, idx) => (
                  <div
                    key={item._id}
                    className="cart-item-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                      borderBottom: idx < cart.length - 1 ? `1px solid rgba(40,71,107,0.5)` : 'none',
                      transition: 'background 0.2s', borderRadius: 0,
                    }}
                  >
                    {/* Product icon */}
                    <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'rgba(59,130,246,0.1)', border: `1px solid rgba(59,130,246,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📦</div>

                    {/* Name + error */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: TEXT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: MUTED, margin: '0.125rem 0 0' }}>Rs. {item.price} each</p>
                      {qtyErrors[item._id] && (
                        <p style={{ fontSize: '0.7rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          {qtyErrors[item._id]}
                        </p>
                      )}
                    </div>

                    {/* Qty input */}
                    <input
                      type="number" min="1" max="99" value={item.quantity}
                      onChange={(e) => updateQty(item._id, e.target.value)}
                      className="qty-input"
                      style={{
                        width: '4rem', padding: '0.5rem', textAlign: 'center', borderRadius: '0.625rem', fontSize: '0.875rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: qtyErrors[item._id] ? '1px solid rgba(239,68,68,0.5)' : `1px solid ${BORDER}`,
                        color: TEXT, transition: 'border 0.2s, box-shadow 0.2s',
                      }}
                    />

                    {/* Line total */}
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#10b981', minWidth: '5rem', textAlign: 'right', margin: 0 }}>Rs. {item.price * item.quantity}</p>

                    {/* Remove */}
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item._id)}
                      title="Remove item"
                      style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="fade-up" style={{ ...cardBase, animationDelay: '0.08s' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid rgba(59,130,246,0.08)` }}>
                <h3 style={{ fontWeight: 700, color: TEXT, fontSize: '1rem', margin: 0 }}>Price Summary</h3>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: MUTED }}>Item Total ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>Rs. {itemTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: MUTED }}>Delivery Charge</span>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>Rs. {deliveryCharge}</span>
                </div>
                <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${BORDER}, transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: TEXT, fontSize: '1rem' }}>Grand Total</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.35rem', color: '#10b981', lineHeight: 1 }}>Rs. {grandTotal}</span>
                    <span style={{ fontSize: '0.7rem', color: MUTED, marginTop: '0.125rem' }}>Incl. delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {/* Proceed to Payment CTA */}
            <button
              id="place-order-btn"
              className="btn-primary fade-up"
              onClick={placeOrder}
              disabled={loading}
              style={{
                width: '100%', padding: '1.125rem', fontWeight: 700, borderRadius: '0.875rem',
                fontSize: '1.05rem', border: 'none', cursor: 'pointer', color: '#fff',
                boxShadow: `0 6px 28px rgba(59,130,246,0.45)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                transition: 'all 0.25s', animationDelay: '0.12s',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '1.125rem', height: '1.125rem', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Placing Order...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
