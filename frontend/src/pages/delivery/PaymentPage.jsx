import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function validate(form) {
  const errors = {};
  if (!form.cardType) errors.cardType = 'Please select a card type';
  if (!form.nameOnCard.trim()) errors.nameOnCard = 'Name on card is required';
  else if (form.nameOnCard.trim().length < 2) errors.nameOnCard = 'Please enter a valid cardholder name';
  const digitsOnly = form.cardNumber.replace(/\s/g, '');
  if (!digitsOnly) errors.cardNumber = 'Card number is required';
  else if (!/^\d{16}$/.test(digitsOnly)) errors.cardNumber = 'Card number must be exactly 16 digits';
  if (!form.expiryDate) errors.expiryDate = 'Expiry date is required';
  else {
    const [mm, yy] = form.expiryDate.split('/');
    const month = parseInt(mm, 10);
    const year = parseInt('20' + yy, 10);
    const now = new Date();
    if (!/^\d{2}\/\d{2}$/.test(form.expiryDate) || month < 1 || month > 12) {
      errors.expiryDate = 'Enter a valid MM/YY date';
    } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiryDate = 'Card has expired';
    }
  }
  if (!form.cvv) errors.cvv = 'CVV is required';
  else if (!/^\d{3}$/.test(form.cvv)) errors.cvv = 'CVV must be exactly 3 digits';
  return errors;
}

const STEPS = ['Shop', 'Products', 'Cart', 'Payment'];

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [priceMeta, setPriceMeta] = useState({ itemTotal: 0, deliveryCharge: 50, grandTotal: 50 });
  const [form, setForm] = useState({ cardType: '', nameOnCard: '', cardNumber: '', expiryDate: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/${orderId}/payment`)
      .then((res) => setPriceMeta(res.data.data))
      .catch(() => {
        const meta = JSON.parse(sessionStorage.getItem('orderMeta') || '{}');
        if (meta.grandTotal) setPriceMeta(meta);
      });
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cardNumber') val = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiryDate') {
      val = value.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    }
    if (name === 'cvv') val = value.replace(/\D/g, '').slice(0, 3);
    setForm((f) => ({ ...f, [name]: val }));
    if (touched[name]) setErrors(validate({ ...form, [name]: val }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/orders/pay', {
        orderId, cardType: form.cardType, nameOnCard: form.nameOnCard,
        cardNumber: form.cardNumber.replace(/\s/g, ''), expiryDate: form.expiryDate, cvv: form.cvv,
      });
    } catch (_) {}
    try { await axios.post('http://localhost:5000/api/orders/assign-delivery', { orderId }); } catch (_) {}
    navigate(`/delivery/address/${orderId}`);
    setLoading(false);
  };

  const inputStyle = (field) => ({
    background: errors[field] && touched[field] ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
    border: errors[field] && touched[field] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(96,165,250,0.2)',
    color: '#F8FAFC',
  });

  const ErrorMsg = ({ field }) =>
    errors[field] && touched[field] ? (
      <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#FCA5A5' }}>
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {errors[field]}
      </p>
    ) : null;

  const darkCard = { background: '#1E293B', border: '1px solid rgba(96,165,250,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Navbar */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            Back to Cart
          </button>
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure Payment
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>Step 4 of 4 — Final Step</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#F8FAFC' }}>Payment</h1>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Enter your card details to complete your order</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={i === 3
                  ? { background: '#2563EB', color: '#F8FAFC', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }
                  : { background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }
                }
              >{i + 1}. {s}</span>
              {i < 3 && <svg className="w-4 h-4" style={{ color: '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-3xl overflow-hidden mb-5" style={darkCard}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
            <h3 className="font-bold text-sm" style={{ color: '#F8FAFC' }}>Order Summary</h3>
          </div>
          <div className="px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: '#94A3B8' }}>Item Total</span>
              <span style={{ color: '#CBD5E1' }}>Rs. {priceMeta.itemTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#94A3B8' }}>Delivery Charge</span>
              <span style={{ color: '#CBD5E1' }}>Rs. {priceMeta.deliveryCharge}</span>
            </div>
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(96,165,250,0.1)' }}>
              <span className="font-bold" style={{ color: '#F8FAFC' }}>Grand Total</span>
              <span className="font-extrabold text-xl" style={{ color: '#10B981' }}>Rs. {priceMeta.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} noValidate id="payment-form">
          <div className="rounded-3xl overflow-hidden mb-5" style={darkCard}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
              <h3 className="font-bold text-sm" style={{ color: '#F8FAFC' }}>Card Details</h3>
            </div>
            <div className="px-6 py-5 space-y-4">

              {/* Card Type */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
                  Card Type <span style={{ color: '#F87171' }}>*</span>
                </label>
                <select
                  id="cardType" name="cardType" value={form.cardType}
                  onChange={handleChange} onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                  style={{ ...inputStyle('cardType'), background: errors.cardType && touched.cardType ? 'rgba(239,68,68,0.08)' : '#0F172A' }}
                >
                  <option value="">Select card type...</option>
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                </select>
                <ErrorMsg field="cardType" />
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
                  Name on Card <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input
                  id="nameOnCard" type="text" name="nameOnCard" placeholder="e.g. John Smith"
                  value={form.nameOnCard} onChange={handleChange} onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-600"
                  style={inputStyle('nameOnCard')}
                  autoComplete="cc-name"
                />
                <ErrorMsg field="nameOnCard" />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
                  Card Number <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input
                  id="cardNumber" type="text" name="cardNumber" placeholder="1234 5678 9012 3456"
                  value={form.cardNumber} onChange={handleChange} onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-600 font-mono tracking-widest"
                  style={inputStyle('cardNumber')} maxLength={19} autoComplete="cc-number"
                />
                <ErrorMsg field="cardNumber" />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
                    Expiry Date <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <input
                    id="expiryDate" type="text" name="expiryDate" placeholder="MM/YY"
                    value={form.expiryDate} onChange={handleChange} onBlur={handleBlur}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-600"
                    style={inputStyle('expiryDate')} maxLength={5} autoComplete="cc-exp"
                  />
                  <ErrorMsg field="expiryDate" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
                    CVV <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <input
                    id="cvv" type="password" name="cvv" placeholder="•••"
                    value={form.cvv} onChange={handleChange} onBlur={handleBlur}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-600"
                    style={inputStyle('cvv')} maxLength={3} autoComplete="cc-csc"
                  />
                  <ErrorMsg field="cvv" />
                </div>
              </div>

              {/* Card Preview */}
              <div className="rounded-2xl p-5 mt-2" style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)',
                boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
              }}>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(147,197,253,0.8)' }}>
                    {form.cardType || 'Card Type'}
                  </span>
                  {form.cardType === 'Visa' ? (
                    <span className="font-black text-xl italic" style={{ color: '#F8FAFC' }}>VISA</span>
                  ) : form.cardType === 'MasterCard' ? (
                    <div className="flex">
                      <div className="w-7 h-7 rounded-full opacity-90" style={{ background: '#EF4444' }} />
                      <div className="w-7 h-7 rounded-full opacity-90 -ml-3" style={{ background: '#F59E0B' }} />
                    </div>
                  ) : (
                    <div className="w-10 h-6 rounded-md" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  )}
                </div>
                <p className="font-mono text-base tracking-widest mb-5" style={{ color: '#F8FAFC' }}>
                  {form.cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(147,197,253,0.7)' }}>Cardholder</p>
                    <p className="text-sm font-semibold uppercase" style={{ color: '#F8FAFC' }}>{form.nameOnCard || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(147,197,253,0.7)' }}>Expires</p>
                    <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{form.expiryDate || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Submit */}
          <button
            id="confirm-pay-btn"
            type="submit"
            disabled={loading}
            className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 24px rgba(37,99,235,0.5)' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Confirm & Pay — Rs. {priceMeta.grandTotal}
              </>
            )}
          </button>
          <p className="text-center text-xs mt-3" style={{ color: '#475569' }}>🔒 Your payment info is encrypted and secure</p>
        </form>
      </div>
    </div>
  );
}
