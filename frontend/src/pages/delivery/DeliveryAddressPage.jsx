import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form) {
  const errors = {};

  if (!form.deliveryArea) {
    errors.deliveryArea = 'Please select a delivery area';
  }

  if (!form.deliveryAddress.trim()) {
    errors.deliveryAddress = 'Delivery address is required';
  }

  if (!form.telephone.trim()) {
    errors.telephone = 'Telephone number is required';
  } else if (!/^[0-9]{7,15}$/.test(form.telephone.replace(/[\s\-\+]/g, ''))) {
    errors.telephone = 'Enter a valid telephone number (digits only)';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.confirmedOrder) {
    errors.confirmedOrder = 'You must confirm the order and delivery details';
  }

  return errors;
}

const STEPS = ['Shop', 'Products', 'Cart', 'Payment', 'Delivery'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DeliveryAddressPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    deliveryArea: '',
    deliveryAddress: '',
    telephone: '',
    email: '',
    confirmedOrder: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((f) => ({ ...f, [name]: val }));
    if (touched[name]) {
      setErrors(validate({ ...form, [name]: val }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Mark all fields as touched
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/orders/${orderId}/delivery-address`, {
        deliveryArea: form.deliveryArea,
        deliveryAddress: form.deliveryAddress,
        telephone: form.telephone,
        email: form.email,
        confirmedOrder: form.confirmedOrder,
      });
      navigate(`/delivery/tracking/${orderId}`);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Style helpers ─────────────────────────────────────────────────────────
  const darkCard = {
    background: '#1E293B',
    border: '1px solid rgba(96,165,250,0.1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  };

  const inputStyle = (field) => ({
    background:
      errors[field] && touched[field] ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
    border:
      errors[field] && touched[field]
        ? '1px solid rgba(239,68,68,0.5)'
        : '1px solid rgba(96,165,250,0.2)',
    color: '#F8FAFC',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  });

  const ErrorMsg = ({ field }) =>
    errors[field] && touched[field] ? (
      <p
        style={{ color: '#FCA5A5', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {errors[field]}
      </p>
    ) : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }}
        className="sticky top-0 z-50"
      >
        <div
          className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#60A5FA')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-6a1 1 0 00-.293-.707l-2-2A1 1 0 0017 4H3z" />
            </svg>
            Delivery Details
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>
              Step 5 of 5 — Delivery Details
            </span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#F8FAFC' }}>
            Delivery Address
          </h1>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>
            Tell us where to deliver your order
          </p>
        </div>

        {/* ── Progress ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={
                  i === 4
                    ? { background: '#2563EB', color: '#F8FAFC', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }
                    : { background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }
                }
              >
                {i + 1}. {s}
              </span>
              {i < 4 && (
                <svg className="w-4 h-4" style={{ color: '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* ── Hotline Banner ─────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.2)' }}
          >
            <svg style={{ width: 18, height: 18, color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#10B981' }}>
              📞 Need Help? Contact Our Hotline
            </p>
            <p className="text-base font-bold" style={{ color: '#F8FAFC', letterSpacing: '0.05em' }}>
              0117678600
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              Available any time — we're here for you
            </p>
          </div>
        </div>

        {/* ── Server Error ───────────────────────────────────────────────────── */}
        {serverError && (
          <div
            className="rounded-2xl px-5 py-4 mb-5 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <svg style={{ width: 18, height: 18, color: '#F87171', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p style={{ color: '#FCA5A5', fontSize: 14 }}>{serverError}</p>
          </div>
        )}

        {/* ── Form ───────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate id="delivery-address-form">
          <div className="rounded-3xl overflow-hidden mb-5" style={darkCard}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
              <h3 className="font-bold text-sm" style={{ color: '#F8FAFC' }}>
                Delivery Information
              </h3>
            </div>
            <div className="px-6 py-5" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── Delivery Area ─────────────────────────────────────────────── */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#CBD5E1' }}
                >
                  Delivery Area <span style={{ color: '#F87171' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Inside Campus', 'Outside Campus (around 1km)'].map((area) => {
                    const isSelected = form.deliveryArea === area;
                    return (
                      <label
                        key={area}
                        htmlFor={`area-${area}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          borderRadius: 12,
                          cursor: 'pointer',
                          border: isSelected
                            ? '1.5px solid rgba(37,99,235,0.7)'
                            : errors.deliveryArea && touched.deliveryArea
                            ? '1px solid rgba(239,68,68,0.5)'
                            : '1px solid rgba(96,165,250,0.2)',
                          background: isSelected
                            ? 'rgba(37,99,235,0.15)'
                            : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.18s',
                        }}
                      >
                        <input
                          id={`area-${area}`}
                          type="radio"
                          name="deliveryArea"
                          value={area}
                          checked={isSelected}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          style={{ accentColor: '#2563EB', width: 16, height: 16, flexShrink: 0 }}
                        />
                        <span style={{ color: isSelected ? '#93C5FD' : '#CBD5E1', fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>
                          {area === 'Inside Campus' ? '🏫 ' : '🏘️ '}
                          {area}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <ErrorMsg field="deliveryArea" />
              </div>

              {/* ── Delivery Address ──────────────────────────────────────────── */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: '#CBD5E1' }}
                >
                  Delivery Address <span style={{ color: '#F87171' }}>*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  rows={3}
                  placeholder="e.g. Room 204, Block A, Campus Hostel..."
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    ...inputStyle('deliveryAddress'),
                    resize: 'vertical',
                    minHeight: 80,
                    fontFamily: 'inherit',
                  }}
                />
                <ErrorMsg field="deliveryAddress" />
              </div>

              {/* ── Telephone ─────────────────────────────────────────────────── */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: '#CBD5E1' }}
                >
                  Telephone Number <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input
                  id="telephone"
                  type="tel"
                  name="telephone"
                  placeholder="e.g. 0771234567"
                  value={form.telephone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={inputStyle('telephone')}
                  autoComplete="tel"
                />
                <ErrorMsg field="telephone" />
              </div>

              {/* ── Email ─────────────────────────────────────────────────────── */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: '#CBD5E1' }}
                >
                  Email Address <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="e.g. student@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={inputStyle('email')}
                  autoComplete="email"
                />
                <ErrorMsg field="email" />
              </div>

            </div>
          </div>

          {/* ── Confirmation Checkbox ─────────────────────────────────────────── */}
          <div
            className="rounded-2xl px-5 py-4 mb-5"
            style={{
              background: form.confirmedOrder
                ? 'rgba(37,99,235,0.1)'
                : errors.confirmedOrder && touched.confirmedOrder
                ? 'rgba(239,68,68,0.06)'
                : 'rgba(255,255,255,0.03)',
              border: form.confirmedOrder
                ? '1.5px solid rgba(37,99,235,0.4)'
                : errors.confirmedOrder && touched.confirmedOrder
                ? '1px solid rgba(239,68,68,0.5)'
                : '1px solid rgba(96,165,250,0.15)',
              transition: 'all 0.2s',
            }}
          >
            <label
              htmlFor="confirmedOrder"
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
            >
              <input
                id="confirmedOrder"
                type="checkbox"
                name="confirmedOrder"
                checked={form.confirmedOrder}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ accentColor: '#2563EB', width: 18, height: 18, marginTop: 1, flexShrink: 0 }}
              />
              <span style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.5 }}>
                I confirm this order and delivery details are correct, and I understand that changes
                cannot be made after submission.
              </span>
            </label>
            <ErrorMsg field="confirmedOrder" />
          </div>

          {/* ── Submit Button ─────────────────────────────────────────────────── */}
          <button
            id="submit-delivery-address-btn"
            type="submit"
            disabled={loading}
            className="w-full py-4 font-bold rounded-2xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: '#2563EB',
              color: '#F8FAFC',
              boxShadow: '0 4px 24px rgba(37,99,235,0.5)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 20, height: 20,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Saving Details...
              </>
            ) : (
              <>
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Continue to Order Tracking
              </>
            )}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: '#475569' }}>
            🔒 Your information is saved securely
          </p>
        </form>
      </div>

      {/* ── Spinner keyframes ───────────────────────────────────────────────── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
