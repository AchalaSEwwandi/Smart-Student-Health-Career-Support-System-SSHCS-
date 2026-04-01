import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

/* ─── helpers ─── */
function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function etaFromStatus(status, createdAt) {
  const base = createdAt ? new Date(createdAt) : new Date();
  const etaMap = {
    Pending:            30,
    Processing:         25,
    'Out for Delivery': 10,
    'Arriving Soon':    2,
    Delivered:          0,
  };
  const mins = etaMap[status] ?? 30;
  if (mins === 0) return 'Delivered ✓';
  const eta = new Date(base.getTime() + mins * 60 * 1000);
  return `~${mins} min  (by ${eta.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`;
}

/* Countdown ETA from remaining seconds */
function formatSecondsETA(secs) {
  if (secs <= 0) return 'Arriving now…';
  if (secs < 60) return `~${secs}s away`;
  return `~${Math.ceil(secs / 60)} min away`;
}

/* ─── status colour map ─── */
const STATUS_META = {
  Pending:            { icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)', label: 'Awaiting Confirmation'   },
  Processing:         { icon: '📦', color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', label: 'Being Prepared at Store'  },
  'Out for Delivery': { icon: '🛵', color: '#F97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.30)', label: 'On the Way to You!'       },
  'Arriving Soon':    { icon: '🏁', color: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.30)', label: 'Almost There!'            },
  Delivered:          { icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)', label: 'Order Delivered'          },
};

/* ─── Leaflet default-icon fix (Vite asset bundling) ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── SLIIT Malabe service zone ───
 * All locations are real streets / landmarks within ~2 km of SLIIT Malabe.
 */
const LOCATIONS = {
  shops: {
    // Shops clustered near the SLIIT / Malabe main junction
    default:       [6.9147, 79.9729], // SLIIT main entrance (fallback)
    'Cargills':    [6.9132, 79.9715], // Cargills Malabe (near SLIIT gate)
    'Abenayaka':   [6.9160, 79.9700], // Abenayaka – Malabe town
    'Dewnini':     [6.9120, 79.9750], // Dewnini – near Athurugiriya Rd
    'Campus Shop': [6.9147, 79.9729], // On-campus shop
  },
  // Customer = student hostel / SLIIT south gate area
  customer: [6.9110, 79.9780],
};

/*
 * DELIVERY_PATH — 14 waypoints entirely inside the ~2 km SLIIT Malabe zone.
 * Route: SLIIT main entrance → Malabe town loop → south gate area.
 * Each step ≈ 2.5 s  →  total demo journey ≈ 35 s.
 */
const DELIVERY_PATH = [
  [6.9147, 79.9729], //  0  SLIIT main entrance (shop)
  [6.9141, 79.9735], //  1  campus road east
  [6.9135, 79.9742], //  2  towards Malabe junction
  [6.9128, 79.9748], //  3  Malabe junction
  [6.9122, 79.9752], //  4  Malabe town north
  [6.9118, 79.9757], //  5  Malabe town centre
  [6.9115, 79.9761], //  6  Malabe town south
  [6.9113, 79.9765], //  7  turning south
  [6.9112, 79.9769], //  8  Athurugiriya Rd approach
  [6.9111, 79.9773], //  9  lane before south gate
  [6.9110, 79.9776], // 10  south gate road (Arriving Soon → here)
  [6.9110, 79.9778], // 11  entering delivery zone
  [6.9110, 79.9779], // 12  last metre
  [6.9110, 79.9780], // 13  Customer – south gate area
];

/* Steps at which the displayed status changes */
const PATH_STATUS_CHANGES = {
  0:  'Out for Delivery',
  10: 'Arriving Soon',
  13: 'Delivered',
};

/* ─── Tight 2 km bounding box around SLIIT Malabe ─── */
const COLOMBO_BOUNDS = L.latLngBounds(
  [6.9060, 79.9640],   // SW corner (~1.1 km SW of SLIIT)
  [6.9230, 79.9830],   // NE corner (~1.1 km NE of SLIIT)
);

/* ─── Custom SVG icon factory ─── */
function svgIcon(svgContent, size = 38) {
  return L.divIcon({
    className: '',
    html: svgContent,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor:[0, -size],
  });
}

const SHOP_ICON = svgIcon(`
<svg width="38" height="44" viewBox="0 0 38 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000066"/></filter>
  <g filter="url(#s)">
    <ellipse cx="19" cy="40" rx="7" ry="3" fill="rgba(0,0,0,0.25)"/>
    <path d="M19 2C12.373 2 7 7.373 7 14c0 9 12 26 12 26s12-17 12-26C31 7.373 25.627 2 19 2z" fill="#3B82F6"/>
    <path d="M19 2C12.373 2 7 7.373 7 14c0 9 12 26 12 26s12-17 12-26C31 7.373 25.627 2 19 2z" fill="none" stroke="#93C5FD" stroke-width="1.5"/>
    <text x="19" y="18" text-anchor="middle" font-size="13" fill="white">🏪</text>
  </g>
</svg>`, 38);

const CUSTOMER_ICON = svgIcon(`
<svg width="38" height="44" viewBox="0 0 38 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000066"/></filter>
  <g filter="url(#s)">
    <ellipse cx="19" cy="40" rx="7" ry="3" fill="rgba(0,0,0,0.25)"/>
    <path d="M19 2C12.373 2 7 7.373 7 14c0 9 12 26 12 26s12-17 12-26C31 7.373 25.627 2 19 2z" fill="#10B981"/>
    <path d="M19 2C12.373 2 7 7.373 7 14c0 9 12 26 12 26s12-17 12-26C31 7.373 25.627 2 19 2z" fill="none" stroke="#6EE7B7" stroke-width="1.5"/>
    <text x="19" y="18" text-anchor="middle" font-size="13" fill="white">🏠</text>
  </g>
</svg>`, 38);

const RIDER_ICON = svgIcon(`
<svg width="42" height="48" viewBox="0 0 42 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#F9731666"/></filter>
  <g filter="url(#s)">
    <ellipse cx="21" cy="44" rx="9" ry="3.5" fill="rgba(0,0,0,0.25)"/>
    <path d="M21 2C13.268 2 7 8.268 7 16c0 10 14 30 14 30s14-20 14-30C35 8.268 28.732 2 21 2z" fill="#F97316"/>
    <path d="M21 2C13.268 2 7 8.268 7 16c0 10 14 30 14 30s14-20 14-30C35 8.268 28.732 2 21 2z" fill="none" stroke="#FED7AA" stroke-width="1.5"/>
    <text x="21" y="20" text-anchor="middle" font-size="15" fill="white">🛵</text>
  </g>
</svg>`, 42);

/* ─── Helper: re-fit map to bounds on mount ─── */
function BoundsController() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(COLOMBO_BOUNDS);
    map.setMinZoom(11);
  }, [map]);
  return null;
}

/* ─── tiny UI pieces ─── */
const Card = ({ children, style = {} }) => (
  <div
    style={{
      background:   '#1E293B',
      border:       '1px solid rgba(96,165,250,0.10)',
      borderRadius: '1.5rem',
      boxShadow:    '0 4px 24px rgba(0,0,0,0.35)',
      overflow:     'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div
    style={{
      padding:      '1rem 1.5rem',
      borderBottom: '1px solid rgba(96,165,250,0.08)',
      display:      'flex',
      alignItems:   'center',
      gap:          '0.5rem',
    }}
  >
    {children}
  </div>
);

const InfoRow = ({ label, value, valueStyle = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
    <p style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC', ...valueStyle }}>{value || '—'}</p>
  </div>
);

/* ════════════════════════════════════════════════════════ */
export default function DeliveryTracking() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [data,           setData]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [lastUpd,        setLastUpd]        = useState(null);
  const [pulse,          setPulse]          = useState(false);
  const [assignmentPending, setAssignmentPending] = useState(false); // true when no delivery person available

  /* ── Simulation state ── */
  const [simStep,   setSimStep]   = useState(0);                // index into DELIVERY_PATH
  const [simStatus, setSimStatus] = useState('Out for Delivery');
  const [simEtaSec, setSimEtaSec] = useState(10 * 60);          // countdown in seconds
  const [simActive, setSimActive] = useState(false);            // starts when OFD detected

  const intervalRef = useRef(null);
  const simRef      = useRef(null);   // setInterval handle for simulation
  const stepRef     = useRef(0);      // shadow copy of simStep for closure access
  const etaRef      = useRef(10 * 60);

  /* ── fetch from backend ── */
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/${orderId}/delivery-tracking`,
        { timeout: 6000 }
      );
      if (res.data.success) {
        setData(res.data.data);
        setAssignmentPending(res.data.assignmentPending === true);
        setError(null);
        setLastUpd(new Date().toISOString());
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
    } catch (primaryErr) {
      /* Fallback: try the basic tracking endpoint */
      try {
        const res2 = await axios.get(
          `http://localhost:5000/api/orders/${orderId}/tracking`,
          { timeout: 6000 }
        );
        if (res2.data.success) {
          const d = res2.data.data;
          setData({
            orderId:            d.orderId,
            storeName:          d.shopName || sessionStorage.getItem('shopName') || 'Campus Shop',
            deliveryPersonName: d.deliveryPersonName || '',
            status:             d.status || 'Processing',
            grandTotal:         d.grandTotal,
            deliveryAddress:    '',
            telephone:          '',
            createdAt:          d.createdAt,
          });
          // If the basic endpoint shows no name, treat as pending
          setAssignmentPending(!d.deliveryPersonName || d.deliveryPersonName === 'Waiting for assignment…');
          setError(null);
          setLastUpd(new Date().toISOString());
        }
      } catch {
        /* Both endpoints failed — show error, do NOT invent a fake delivery person */
        if (!data) {
          setData({
            orderId,
            storeName:          sessionStorage.getItem('shopName') || 'Campus Shop',
            deliveryPersonName: '',
            status:             'Processing',
            grandTotal:         0,
            deliveryAddress:    '',
            telephone:          '',
            createdAt:          new Date().toISOString(),
          });
          setAssignmentPending(true);
          setError('Could not reach server. Delivery person will be assigned once connection is restored.');
        } else {
          setError('Connection lost. Retrying…');
        }
        setLastUpd(new Date().toISOString());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) { navigate('/delivery'); return; }
    fetchData();
    intervalRef.current = setInterval(fetchData, 8000);
    return () => { clearInterval(intervalRef.current); clearInterval(simRef.current); };
  }, [orderId]);

  /* ── Start simulation when backend says Out for Delivery ── */
  useEffect(() => {
    if (!data) return;
    const backendStatus = data.status;
    if (
      (backendStatus === 'Out for Delivery' || backendStatus === 'Arriving Soon') &&
      !simActive
    ) {
      setSimActive(true);
      /* Stop backend polling — simulation now drives the UI */
      clearInterval(intervalRef.current);
    }
  }, [data?.status]);

  /* ── Simulation tick: runs every 2.5 s ── */
  useEffect(() => {
    if (!simActive) return;

    simRef.current = setInterval(() => {
      const nextStep = stepRef.current + 1;

      /* Update ETA countdown */
      const secsPerStep = (10 * 60) / (DELIVERY_PATH.length - 1);
      etaRef.current = Math.max(0, etaRef.current - secsPerStep);
      setSimEtaSec(Math.round(etaRef.current));

      /* Update status at defined checkpoints */
      if (PATH_STATUS_CHANGES[nextStep]) {
        setSimStatus(PATH_STATUS_CHANGES[nextStep]);
      }

      if (nextStep >= DELIVERY_PATH.length - 1) {
        /* Reached destination */
        stepRef.current = DELIVERY_PATH.length - 1;
        setSimStep(DELIVERY_PATH.length - 1);
        setSimStatus('Delivered');
        setSimEtaSec(0);
        clearInterval(simRef.current);

        /* ── Write Delivered status back to MongoDB ── */
        axios
          .put(`http://localhost:5000/api/orders/${orderId}/mark-delivered`)
          .catch(() => { /* best-effort — confirmation page will also confirm */ });

        /* Auto-navigate after 2 s so user can see the Delivered banner */
        setTimeout(() => navigate(`/delivery/confirmation/${orderId}`), 2000);
      } else {
        stepRef.current = nextStep;
        setSimStep(nextStep);
      }
    }, 2500);

    return () => clearInterval(simRef.current);
  }, [simActive]);

  /* ── derived display values ── */
  // While simulation is active, override status/eta with sim values
  const displayStatus = simActive ? simStatus : (data?.status || 'Pending');
  const isArrived     = displayStatus === 'Delivered';
  const meta          = STATUS_META[displayStatus] || STATUS_META.Pending;
  const eta           = simActive
    ? formatSecondsETA(simEtaSec)
    : etaFromStatus(data?.status, data?.createdAt);

  const shortId   = data?.orderId ? String(data.orderId).slice(-10).toUpperCase() : '—';

  /* Rider position on map */
  const riderPos = simActive
    ? DELIVERY_PATH[simStep]
    : (LOCATIONS.shops[data?.storeName] || LOCATIONS.shops.default);

  /* Progress bar pct driven by sim step */
  const simPct = Math.round((simStep / (DELIVERY_PATH.length - 1)) * 100);
  const progressPct = simActive
    ? simPct
    : (displayStatus === 'Pending' ? 10 : displayStatus === 'Processing' ? 40 : displayStatus === 'Out for Delivery' ? 80 : 100);

  /* ════════ RENDER ════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.25rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            id="back-to-tracking-btn"
            onClick={() => navigate(`/delivery/tracking/${orderId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60A5FA', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Order Tracking
          </button>

          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F8FAFC' }}>Delivery Tracking</span>

          {/* Live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: '0.45rem', height: '0.45rem', borderRadius: '50%',
              background: '#10B981', display: 'inline-block',
              boxShadow: '0 0 6px #10B981',
              animation: 'dtPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Live</span>
          </div>
        </div>
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes dtPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes dtFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dtGlow   { 0%,100%{box-shadow:0 0 0 0 rgba(96,165,250,0)} 50%{box-shadow:0 0 0 6px rgba(96,165,250,0.12)} }
        .dt-card-anim { animation: dtFadeUp 0.4s ease both; }
        .dt-glow      { animation: dtGlow 0.6s ease; }
      `}</style>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>

        {/* ── Page Title ── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Delivery Tracking</h1>
          <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>
            {simActive
              ? '🛵 Live simulation active · Syncs to MongoDB on arrival'
              : 'Synced with MongoDB · Refreshes every 8 seconds'}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(96,165,250,0.25)', borderTopColor: '#60A5FA', borderRadius: '50%', animation: 'spin 0.85s linear infinite' }} />
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Connecting to server…</p>
            <p style={{ color: '#334155', fontSize: '0.75rem' }}>Loading real-time order data from MongoDB</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : error && !data ? (
          /* Full-page error — no data at all */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <p style={{ color: '#F87171', fontWeight: 700, fontSize: '1rem' }}>Unable to Load Order</p>
            <p style={{ color: '#64748B', fontSize: '0.82rem', textAlign: 'center', maxWidth: '320px' }}>{error}</p>
            <button
              onClick={fetchData}
              style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '0.75rem', background: '#2563EB', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Status Banner ── */}
            <div
              className={`dt-card-anim ${pulse ? 'dt-glow' : ''}`}
              style={{
                borderRadius:  '1.5rem',
                padding:       '1.5rem',
                display:       'flex',
                alignItems:    'center',
                gap:           '1.25rem',
                background:    meta.bg,
                border:        `1px solid ${meta.border}`,
                boxShadow:     `0 4px 24px ${meta.bg}`,
                animationDelay: '0s',
              }}
            >
              <div style={{ fontSize: '3.5rem', lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: meta.color, opacity: 0.8, margin: 0 }}>
                  Delivery Status
                </p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: meta.color, margin: '0.15rem 0 0.15rem 0', lineHeight: 1.2 }}>
                  {displayStatus || '—'}
                </p>
                <p style={{ fontSize: '0.82rem', color: meta.color, opacity: 0.75, margin: 0 }}>{meta.label}</p>
              </div>
              <div style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${meta.border}`,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: meta.color,
                flexShrink: 0,
              }}>
                {isArrived ? 'ARRIVED' : 'IN TRANSIT'}
              </div>
            </div>

            {/* ── Soft error banner (data present but API retrying) ── */}
            {error && data && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.25rem', borderRadius: '1rem',
                background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
              }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <p style={{ fontSize: '0.78rem', color: '#FCD34D', margin: 0 }}>{error}</p>
                <button
                  onClick={fetchData}
                  style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >Retry</button>
              </div>
            )}

            {/* ── Order Info Card ── */}
            <Card style={{ animationDelay: '0.05s' }} className="dt-card-anim">
              <CardHeader>
                <span style={{ fontSize: '1rem' }}>📋</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>Order Information</span>
              </CardHeader>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                <InfoRow label="Order ID" value={`#${shortId}`} valueStyle={{ color: '#60A5FA', fontFamily: 'monospace', fontSize: '0.95rem' }} />
                <InfoRow label="Store Name" value={data?.storeName} />
                {data?.grandTotal > 0 && (
                  <InfoRow label="Amount Paid" value={`Rs. ${data.grandTotal}`} valueStyle={{ color: '#10B981', fontWeight: 700 }} />
                )}
                {data?.deliveryArea && (
                  <InfoRow label="Delivery Zone" value={data.deliveryArea} valueStyle={{ color: '#94A3B8' }} />
                )}
              </div>
            </Card>

            {/* ── Delivery Info Card ── */}
            <Card style={{ animationDelay: '0.10s' }} className="dt-card-anim">
              <CardHeader>
                <span style={{ fontSize: '1rem' }}>🛵</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>Delivery Information</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700,
                  color:      assignmentPending ? '#F59E0B' : '#10B981',
                  background: assignmentPending ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                  border:     assignmentPending ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '999px', padding: '0.15rem 0.6rem',
                }}>
                  {assignmentPending ? '⏳ Pending Assignment' : 'Auto-Assigned'}
                </span>
              </CardHeader>

              {/* ── No delivery person available banner ── */}
              {assignmentPending && (
                <div style={{
                  margin: '1rem 1.5rem 0',
                  padding: '0.9rem 1.1rem',
                  borderRadius: '0.875rem',
                  background: 'rgba(245,158,11,0.07)',
                  border: '1px solid rgba(245,158,11,0.28)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.7rem',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⏳</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#FCD34D' }}>
                      Waiting for a delivery person to be assigned
                    </p>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#92400E' }}>
                      No delivery person is currently available for {data?.storeName || 'this store'}.
                      The shop owner is being notified. This page refreshes automatically.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                {!assignmentPending && (
                  <InfoRow
                    label="Delivery Person"
                    value={data?.deliveryPersonName || '—'}
                    valueStyle={{ color: '#F8FAFC' }}
                  />
                )}
                <InfoRow
                  label="Delivery Status"
                  value={displayStatus}
                  valueStyle={{ color: meta.color }}
                />
                {!assignmentPending && data?.deliveryPersonPhone && (
                  <InfoRow
                    label="Rider Contact"
                    value={data.deliveryPersonPhone}
                    valueStyle={{ color: '#94A3B8' }}
                  />
                )}
                {!assignmentPending && data?.vehicleType && (
                  <InfoRow
                    label="Vehicle"
                    value={`${data.vehicleType}${data.vehicleNumber ? ' \u00B7 ' + data.vehicleNumber : ''}`}
                    valueStyle={{ color: '#94A3B8' }}
                  />
                )}
                {data?.deliveryAddress && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <InfoRow
                      label="Delivery Address"
                      value={data.deliveryAddress}
                      valueStyle={{ color: '#CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                )}
                {data?.telephone && (
                  <InfoRow label="Contact" value={data.telephone} valueStyle={{ color: '#94A3B8' }} />
                )}
              </div>
            </Card>

            {/* ── ETA & Time Card ── */}
            <Card style={{ animationDelay: '0.15s' }} className="dt-card-anim">
              <CardHeader>
                <span style={{ fontSize: '1rem' }}>🕐</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>Time &amp; ETA</span>
              </CardHeader>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                <InfoRow
                  label="Estimated Arrival (ETA)"
                  value={eta}
                  valueStyle={{ color: isArrived ? '#10B981' : '#F59E0B', fontWeight: 700 }}
                />
                <InfoRow
                  label="Last Updated"
                  value={lastUpd ? `${formatDate(lastUpd)} · ${formatTime(lastUpd)}` : '—'}
                  valueStyle={{ color: '#94A3B8', fontSize: '0.82rem' }}
                />
              </div>

              {/* Live progress strip */}
              {!isArrived && (
                <div style={{ padding: '0 1.5rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#64748B' }}>Delivery progress</p>
                    <p style={{ fontSize: '0.72rem', color: '#60A5FA' }}>{progressPct}%</p>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '999px',
                        background: `linear-gradient(to right, #1D4ED8, ${meta.color})`,
                        boxShadow:  `0 0 8px ${meta.color}55`,
                        width: `${progressPct}%`,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  {simActive && (
                    <p style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.35rem', textAlign: 'right' }}>
                      Step {simStep + 1} / {DELIVERY_PATH.length} &nbsp;·&nbsp; {formatSecondsETA(simEtaSec)}
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* ── Live Map Card ── */}
            <div
              className="dt-card-anim"
              style={{
                background:   '#1E293B',
                border:       '1px solid rgba(96,165,250,0.10)',
                borderRadius: '1.5rem',
                boxShadow:    '0 4px 24px rgba(0,0,0,0.35)',
                overflow:     'hidden',
                animationDelay: '0.20s',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(96,165,250,0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>🗺️</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>Live Delivery Map</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700,
                  color: '#F97316', background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.25)', borderRadius: '999px', padding: '0.15rem 0.6rem',
                }}>SLIIT Area</span>
              </div>

              {/* Map */}
              <div style={{ height: '360px', width: '100%' }}>
                <MapContainer
                  center={[6.9130, 79.9755]}   /* centre of the SLIIT 2 km zone */
                  zoom={15}
                  minZoom={14}
                  maxZoom={18}
                  maxBounds={COLOMBO_BOUNDS}
                  maxBoundsViscosity={1.0}
                  style={{ height: '100%', width: '100%', background: '#0F172A' }}
                  zoomControl={true}
                >
                  <BoundsController />

                  {/* CartoDB Dark Matter tiles */}
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    subdomains="abcd"
                    maxZoom={19}
                  />

                  {/* 1. Shop Marker */}
                  <Marker
                    position={LOCATIONS.shops[data?.storeName] || LOCATIONS.shops.default}
                    icon={SHOP_ICON}
                  >
                    <Popup>
                      <div style={{ background: '#1E293B', color: '#F8FAFC', padding: '0.25rem', borderRadius: '0.5rem', minWidth: '140px' }}>
                        <strong style={{ color: '#60A5FA' }}>🏪 Store</strong><br />
                        <span style={{ fontSize: '0.8rem' }}>{data?.storeName || 'Campus Shop'}</span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* 2. Customer Marker */}
                  <Marker
                    position={LOCATIONS.customer}
                    icon={CUSTOMER_ICON}
                  >
                    <Popup>
                      <div style={{ background: '#1E293B', color: '#F8FAFC', padding: '0.25rem', borderRadius: '0.5rem', minWidth: '140px' }}>
                        <strong style={{ color: '#10B981' }}>🏠 Your Location</strong><br />
                        <span style={{ fontSize: '0.8rem' }}>Malabe / SLIIT Area</span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* 3. Delivery Person Marker — position driven by simulation */}
                  <Marker
                    key={simStep}          /* key change forces Leaflet to re-render marker */
                    position={riderPos}
                    icon={RIDER_ICON}
                  >
                    <Popup>
                      <div style={{ background: '#1E293B', color: '#F8FAFC', padding: '0.25rem', borderRadius: '0.5rem', minWidth: '160px' }}>
                        <strong style={{ color: '#F97316' }}>🛵 Delivery Rider</strong><br />
                        <span style={{ fontSize: '0.8rem' }}>{data?.deliveryPersonName || 'Assigning…'}</span><br />
                        <span style={{ fontSize: '0.75rem', color: meta.color }}>{displayStatus}</span><br />
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>ETA: {formatSecondsETA(simEtaSec)}</span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Map legend */}
              <div style={{ display: 'flex', gap: '1.5rem', padding: '0.85rem 1.5rem', borderTop: '1px solid rgba(96,165,250,0.08)', flexWrap: 'wrap' }}>
                {[
                  { dot: '#3B82F6', label: 'Store' },
                  { dot: '#10B981', label: 'Your Location' },
                  { dot: '#F97316', label: 'Delivery Rider' },
                ].map(({ dot, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dot, display: 'inline-block', boxShadow: `0 0 6px ${dot}` }} />
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Arrived / CTA ── */}
            {isArrived ? (
              <button
                id="confirm-arrival-btn"
                onClick={() => navigate(`/delivery/confirmation/${orderId}`)}
                style={{
                  width: '100%', padding: '1.1rem', borderRadius: '1.25rem', border: 'none',
                  background: '#10B981', color: '#fff', fontWeight: 700, fontSize: '1rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                🎉 Your Order Has Arrived! — Confirm Receipt
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <p style={{ fontSize: '0.78rem', color: '#334155' }}>
                  Waiting for the delivery person to arrive. Page updates automatically.
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
