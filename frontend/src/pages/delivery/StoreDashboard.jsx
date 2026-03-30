import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE        = 'http://localhost:5000/api/admin/stores';
const ORDERS_BASE = 'http://localhost:5000/api/admin/stores';

const BG      = '#081225';
const CARD    = '#14233c';
const BORDER  = '#28476b';
const PRIMARY = '#3b82f6';
const TEXT    = '#f8fafc';
const MUTED   = '#94a3b8';

/* ── store meta ── */
const STORE_META = {
  cargils:   { name: 'Cargils',          icon: '🏬', accent: '#3b82f6', glow: 'rgba(59,130,246,0.25)',  bg: 'linear-gradient(135deg,#1e3a8a,#2563eb)' },
  abenayaka: { name: 'Abenayaka Stores', icon: '🛒', accent: '#10b981', glow: 'rgba(16,185,129,0.25)', bg: 'linear-gradient(135deg,#065f46,#10b981)' },
  dewnini:   { name: 'Dewnini Stores',   icon: '🧺', accent: '#8b5cf6', glow: 'rgba(139,92,246,0.25)', bg: 'linear-gradient(135deg,#4c1d95,#7c3aed)' },
};

const STATUS_STEPS   = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];
const CATEGORIES     = ['Dairy', 'Bakery', 'Grains', 'Protein', 'Beverages', 'Essentials', 'Cooking', 'Dry Food', 'Sauces', 'Personal Care', 'Stationery', 'Health', 'General'];
const CATEGORY_EMOJI = {
  Dairy: '🥛', Bakery: '🍞', Grains: '🌾', Protein: '🥚', Beverages: '🧃',
  Essentials: '🧂', Cooking: '🫙', 'Dry Food': '🍜', Sauces: '🍅',
  'Personal Care': '🧴', Stationery: '📝', Health: '🧼', General: '📦',
};

/* ── small helpers ── */
const badge = (status) => {
  const map = {
    Pending:          { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    Processing:       { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
    'Out for Delivery': { bg: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
    Delivered:        { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    Success:          { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    'In Progress':    { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  };
  const s = map[status] || { bg: 'rgba(148,163,184,0.1)', color: MUTED, border: BORDER };
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const fmt     = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const shortId = (id) => String(id).slice(-6).toUpperCase();

/* ── section wrapper ── */
function Section({ title, icon, children, action }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '1.25rem', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: TEXT, margin: 0 }}>{title}</h2>
        </div>
        {action}
      </div>
      <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
    </div>
  );
}

/* ── table wrapper ── */
function Table({ cols, rows, empty }) {
  if (!rows.length) return <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.875rem', padding: '1.5rem 0' }}>{empty}</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '0.625rem 0.875rem', color: MUTED, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

const tdStyle = { padding: '0.75rem 0.875rem', color: TEXT, borderBottom: `1px solid rgba(40,71,107,0.5)`, verticalAlign: 'middle' };

/* ══════════════════════════════════════════════════════════════════ */
/* ── Status Update Cell ── */
const API_BASE = 'http://localhost:5000/api/orders';

function StatusCell({ order, onUpdated, accent }) {
  const [selected, setSelected] = useState(order.status);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);
  const isDirty = selected !== order.status;

  const showToast = (ok, msg) => { setToast({ ok, msg }); setTimeout(() => setToast(null), 3500); };

  const handleUpdate = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/${order._id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: selected }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
      showToast(true, `Status updated to "${selected}"`);
      onUpdated(order._id, selected);
    } catch (err) {
      showToast(false, err.message);
      setSelected(order.status);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '18rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={saving}
            style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', background: '#0c1a2e', border: `1.5px solid ${isDirty ? accent : '#28476b'}`, borderRadius: '0.5rem', color: isDirty ? '#f8fafc' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 2rem 0.4rem 0.65rem', cursor: saving ? 'not-allowed' : 'pointer', outline: 'none', transition: 'border-color 0.2s', boxShadow: isDirty ? `0 0 0 2px ${accent}30` : 'none' }}>
            {STATUS_STEPS.map((s) => <option key={s} value={s} style={{ background: '#0c1a2e', color: '#f8fafc', fontWeight: 600 }}>{s}</option>)}
          </select>
          <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: isDirty ? accent : '#475569', fontSize: '0.7rem' }}>▼</span>
        </div>
        <button onClick={handleUpdate} disabled={!isDirty || saving}
          style={{ padding: '0.4rem 0.9rem', borderRadius: '0.5rem', border: 'none', background: isDirty ? accent : 'rgba(255,255,255,0.05)', color: isDirty ? '#fff' : '#334155', fontSize: '0.78rem', fontWeight: 700, cursor: isDirty && !saving ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', transition: 'background 0.2s, color 0.2s', boxShadow: isDirty ? `0 2px 10px ${accent}44` : 'none', opacity: saving ? 0.7 : 1 }}
          onMouseEnter={e => { if (isDirty && !saving) e.currentTarget.style.filter = 'brightness(1.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
          {saving ? '⏳ Updating…' : 'Update'}
        </button>
      </div>
      {toast && (
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: toast.ok ? '#6ee7b7' : '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', background: toast.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)'}`, maxWidth: 'fit-content' }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/* ── Add Product Modal ── */
const EMPTY_FORM = { name: '', unit: '', description: '', category: '', price: '', stock: '', image: '', isAvailable: true };

function AddProductModal({ storeSlug, storeName, accent, onClose, onSaved }) {
  const [form,    setForm]    = useState({ ...EMPTY_FORM });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef();

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = {...e}; delete n[k]; return n; }); };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) { setErrors(e => ({ ...e, image: 'Only image files are allowed (jpg, png, webp, gif, svg)' })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(e => ({ ...e, image: 'Image must be smaller than 5MB' })); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { const b64 = ev.target.result; setPreview(b64); setForm(f => ({ ...f, image: b64 })); setErrors(er => { const n = {...er}; delete n.image; return n; }); };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Product name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Please select a category';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Price must be a positive number';
    if (form.stock !== '' && (isNaN(Number(form.stock)) || Number(form.stock) < 0))  e.stock = 'Stock must be >= 0';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${BASE}/${storeSlug}/products`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock || 0) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save product');
      onSaved(data.data);
    } catch (err) {
      setErrors(e => ({ ...e, _general: err.message }));
    } finally {
      setSaving(false);
    }
  };

  // Input style helper
  const inp = (hasErr) => ({
    width: '100%', boxSizing: 'border-box', background: '#0c1a2e', border: `1.5px solid ${hasErr ? 'rgba(239,68,68,0.6)' : BORDER}`,
    borderRadius: '0.625rem', color: TEXT, fontSize: '0.875rem', padding: '0.6rem 0.875rem',
    outline: 'none', transition: 'border-color 0.2s',
  });
  const lbl = { fontSize: '0.78rem', fontWeight: 600, color: MUTED, marginBottom: '0.35rem', display: 'block' };
  const err = (msg) => msg ? <p style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '0.25rem' }}>{msg}</p> : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#0e1e35', border: `1px solid ${BORDER}`, borderRadius: '1.5rem', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}20`, margin: '1rem' }}>

        {/* Modal Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg, rgba(20,35,60,0.9), rgba(8,18,37,0.9))` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${accent}, ${accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: `0 4px 16px ${accent}40` }}>➕</div>
            <div>
              <h2 style={{ color: TEXT, fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>Add New Product</h2>
              <p style={{ color: accent, fontSize: '0.72rem', margin: 0, fontWeight: 600 }}>{storeName} — Shop Owner Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, color: MUTED, width: '2rem', height: '2rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {errors._general && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.82rem' }}>
              ⚠️ {errors._general}
            </div>
          )}

          {/* Row 1: Name + Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={lbl}>Product Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inp(errors.name)} placeholder="e.g. Sugar" value={form.name} onChange={e => set('name', e.target.value)}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = errors.name ? 'rgba(239,68,68,0.6)' : BORDER} />
              {err(errors.name)}
            </div>
            <div>
              <label style={lbl}>Unit / Size</label>
              <input style={inp(false)} placeholder="e.g. 1kg, 500ml, Pack" value={form.unit} onChange={e => set('unit', e.target.value)}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = BORDER} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Description <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea style={{ ...inp(errors.description), resize: 'vertical', minHeight: '4.5rem', fontFamily: 'inherit' }}
              placeholder="Brief description of the product..." value={form.description} onChange={e => set('description', e.target.value)}
              onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = errors.description ? 'rgba(239,68,68,0.6)' : BORDER} />
            {err(errors.description)}
          </div>

          {/* Row 2: Category + Availability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={lbl}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inp(errors.category), appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: '2rem' }}
                  value={form.category} onChange={e => set('category', e.target.value)}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = errors.category ? 'rgba(239,68,68,0.6)' : BORDER}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0c1a2e' }}>{CATEGORY_EMOJI[c] || '📦'} {c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: MUTED, fontSize: '0.7rem' }}>▼</span>
              </div>
              {err(errors.category)}
            </div>
            <div>
              <label style={lbl}>Availability Status</label>
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.1rem' }}>
                {[{ v: true, label: '✅ In Stock' }, { v: false, label: '❌ Out of Stock' }].map(({ v, label }) => (
                  <button key={String(v)} type="button" onClick={() => set('isAvailable', v)}
                    style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: '0.625rem', border: `1.5px solid ${form.isAvailable === v ? accent : BORDER}`, background: form.isAvailable === v ? `${accent}20` : 'transparent', color: form.isAvailable === v ? accent : MUTED, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Price + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={lbl}>Price (Rs.) <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inp(errors.price)} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = errors.price ? 'rgba(239,68,68,0.6)' : BORDER} />
              {err(errors.price)}
            </div>
            <div>
              <label style={lbl}>Available Stock</label>
              <input style={inp(errors.stock)} type="number" min="0" placeholder="0" value={form.stock} onChange={e => set('stock', e.target.value)}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = errors.stock ? 'rgba(239,68,68,0.6)' : BORDER} />
              {err(errors.stock)}
            </div>
          </div>

          {/* Store (locked) */}
          <div>
            <label style={lbl}>Store</label>
            <input style={{ ...inp(false), color: accent, cursor: 'not-allowed', opacity: 0.85, fontWeight: 600 }} value={storeName} disabled />
            <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>Store is automatically set based on your current dashboard.</p>
          </div>

          {/* Image Upload */}
          <div>
            <label style={lbl}>Product Image</label>
            <div style={{ border: `2px dashed ${errors.image ? 'rgba(239,68,68,0.5)' : preview ? accent : BORDER}`, borderRadius: '0.875rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: preview ? `${accent}08` : 'rgba(255,255,255,0.01)' }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = accent} onMouseLeave={e => e.currentTarget.style.borderColor = preview ? accent : errors.image ? 'rgba(239,68,68,0.5)' : BORDER}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
              {preview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'center' }}>
                  <img src={preview} alt="preview" style={{ width: '5.5rem', height: '5.5rem', objectFit: 'cover', borderRadius: '0.75rem', border: `2px solid ${accent}44`, boxShadow: `0 4px 20px ${accent}30` }} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: '#6ee7b7', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>✓ Image selected</p>
                    <p style={{ color: MUTED, fontSize: '0.72rem', margin: '0.2rem 0 0' }}>Click to change image</p>
                  </div>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '2.5rem' }}>📷</span>
                  <p style={{ color: MUTED, fontSize: '0.82rem', margin: '0.5rem 0 0.25rem', fontWeight: 500 }}>Click to upload product image</p>
                  <p style={{ color: '#334155', fontSize: '0.72rem', margin: 0 }}>JPG, PNG, WebP, GIF — max 5MB</p>
                </div>
              )}
            </div>
            {err(errors.image)}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: `1px solid ${BORDER}` }}>
            <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '0.7rem 1.75rem', borderRadius: '0.75rem', border: 'none', background: saving ? '#1e3a5f' : `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : `0 4px 20px ${accent}50`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.75 : 1 }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
              {saving ? (
                <><span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Saving…</>
              ) : '💾 Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/* ── Products Panel ── */
function ProductsPanel({ storeSlug, meta, products, onAddClick }) {
  return (
    <Section
      title="Products"
      icon="🛍️"
      action={
        <button
          id="add-product-btn"
          onClick={onAddClick}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', border: 'none', background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`, color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${meta.accent}40`, transition: 'filter 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
          ➕ Add Product
        </button>
      }>
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.75rem' }}>📦</p>
          <p style={{ color: MUTED, fontSize: '0.875rem', marginBottom: '1rem' }}>No products yet for this store.</p>
          <button onClick={onAddClick}
            style={{ padding: '0.6rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: meta.accent, color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${meta.accent}40` }}>
            ➕ Add First Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {products.map(p => (
            <div key={p._id} style={{ background: '#0c1a2e', border: `1px solid ${BORDER}`, borderRadius: '1rem', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${meta.accent}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              {/* Product Image */}
              <div style={{ height: '7rem', background: `${meta.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>{CATEGORY_EMOJI[p.category] || '📦'}</span>
                )}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: TEXT, margin: '0 0 0.2rem', lineHeight: 1.3 }}>
                  {p.name}{p.unit ? ` (${p.unit})` : ''}
                </p>
                <p style={{ fontSize: '0.7rem', color: MUTED, margin: '0 0 0.5rem', lineHeight: 1.4 }}>{p.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: meta.accent, background: `${meta.accent}15`, border: `1px solid ${meta.accent}30`, borderRadius: '999px', padding: '0.15rem 0.5rem' }}>{p.category}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#6ee7b7' }}>Rs. {p.price}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', color: MUTED }}>Stock: {p.stock}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: p.isAvailable ? '#6ee7b7' : '#fca5a5', background: p.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '999px', padding: '0.15rem 0.45rem', border: `1px solid ${p.isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                    {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ── Filter Bar ── */
function FilterBar({ fields, values, onChange, accent }) {
  const inp = { background:'#0c1a2e', border:'1px solid #28476b', borderRadius:'0.5rem', color:'#f8fafc', fontSize:'0.78rem', padding:'0.38rem 0.7rem', outline:'none', width:'100%', transition:'border-color 0.2s' };
  const hasActive = Object.values(values).some(v => v !== '');
  return (
    <div style={{ background:'rgba(0,0,0,0.18)', border:'1px solid #28476b', borderRadius:'0.75rem', padding:'0.65rem 1rem', marginBottom:'1rem', display:'flex', flexWrap:'wrap', gap:'0.6rem', alignItems:'flex-end' }}>
      {fields.map(f => (
        <div key={f.key} style={{ flex:'1 1 9rem', minWidth:'8.5rem' }}>
          <label style={{ display:'block', fontSize:'0.65rem', fontWeight:700, color:'#94a3b8', marginBottom:'0.2rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</label>
          {f.type === 'select'
            ? <div style={{ position:'relative' }}>
                <select value={values[f.key]} onChange={e => onChange(f.key, e.target.value)}
                  style={{ ...inp, appearance:'none', WebkitAppearance:'none', cursor:'pointer', paddingRight:'1.3rem' }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#28476b'}>
                  <option value=''>All</option>
                  {(f.options || []).map(o => <option key={o} value={o} style={{ background:'#0c1a2e' }}>{o}</option>)}
                </select>
                <span style={{ position:'absolute', right:'0.45rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94a3b8', fontSize:'0.6rem' }}>▼</span>
              </div>
            : <input type={f.type || 'text'} placeholder={f.placeholder || 'Filter…'} value={values[f.key]} onChange={e => onChange(f.key, e.target.value)}
                style={inp} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#28476b'} />
          }
        </div>
      ))}
      {hasActive && (
        <button onClick={() => fields.forEach(f => onChange(f.key, ''))}
          style={{ padding:'0.35rem 0.75rem', borderRadius:'0.4rem', border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:'0.72rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', alignSelf:'flex-end' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

/* ── Generate Full Store Report PDF (direct download) ── */
const generateFullReport = (storeName, stats, orders, deliveries, payments, products) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const now = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const fd = d => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  const fm = n => `Rs. ${Number(n || 0).toLocaleString()}`;
  const si = id => String(id).slice(-6).toUpperCase();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const DB = [30, 58, 138]; // dark blue
  const LB = [239, 246, 255]; // light blue
  const MG = [100, 116, 139]; // muted gray

  // ── Header banner ──
  doc.setFillColor(...DB);
  doc.rect(0, 0, W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(`${storeName} — Shop Owner Report`, 12, 13);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('SSHCS · Smart Student Health & Career Support System', 12, 20);
  doc.text(`Generated: ${now}`, 12, 26);
  doc.text(`Orders: ${orders.length}  |  Payments: ${payments.length}  |  Products: ${products.length}`, W - 12, 20, { align: 'right' });

  let y = 40;

  const secHead = (label, yy) => {
    if (yy > H - 50) { doc.addPage(); yy = 15; }
    doc.setFillColor(...LB);
    doc.rect(10, yy - 4, W - 20, 8, 'F');
    doc.setDrawColor(...DB); doc.setLineWidth(0.8);
    doc.rect(10, yy - 4, 1.8, 8, 'F');
    doc.setTextColor(...DB); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yy + 0.5);
    return yy + 8;
  };

  const noData = (msg, yy) => {
    doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(...MG);
    doc.text(msg, 14, yy + 4);
    return yy + 12;
  };

  const tblOpts = (startY) => ({
    startY,
    theme: 'striped',
    headStyles: { fillColor: DB, fontSize: 7, fontStyle: 'bold', textColor: [255,255,255] },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { cellPadding: 1.8, overflow: 'linebreak' },
    margin: { left: 10, right: 10 },
  });

  // A. Summary
  y = secHead('A. STORE SUMMARY', y);
  autoTable(doc, {
    ...tblOpts(y),
    head: [['Total Orders', 'Completed Deliveries', 'Pending Orders', 'Total Revenue', 'Total Products']],
    body: [[
      String(stats?.totalOrders ?? orders.length),
      String(stats?.completedDeliveries ?? '—'),
      String(stats?.pendingOrders ?? '—'),
      `Rs. ${Number(stats?.totalRevenue || 0).toLocaleString()}`,
      String(products.length),
    ]],
  });
  y = doc.lastAutoTable.finalY + 8;

  // B. Orders
  y = secHead(`B. ORDERS MANAGEMENT (${orders.length})`, y);
  if (!orders.length) { y = noData('No orders found for this store.', y); }
  else {
    autoTable(doc, {
      ...tblOpts(y),
      head: [['Order ID', 'Date', 'Status', 'Items', 'Subtotal', 'Delivery', 'Total', 'Tel']],
      body: orders.map(o => [
        `#${si(o._id)}`, fd(o.createdAt), o.status || '—',
        (o.items || []).slice(0, 3).map(i => `${i.name} ×${i.quantity}`).join(', ') + (o.items?.length > 3 ? ` +${o.items.length - 3}` : ''),
        fm(o.totalAmount), fm(o.deliveryCharge || 50), fm(o.grandTotal), o.telephone || '—',
      ]),
      columnStyles: { 3: { cellWidth: 55 } },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // C. Deliveries
  y = secHead(`C. DELIVERY ASSIGNMENTS (${deliveries.length})`, y);
  if (!deliveries.length) { y = noData('No delivery assignments found for this store.', y); }
  else {
    autoTable(doc, {
      ...tblOpts(y),
      head: [['Assignment ID', 'Order ID', 'Delivery Person', 'Status', 'Assigned At']],
      body: deliveries.map(d => [
        `#${si(d._id)}`, `#${si(d.orderId)}`, d.deliveryPersonName || '—', d.status || '—', fd(d.assignedAt),
      ]),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // D. Payments
  y = secHead(`D. PAYMENTS TRACKING (${payments.length})`, y);
  if (!payments.length) { y = noData('No payments found for this store.', y); }
  else {
    autoTable(doc, {
      ...tblOpts(y),
      head: [['Payment ID', 'Order ID', 'Card', 'Subtotal', 'Delivery', 'Total', 'Status', 'Paid At']],
      body: payments.map(p => [
        `#${si(p._id)}`, `#${si(p.orderId)}`,
        `${p.cardType || '—'} ···· ${p.lastFourDigits || '—'}`,
        fm(p.subtotal), fm(p.deliveryCharge || 50), fm(p.total), p.status || '—', fd(p.paidAt),
      ]),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // E. Products
  y = secHead(`E. PRODUCTS CATALOGUE (${products.length})`, y);
  if (!products.length) { y = noData('No products added yet for this store.', y); }
  else {
    autoTable(doc, {
      ...tblOpts(y),
      head: [['Product Name', 'Category', 'Description', 'Price', 'Stock', 'Availability']],
      body: products.map(p => [
        `${p.name}${p.unit ? ` (${p.unit})` : ''}`, p.category || '—',
        (p.description || '—').substring(0, 70) + (p.description?.length > 70 ? '…' : ''),
        `Rs. ${p.price}`, String(p.stock || 0),
        p.isAvailable !== false ? 'In Stock' : 'Out of Stock',
      ]),
      columnStyles: { 2: { cellWidth: 80 } },
    });
  }

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
    doc.line(10, H - 10, W - 10, H - 10);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...MG);
    doc.text(`SSHCS · ${storeName} · Shop Owner Report — Confidential`, 12, H - 6);
    doc.text(`Page ${i} of ${total} · ${now}`, W - 12, H - 6, { align: 'right' });
  }

  // Direct download — no print dialog
  const filename = `${storeName.replace(/\s+/g, '-')}-Shop-Report.pdf`;
  doc.save(filename);
};


/* ── View Modal ── */
function ViewModal({ item, storeName, accent, onClose }) {
  if (!item) return null;
  const { type, data } = item;
  const F = ({ label, value }) => (
    <div style={{ display:'flex', gap:'1rem', padding:'.5rem 0', borderBottom:`1px solid rgba(40,71,107,0.35)` }}>
      <span style={{ width:'9rem', flexShrink:0, fontSize:'.78rem', color:MUTED, fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:'.85rem', color:TEXT, fontWeight:600, flex:1 }}>{value}</span>
    </div>
  );
  const Sec = ({ title, children }) => (
    <div style={{ marginBottom:'1.1rem' }}>
      <p style={{ fontSize:'.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:MUTED, margin:'0 0 .4rem', paddingBottom:'.3rem', borderBottom:`1px solid ${BORDER}` }}>{title}</p>
      {children}
    </div>
  );
  const AmtRow = ({ label, value, bold }) => (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize: bold ? '.92rem' : '.82rem', fontWeight: bold ? 800 : 400, color: bold ? '#6ee7b7' : MUTED, marginBottom: bold ? 0 : '.25rem', borderTop: bold ? `1px solid ${BORDER}` : 'none', paddingTop: bold ? '.35rem' : 0, marginTop: bold ? '.15rem' : 0 }}>
      <span>{label}</span><span style={{ color: bold ? '#6ee7b7' : TEXT }}>{value}</span>
    </div>
  );
  let icon, title, content;
  if (type === 'order') {
    icon = '📦'; title = 'Order Details';
    content = (<>
      <Sec title="Order Information">
        <F label="Order ID" value={`#${shortId(data._id)}`} />
        <F label="Store" value={storeName} />
        <F label="Status" value={badge(data.status)} />
        <F label="Order Date" value={fmtDate(data.createdAt)} />
        {data.deliveryAddress && <F label="Address" value={data.deliveryAddress} />}
        {data.deliveryArea && <F label="Area" value={data.deliveryArea} />}
        {data.telephone && <F label="Telephone" value={data.telephone} />}
        {data.email && <F label="Email" value={data.email} />}
      </Sec>
      <Sec title="Items Ordered">
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.8rem' }}>
            <thead><tr>{['Item','Qty','Price','Total'].map(h => <th key={h} style={{ padding:'.35rem .6rem', textAlign:'left', color:MUTED, fontSize:'.68rem', textTransform:'uppercase', borderBottom:`1px solid ${BORDER}` }}>{h}</th>)}</tr></thead>
            <tbody>{(data.items || []).map((it, i) => (
              <tr key={i}>
                <td style={{ padding:'.4rem .6rem', color:TEXT, borderBottom:`1px solid rgba(40,71,107,0.3)` }}>{it.name}</td>
                <td style={{ padding:'.4rem .6rem', color:TEXT, borderBottom:`1px solid rgba(40,71,107,0.3)`, textAlign:'center' }}>{it.quantity}</td>
                <td style={{ padding:'.4rem .6rem', color:TEXT, borderBottom:`1px solid rgba(40,71,107,0.3)`, textAlign:'right' }}>{fmt(it.price)}</td>
                <td style={{ padding:'.4rem .6rem', color:'#6ee7b7', fontWeight:700, borderBottom:`1px solid rgba(40,71,107,0.3)`, textAlign:'right' }}>{fmt((it.price || 0) * (it.quantity || 1))}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ marginTop:'.6rem', background:'rgba(0,0,0,0.2)', borderRadius:'.5rem', padding:'.65rem .9rem' }}>
          <AmtRow label="Subtotal" value={fmt(data.totalAmount)} />
          <AmtRow label="Delivery Charge" value={fmt(data.deliveryCharge || 50)} />
          <AmtRow label="Grand Total" value={fmt(data.grandTotal)} bold />
        </div>
      </Sec>
    </>);
  } else if (type === 'delivery') {
    icon = '🚚'; title = 'Delivery Assignment';
    content = (
      <Sec title="Assignment Details">
        <F label="Assignment ID" value={`#${shortId(data._id)}`} />
        <F label="Order ID" value={`#${shortId(data.orderId)}`} />
        <F label="Store" value={storeName} />
        <F label="Delivery Person" value={data.deliveryPersonName || 'Unassigned'} />
        <F label="Status" value={badge(data.status)} />
        <F label="Assigned At" value={fmtDate(data.assignedAt)} />
      </Sec>
    );
  } else {
    icon = '💳'; title = 'Payment Details';
    content = (<>
      <Sec title="Payment Information">
        <F label="Payment ID" value={`#${shortId(data._id)}`} />
        <F label="Order ID" value={`#${shortId(data.orderId)}`} />
        <F label="Store" value={storeName} />
        <F label="Card Type" value={data.cardType || '—'} />
        <F label="Card Number" value={`•••• •••• •••• ${data.lastFourDigits || '••••'}`} />
        <F label="Status" value={badge(data.status)} />
        <F label="Paid At" value={fmtDate(data.paidAt)} />
      </Sec>
      <Sec title="Amount Breakdown">
        <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:'.5rem', padding:'.65rem .9rem' }}>
          <AmtRow label="Subtotal" value={fmt(data.subtotal)} />
          <AmtRow label="Delivery Charge" value={fmt(data.deliveryCharge || 50)} />
          <AmtRow label="Grand Total" value={fmt(data.total)} bold />
        </div>
      </Sec>
    </>);
  }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:110, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'#0e1e35', border:`1px solid ${BORDER}`, borderRadius:'1.5rem', width:'100%', maxWidth:'620px', maxHeight:'90vh', overflowY:'auto', boxShadow:`0 32px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}20`, margin:'1rem' }}>
        <div style={{ padding:'1.1rem 1.4rem', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,18,37,0.8)', position:'sticky', top:0, zIndex:10, borderRadius:'1.5rem 1.5rem 0 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.7rem' }}>
            <span style={{ fontSize:'1.4rem' }}>{icon}</span>
            <div>
              <h3 style={{ color:TEXT, fontWeight:800, fontSize:'.95rem', margin:0 }}>{title}</h3>
              <p style={{ color:accent, fontSize:'.7rem', margin:0, fontWeight:600 }}>{storeName}</p>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${BORDER}`, color:MUTED, width:'1.9rem', height:'1.9rem', borderRadius:'.4rem', cursor:'pointer', fontSize:'.9rem', display:'flex', alignItems:'center', justifyContent:'center' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}>✕</button>
        </div>
        <div style={{ padding:'1.4rem' }}>{content}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function StoreDashboard() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();

  const meta = STORE_META[storeSlug] || { name: storeSlug, icon: '🏪', accent: PRIMARY, glow: 'rgba(59,130,246,0.25)', bg: 'linear-gradient(135deg,#1e3a8a,#2563eb)' };

  const [orders,     setOrders]     = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [payments,   setPayments]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [toast,      setToast]      = useState(null); // { ok, msg }
  const [ordF, setOrdF] = useState({ id: '', date: '' });
  const [delF, setDelF] = useState({ id: '', status: '' });
  const [payF, setPayF] = useState({ id: '', date: '' });
  const [viewItem, setViewItem] = useState(null); // { type, data }

  const showGlobalToast = (ok, msg) => { setToast({ ok, msg }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const settle = url => fetch(url).then(r => r.json()).catch(() => ({ success: false, data: [] }));
        const [o, d, p, s, prods] = await Promise.all([
          settle(`${BASE}/${storeSlug}/orders`),
          settle(`${BASE}/${storeSlug}/deliveries`),
          settle(`${BASE}/${storeSlug}/payments`),
          settle(`${BASE}/${storeSlug}/stats`),
          settle(`${BASE}/${storeSlug}/products`),
        ]);
        if (o.success)     setOrders(o.data);
        if (d.success)     setDeliveries(d.data);
        if (p.success)     setPayments(p.data);
        if (s.success)     setStats(s.data);
        if (prods.success) setProducts(prods.data);
        // Only show error if the core endpoint (orders) also failed — meaning backend is truly down
        if (!o.success && !s.success) {
          setError('Could not connect to backend. Make sure the server is running on port 5000.');
        }
      } catch (e) {
        setError('Could not load data. Make sure the backend server is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeSlug]);

  const handleStatusUpdated = useCallback((orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (String(o._id) === String(orderId) ? { ...o, status: newStatus } : o)));
    fetch(`${BASE}/${storeSlug}/stats`).then(r => r.json()).then(s => { if (s.success) setStats(s.data); }).catch(() => {});
  }, [storeSlug]);

  const handleProductSaved = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setShowModal(false);
    showGlobalToast(true, `"${newProduct.name}${newProduct.unit ? ` (${newProduct.unit})` : ''}" added successfully!`);
  };

  const filtOrders = orders.filter(o =>
    (!ordF.id   || shortId(o._id).includes(ordF.id.toUpperCase())) &&
    (!ordF.date || fmtDate(o.createdAt).toLowerCase().includes(ordF.date.toLowerCase()))
  );
  const filtDels = deliveries.filter(d =>
    (!delF.id     || shortId(d._id).includes(delF.id.toUpperCase())) &&
    (!delF.status || d.status === delF.status)
  );
  const filtPays = payments.filter(p =>
    (!payF.id   || shortId(p._id).includes(payF.id.toUpperCase())) &&
    (!payF.date || fmtDate(p.paidAt).toLowerCase().includes(payF.date.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
        .fade-up { animation: fadeUp 0.45s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
        .stat-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .stat-card:hover { transform: translateY(-4px); }
        tr:hover td { background: rgba(255,255,255,0.025); }
        select option:disabled { color: #475569; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0c1a2e; } ::-webkit-scrollbar-thumb { background: #28476b; border-radius: 3px; }
      `}</style>

      {/* Global success/error toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 200, padding: '0.875rem 1.25rem', borderRadius: '0.875rem', background: toast.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`, color: toast.ok ? '#6ee7b7' : '#fca5a5', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease', maxWidth: '22rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <nav style={{ background: 'rgba(8,18,37,0.95)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${meta.glow}` }}>
              <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT, margin: 0 }}>{meta.name}</p>
              <p style={{ fontSize: '0.7rem', color: meta.accent, margin: 0 }}>Shop Owner Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/delivery/stores')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', fontWeight: 500, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            All Stores
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Page title row — Add Product button on LEFT */}
        <div className="fade-up" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: TEXT, margin: '0 0 0.375rem' }}>
              {meta.icon} {meta.name} — Shop Owner Dashboard
            </h1>
            <p style={{ color: MUTED, fontSize: '0.9rem', margin: 0 }}>All data is filtered exclusively for this store.</p>
          </div>
          {/* ← Add Product button on the left side of the header area */}
          <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
            <button
              onClick={() => generateFullReport(meta.name, stats, orders, deliveries, payments, products)}
              style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.65rem 1.2rem', borderRadius:'0.875rem', border:'1px solid rgba(59,130,246,0.4)', background:'rgba(15,23,42,0.8)', color:'#93c5fd', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(0,0,0,0.35)', whiteSpace:'nowrap', transition:'filter 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.filter='brightness(1.2)'}
              onMouseLeave={e => e.currentTarget.style.filter='none'}>
              📄 Download Full Shop Report PDF
            </button>
            <button
              id="add-product-header-btn"
              onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', borderRadius: '0.875rem', border: 'none', background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)`, color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 6px 20px ${meta.accent}45`, transition: 'filter 0.2s, transform 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}>
              ➕ Add Product
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', border: `3px solid ${BORDER}`, borderTopColor: meta.accent, borderRadius: '50%' }} />
            <p style={{ color: MUTED, fontSize: '0.875rem' }}>Loading store data…</p>
          </div>
        ) : (
          <>
            {/* ── 1. System Performance Overview ── */}
            <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem', animationDelay: '0.05s' }}>
              {[
                { label: 'Total Orders',         value: stats?.totalOrders        ?? '—', icon: '📦', color: PRIMARY },
                { label: 'Completed Deliveries', value: stats?.completedDeliveries ?? '—', icon: '✅', color: '#10b981' },
                { label: 'Pending Orders',        value: stats?.pendingOrders      ?? '—', icon: '⏳', color: '#f59e0b' },
                { label: 'Total Revenue',         value: stats ? fmt(stats.totalRevenue) : '—', icon: '💰', color: '#a78bfa' },
                { label: 'Total Products',        value: products.length, icon: '🛍️', color: meta.accent },
              ].map((s) => (
                <div key={s.label} className="stat-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '1.1rem', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
                  <p style={{ fontSize: '1.6rem', margin: '0 0 0.5rem' }}>{s.icon}</p>
                  <p style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, margin: '0 0 0.2rem' }}>{s.value}</p>
                  <p style={{ fontSize: '0.72rem', color: MUTED, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── 2. Products ── */}
            <div className="fade-up" style={{ animationDelay: '0.08s' }}>
              <ProductsPanel storeSlug={storeSlug} meta={meta} products={products} onAddClick={() => setShowModal(true)} />
            </div>

            {/* ── 3. Orders Management ── */}
            <div className="fade-up" style={{ animationDelay: '0.1s' }}>
              <Section title="Orders Management" icon="📋">
                <FilterBar
                  accent={meta.accent}
                  fields={[
                    { key:'id',   label:'Order ID', type:'text', placeholder:'Search last 6 chars…' },
                    { key:'date', label:'Date',      type:'text', placeholder:'e.g. Mar 2026' },
                  ]}
                  values={ordF}
                  onChange={(k, v) => setOrdF(f => ({ ...f, [k]: v }))}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <span style={{ fontSize: '0.75rem' }}>ℹ️</span>
                  <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Use the <strong>dropdown</strong> to select a new status, then click <strong>Update</strong>. Status moves forward only.</span>
                </div>
                <Table
                  cols={['Order ID', 'Items', 'Total', 'Update Status', 'Date', 'Actions']}
                  empty={ordF.id || ordF.date ? 'No orders match the filter.' : 'No orders found for this store.'}
                  rows={filtOrders.map((o) => (
                    <tr key={o._id}>
                      <td style={tdStyle}><code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(o._id)}</code></td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {(o.items || []).slice(0, 3).map((item, i) => <span key={i} style={{ fontSize: '0.78rem', color: TEXT }}>{item.name} × {item.quantity}</span>)}
                          {o.items?.length > 3 && <span style={{ fontSize: '0.72rem', color: MUTED }}>+{o.items.length - 3} more</span>}
                        </div>
                      </td>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: '#6ee7b7' }}>{fmt(o.grandTotal)}</span></td>
                      <td style={{ ...tdStyle, minWidth: '20rem' }}><StatusCell order={o} onUpdated={handleStatusUpdated} accent={meta.accent} /></td>
                      <td style={tdStyle}><span style={{ color: MUTED, fontSize: '0.78rem' }}>{fmtDate(o.createdAt)}</span></td>
                      <td style={{ ...tdStyle, whiteSpace:'nowrap' }}>
                        <button onClick={() => setViewItem({ type:'order', data: o })}
                          style={{ padding:'.28rem .65rem', borderRadius:'.375rem', border:'1px solid rgba(59,130,246,0.35)', background:'rgba(59,130,246,0.1)', color:'#93c5fd', fontSize:'.72rem', fontWeight:700, cursor:'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.22)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(59,130,246,0.1)'}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  ))}
                />
              </Section>
            </div>

            {/* ── 4. Delivery Assign & Monitor ── */}
            <div className="fade-up" style={{ animationDelay: '0.15s' }}>
              <Section title="Delivery Assign &amp; Monitor" icon="🚚">
                <FilterBar
                  accent={meta.accent}
                  fields={[
                    { key:'id',     label:'Assignment ID', type:'text',   placeholder:'Search last 6 chars…' },
                    { key:'status', label:'Status',        type:'select', options: STATUS_STEPS },
                  ]}
                  values={delF}
                  onChange={(k, v) => setDelF(f => ({ ...f, [k]: v }))}
                />
                <Table
                  cols={['Assignment ID', 'Order ID', 'Delivery Person', 'Status', 'Assigned At', 'Actions']}
                  empty={delF.id || delF.status ? 'No assignments match the filter.' : 'No delivery assignments found for this store.'}
                  rows={filtDels.map((d) => (
                    <tr key={d._id}>
                      <td style={tdStyle}><code style={{ background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(d._id)}</code></td>
                      <td style={tdStyle}><code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(d.orderId)}</code></td>
                      <td style={tdStyle}>{d.deliveryPersonName}</td>
                      <td style={tdStyle}>{badge(d.status)}</td>
                      <td style={tdStyle}><span style={{ color: MUTED, fontSize: '0.78rem' }}>{fmtDate(d.assignedAt)}</span></td>
                      <td style={{ ...tdStyle, whiteSpace:'nowrap' }}>
                        <button onClick={() => setViewItem({ type:'delivery', data: d })}
                          style={{ padding:'.28rem .65rem', borderRadius:'.375rem', border:'1px solid rgba(139,92,246,0.35)', background:'rgba(139,92,246,0.1)', color:'#c4b5fd', fontSize:'.72rem', fontWeight:700, cursor:'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.22)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.1)'}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  ))}
                />
              </Section>
            </div>

            {/* ── 5. Payments Tracking ── */}
            <div className="fade-up" style={{ animationDelay: '0.2s' }}>
              <Section title="Payments Tracking" icon="💳">
                <FilterBar
                  accent={meta.accent}
                  fields={[
                    { key:'id',   label:'Payment ID', type:'text', placeholder:'Search last 6 chars…' },
                    { key:'date', label:'Paid Date',  type:'text', placeholder:'e.g. Mar 2026' },
                  ]}
                  values={payF}
                  onChange={(k, v) => setPayF(f => ({ ...f, [k]: v }))}
                />
                <Table
                  cols={['Payment ID', 'Order ID', 'Card', 'Subtotal', 'Delivery', 'Total', 'Status', 'Paid At', 'Actions']}
                  empty={payF.id || payF.date ? 'No payments match the filter.' : 'No payments found for this store.'}
                  rows={filtPays.map((p) => (
                    <tr key={p._id}>
                      <td style={tdStyle}><code style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(p._id)}</code></td>
                      <td style={tdStyle}><code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(p.orderId)}</code></td>
                      <td style={tdStyle}><span style={{ color: TEXT }}>{p.cardType} •••• {p.lastFourDigits}</span></td>
                      <td style={tdStyle}>{fmt(p.subtotal)}</td>
                      <td style={tdStyle}>{fmt(p.deliveryCharge)}</td>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: '#6ee7b7' }}>{fmt(p.total)}</span></td>
                      <td style={tdStyle}>{badge(p.status)}</td>
                      <td style={tdStyle}><span style={{ color: MUTED, fontSize: '0.78rem' }}>{fmtDate(p.paidAt)}</span></td>
                      <td style={{ ...tdStyle, whiteSpace:'nowrap' }}>
                        <button onClick={() => setViewItem({ type:'payment', data: p })}
                          style={{ padding:'.28rem .65rem', borderRadius:'.375rem', border:'1px solid rgba(16,185,129,0.35)', background:'rgba(16,185,129,0.1)', color:'#6ee7b7', fontSize:'.72rem', fontWeight:700, cursor:'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.22)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.1)'}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  ))}
                />
              </Section>
            </div>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#1e3a5f' }}>
          SSHCS · {meta.name} Shop Owner · Data sourced from MongoDB
        </p>
      </div>

      {viewItem && (
        <ViewModal
          item={viewItem}
          storeName={meta.name}
          accent={meta.accent}
          onClose={() => setViewItem(null)}
        />
      )}
      {/* Add Product Modal */}
      {showModal && (
        <AddProductModal
          storeSlug={storeSlug}
          storeName={meta.name}
          accent={meta.accent}
          onClose={() => setShowModal(false)}
          onSaved={handleProductSaved}
        />
      )}
    </div>
  );
}
