import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BASE      = 'http://localhost:5000/api/admin/stores';
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

const STATUS_STEPS = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];

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
function Section({ title, icon, children }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '1.25rem', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: TEXT, margin: 0 }}>{title}</h2>
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

/* ═══════════════════════════════════════════════════════════ */
/* ── Status Update Cell — Dropdown + Update Button ── */
const API_BASE = 'http://localhost:5000/api/orders';

function StatusCell({ order, onUpdated, accent }) {
  const currentIdx        = STATUS_STEPS.indexOf(order.status);
  const [selected, setSelected] = useState(order.status);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null); // { ok: bool, msg: string }

  const isDirty = selected !== order.status;

  const showToast = (ok, msg) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdate = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/${order._id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: selected }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
      showToast(true, `Status updated to "${selected}"`);
      onUpdated(order._id, selected);
    } catch (err) {
      showToast(false, err.message);
      setSelected(order.status); // revert on error
    } finally {
      setSaving(false);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '18rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

        {/* ── Styled Select Dropdown ── */}
        <div style={{ position: 'relative', flex: 1 }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={saving}
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              background: '#0c1a2e',
              border: `1.5px solid ${isDirty ? accent : '#28476b'}`,
              borderRadius: '0.5rem',
              color: isDirty ? '#f8fafc' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.4rem 2rem 0.4rem 0.65rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxShadow: isDirty ? `0 0 0 2px ${accent}30` : 'none',
            }}
          >
            {STATUS_STEPS.map((s) => (
              <option
                key={s}
                value={s}
                style={{ background: '#0c1a2e', color: '#f8fafc', fontWeight: 600 }}
              >
                {s}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <span style={{
            position: 'absolute', right: '0.5rem', top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: isDirty ? accent : '#475569',
            fontSize: '0.7rem',
          }}>▼</span>
        </div>

        {/* ── Update Button ── */}
        <button
          onClick={handleUpdate}
          disabled={!isDirty || saving}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: isDirty ? accent : 'rgba(255,255,255,0.05)',
            color: isDirty ? '#fff' : '#334155',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s, color 0.2s',
            boxShadow: isDirty ? `0 2px 10px ${accent}44` : 'none',
            opacity: saving ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (isDirty && !saving) e.currentTarget.style.filter = 'brightness(1.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
        >
          {saving ? '⏳ Updating…' : 'Update'}
        </button>
      </div>

      {/* ── Inline feedback toast ── */}
      {toast && (
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: toast.ok ? '#6ee7b7' : '#fca5a5',
          padding: '0.2rem 0.6rem',
          borderRadius: '0.375rem',
          background: toast.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)'}`,
          maxWidth: 'fit-content',
        }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </span>
      )}
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
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [o, d, p, s] = await Promise.all([
          fetch(`${BASE}/${storeSlug}/orders`).then(r => r.json()),
          fetch(`${BASE}/${storeSlug}/deliveries`).then(r => r.json()),
          fetch(`${BASE}/${storeSlug}/payments`).then(r => r.json()),
          fetch(`${BASE}/${storeSlug}/stats`).then(r => r.json()),
        ]);
        if (o.success) setOrders(o.data);
        if (d.success) setDeliveries(d.data);
        if (p.success) setPayments(p.data);
        if (s.success) setStats(s.data);
      } catch (e) {
        setError('Could not load data. Make sure the backend server is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeSlug]);

  /* Optimistic update after admin changes a status */
  const handleStatusUpdated = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (String(o._id) === String(orderId) ? { ...o, status: newStatus } : o))
    );
    // Refresh stats silently
    fetch(`${BASE}/${storeSlug}/stats`)
      .then(r => r.json())
      .then(s => { if (s.success) setStats(s.data); })
      .catch(() => {});
  }, [storeSlug]);

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.45s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
        .stat-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .stat-card:hover { transform: translateY(-4px); }
        tr:hover td { background: rgba(255,255,255,0.025); }
        select option:disabled { color: #475569; }
      `}</style>

      {/* Navbar */}
      <nav style={{ background: 'rgba(8,18,37,0.95)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${meta.glow}` }}>
              <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT, margin: 0 }}>{meta.name}</p>
              <p style={{ fontSize: '0.7rem', color: meta.accent, margin: 0 }}>Store Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/delivery/stores')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', fontWeight: 500, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            All Stores
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Page title */}
        <div className="fade-up" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: TEXT, margin: '0 0 0.375rem' }}>
            {meta.icon} {meta.name} — Admin Dashboard
          </h1>
          <p style={{ color: MUTED, fontSize: '0.9rem', margin: 0 }}>All data is filtered exclusively for this store.</p>
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
                { label: 'Total Orders',          value: stats?.totalOrders        ?? '—', icon: '📦', color: PRIMARY },
                { label: 'Completed Deliveries',  value: stats?.completedDeliveries ?? '—', icon: '✅', color: '#10b981' },
                { label: 'Pending Orders',         value: stats?.pendingOrders      ?? '—', icon: '⏳', color: '#f59e0b' },
                { label: 'Total Revenue',          value: stats ? fmt(stats.totalRevenue) : '—', icon: '💰', color: '#a78bfa' },
              ].map((s) => (
                <div key={s.label} className="stat-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '1.1rem', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
                  <p style={{ fontSize: '1.6rem', margin: '0 0 0.5rem' }}>{s.icon}</p>
                  <p style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, margin: '0 0 0.2rem' }}>{s.value}</p>
                  <p style={{ fontSize: '0.72rem', color: MUTED, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── 2. Orders Management ── */}
            <div className="fade-up" style={{ animationDelay: '0.1s' }}>
              <Section title="Orders Management" icon="📋" accent={meta.accent}>
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <span style={{ fontSize: '0.75rem' }}>ℹ️</span>
                  <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                    Use the <strong>dropdown</strong> to select a new status, then click <strong>Update</strong>. Status can only move forward: Pending → Processing → Out for Delivery → Delivered.
                  </span>
                </div>
                <Table
                  cols={['Order ID', 'Items', 'Total', 'Update Status', 'Date']}
                  empty="No orders found for this store."
                  rows={orders.map((o) => (
                    <tr key={o._id}>
                      <td style={tdStyle}>
                        <code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(o._id)}</code>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {(o.items || []).slice(0, 3).map((item, i) => (
                            <span key={i} style={{ fontSize: '0.78rem', color: TEXT }}>{item.name} × {item.quantity}</span>
                          ))}
                          {o.items?.length > 3 && <span style={{ fontSize: '0.72rem', color: MUTED }}>+{o.items.length - 3} more</span>}
                        </div>
                      </td>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: '#6ee7b7' }}>{fmt(o.grandTotal)}</span></td>
                      <td style={{ ...tdStyle, minWidth: '20rem' }}>
                        <StatusCell
                          order={o}
                          onUpdated={handleStatusUpdated}
                          accent={meta.accent}
                        />
                      </td>
                      <td style={tdStyle}><span style={{ color: MUTED, fontSize: '0.78rem' }}>{fmtDate(o.createdAt)}</span></td>
                    </tr>
                  ))}
                />
              </Section>
            </div>

            {/* ── 3. Delivery Assign & Monitor ── */}
            <div className="fade-up" style={{ animationDelay: '0.15s' }}>
              <Section title="Delivery Assign & Monitor" icon="🚚" accent={meta.accent}>
                <Table
                  cols={['Assignment ID', 'Order ID', 'Delivery Person', 'Status', 'Assigned At']}
                  empty="No delivery assignments found for this store."
                  rows={deliveries.map((d) => (
                    <tr key={d._id}>
                      <td style={tdStyle}><code style={{ background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(d._id)}</code></td>
                      <td style={tdStyle}><code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(d.orderId)}</code></td>
                      <td style={tdStyle}>{d.deliveryPersonName}</td>
                      <td style={tdStyle}>{badge(d.status)}</td>
                      <td style={tdStyle}><span style={{ color: MUTED, fontSize: '0.78rem' }}>{fmtDate(d.assignedAt)}</span></td>
                    </tr>
                  ))}
                />
              </Section>
            </div>

            {/* ── 4. Payments Tracking ── */}
            <div className="fade-up" style={{ animationDelay: '0.2s' }}>
              <Section title="Payments Tracking" icon="💳" accent={meta.accent}>
                <Table
                  cols={['Payment ID', 'Order ID', 'Card', 'Subtotal', 'Delivery', 'Total', 'Status', 'Paid At']}
                  empty="No payments found for this store."
                  rows={payments.map((p) => (
                    <tr key={p._id}>
                      <td style={tdStyle}><code style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(p._id)}</code></td>
                      <td style={tdStyle}><code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>#{shortId(p.orderId)}</code></td>
                      <td style={tdStyle}><span style={{ color: TEXT }}>{p.cardType} •••• {p.lastFourDigits}</span></td>
                      <td style={tdStyle}>{fmt(p.subtotal)}</td>
                      <td style={tdStyle}>{fmt(p.deliveryCharge)}</td>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: '#6ee7b7' }}>{fmt(p.total)}</span></td>
                      <td style={tdStyle}>{badge(p.status)}</td>
                      <td style={tdStyle}><span style={{ color: MUTED, fontSize: '0.78rem' }}>{fmtDate(p.paidAt)}</span></td>
                    </tr>
                  ))}
                />
              </Section>
            </div>

          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#1e3a5f' }}>
          SSHCS · {meta.name} Admin · Data sourced from MongoDB
        </p>
      </div>
    </div>
  );
}
