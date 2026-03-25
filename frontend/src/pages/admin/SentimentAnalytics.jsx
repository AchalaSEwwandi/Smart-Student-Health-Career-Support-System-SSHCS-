import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import api from '../../services/api';
import SentimentBadge from '../../components/SentimentBadge';
import PerformanceScoreBar from '../../components/PerformanceScoreBar';

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const FONT = "'Sora', sans-serif";

const SENTIMENT_COLORS = {
  positive: '#22C55E',
  neutral:  '#F59E0B',
  negative: '#F43F5E',
};

/* ─── Custom chart tooltip ──────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      fontFamily: FONT,
      fontSize: 12,
    }}>
      <p style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: <span style={{ color: '#1E293B' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Summary stat card ─────────────────────────────────────────────────── */
const SummaryCard = ({ icon, label, value, accent, bg }) => (
  <div style={{
    background: bg,
    borderRadius: 20,
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 2px 12px ${accent}22`,
    border: `1.5px solid ${accent}33`,
    transition: 'transform 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{
      position: 'absolute', top: -20, right: -20,
      width: 80, height: 80, borderRadius: '50%',
      background: `${accent}18`,
    }} />
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: `${accent}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20,
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#1E293B', lineHeight: 1, fontFamily: FONT }}>{value ?? '—'}</p>
      <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT }}>{label}</p>
    </div>
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${accent}, transparent)`,
      borderRadius: '0 0 20px 20px',
    }} />
  </div>
);

/* ─── Section title ─────────────────────────────────────────────────────── */
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', fontFamily: FONT, letterSpacing: '-0.01em' }}>{children}</h2>
    {sub && <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, marginTop: 2, fontFamily: FONT }}>{sub}</p>}
  </div>
);

/* ─── Card wrapper ──────────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff',
    borderRadius: 20,
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(99,102,241,0.05)',
    border: '1px solid #F1F5F9',
    ...style,
  }}>
    {children}
  </div>
);

/* ─── Performer row ─────────────────────────────────────────────────────── */
const PerformerRow = ({ user, rank, warn, isLast }) => {
  const initBg = `hsl(${(user.name?.charCodeAt(0) || 65) * 5 % 360}, 60%, 55%)`;
  return (
    <tr style={{
      background: warn ? '#FFF7ED' : 'transparent',
      transition: 'background 0.15s',
      borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
    }}
      onMouseEnter={e => e.currentTarget.style.background = warn ? '#FFEDD5' : '#F8FAFC'}
      onMouseLeave={e => e.currentTarget.style.background = warn ? '#FFF7ED' : 'transparent'}
    >
      {/* Rank */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: rank <= 3 && !warn ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#F1F5F9',
          color: rank <= 3 && !warn ? '#fff' : '#94A3B8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, fontFamily: FONT,
        }}>
          {rank <= 3 && !warn ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
        </div>
      </td>
      {/* Name */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: initBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: FONT,
            flexShrink: 0,
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', fontFamily: FONT }}>{user.name}</span>
        </div>
      </td>
      {/* Role */}
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
          background: '#F1F5F9', color: '#64748B',
          padding: '3px 8px', borderRadius: 6, fontFamily: FONT,
        }}>
          {user.role.replace('_', ' ')}
        </span>
      </td>
      {/* Rating */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#F59E0B', fontFamily: FONT }}>{user.avgRating}</span>
          <span style={{ fontSize: 13 }}>⭐</span>
        </div>
      </td>
      {/* Performance bar */}
      <td style={{ padding: '12px 16px', minWidth: 120 }}>
        <PerformanceScoreBar score={user.performanceScore} showLabel={false} />
      </td>
      {/* Sentiment */}
      <td style={{ padding: '12px 16px' }}>
        <SentimentBadge label={user.sentiment} />
      </td>
      {/* Reviews */}
      <td style={{ padding: '12px 16px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', fontFamily: FONT }}>{user.totalReviews}</span>
      </td>
      {/* Warn flag */}
      {warn && (
        <td style={{ padding: '12px 16px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>⚠️</div>
        </td>
      )}
    </tr>
  );
};

/* ─── Table wrapper ─────────────────────────────────────────────────────── */
const PerformerTable = ({ title, badge, rows, warn, headers }) => (
  <Card style={{ padding: 0, overflow: 'hidden', border: warn ? '1.5px solid #FED7AA' : '1px solid #F1F5F9' }}>
    <div style={{
      padding: '18px 24px',
      borderBottom: `1px solid ${warn ? '#FEE2E2' : '#F1F5F9'}`,
      background: warn ? '#FFF7ED' : '#FAFBFF',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', fontFamily: FONT }}>{title}</h2>
      {badge && (
        <span style={{
          fontSize: 11, fontWeight: 700, background: '#FEF3C7',
          color: '#B45309', padding: '2px 8px', borderRadius: 20, fontFamily: FONT,
        }}>{badge}</span>
      )}
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: warn ? '#FFF7ED' : '#F8FAFC' }}>
            {headers.map(h => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: 'left',
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#94A3B8', fontFamily: FONT,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length > 0
            ? rows.map((u, i) => (
              <PerformerRow
                key={u._id} user={u} rank={i + 1} warn={warn}
                isLast={i === rows.length - 1}
              />
            ))
            : (
              <tr>
                <td colSpan={headers.length} style={{
                  padding: '32px', textAlign: 'center',
                  color: '#CBD5E1', fontSize: 14, fontFamily: FONT, fontWeight: 600,
                }}>
                  {warn ? 'No underperformers 🎉' : 'No data yet'}
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  </Card>
);

/* ─── Main component ────────────────────────────────────────────────────── */
const SentimentAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/sentiment-analytics')
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid #E0E7FF', borderTopColor: '#6366F1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94A3B8', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: FONT }}>
          Loading
        </p>
      </div>
    </div>
  );

  const { summary, sentimentTrend, sentimentByType, topPerformers, underperformers } = data || {};

  // Pivot trend data
  const trendMap = {};
  (sentimentTrend || []).forEach(({ _id, count }) => {
    const { date, label } = _id;
    if (!trendMap[date]) trendMap[date] = { date };
    trendMap[date][label] = count;
  });
  const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  // Pivot by-type data
  const typeMap = {};
  (sentimentByType || []).forEach(({ _id, count }) => {
    const { targetType, label } = _id;
    if (!typeMap[targetType]) typeMap[targetType] = { type: targetType };
    typeMap[targetType][label] = count;
  });
  const typeData = Object.values(typeMap);

  const summaryCards = [
    { icon: '💬', label: 'Total Feedback', value: summary?.totalFeedback,              accent: '#6366F1', bg: '#F5F3FF' },
    { icon: '😊', label: '% Positive',     value: `${summary?.positivePercent ?? 0}%`, accent: '#22C55E', bg: '#F0FDF4' },
    { icon: '😐', label: '% Neutral',      value: `${summary?.neutralPercent ?? 0}%`,  accent: '#F59E0B', bg: '#FFFBEB' },
    { icon: '😞', label: '% Negative',     value: `${summary?.negativePercent ?? 0}%`, accent: '#F43F5E', bg: '#FFF1F2' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFF',
      backgroundImage: `
        radial-gradient(ellipse 60% 40% at 5% 5%, rgba(99,102,241,0.07) 0%, transparent 55%),
        radial-gradient(ellipse 50% 35% at 95% 95%, rgba(34,197,94,0.06) 0%, transparent 55%)
      `,
      padding: '40px 16px',
      fontFamily: FONT,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Page header ──────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.28em', color: '#6366F1', marginBottom: 6,
            }}>CareMate Platform</p>
            <h1 style={{
              fontSize: 30, fontWeight: 900, color: '#0F172A',
              lineHeight: 1.1, margin: 0,
            }}>
              Sentiment &{' '}
              <span style={{
                background: 'linear-gradient(90deg, #6366F1, #EC4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Feedback
              </span>
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginTop: 6 }}>
              Insights from all platform feedback
            </p>
          </div>

          {/* Sentiment mini legend */}
          <div style={{
            display: 'flex', gap: 12, padding: '10px 16px',
            background: '#fff', borderRadius: 50,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            {[['😊','Positive','#22C55E'],['😐','Neutral','#F59E0B'],['😞','Negative','#F43F5E']].map(([emoji, label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 14 }}>{emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: FONT }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Summary cards ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {summaryCards.map(c => <SummaryCard key={c.label} {...c} />)}
        </div>

        {/* ── Charts ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

          {/* Trend line chart */}
          <Card>
            <SectionTitle sub="Rolling 30-day sentiment volume">Sentiment Trend</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: FONT }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: FONT }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: FONT, fontWeight: 700, paddingTop: 8 }}
                  iconType="circle" iconSize={8}
                />
                <Line type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="neutral"  stroke={SENTIMENT_COLORS.neutral}  strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* By-type bar chart */}
          <Card>
            <SectionTitle sub="Breakdown by feedback target">Sentiment by Target Type</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: FONT }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: FONT }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: FONT, fontWeight: 700, paddingTop: 8 }}
                  iconType="circle" iconSize={8}
                />
                <Bar dataKey="positive" fill={SENTIMENT_COLORS.positive} radius={[6,6,0,0]} />
                <Bar dataKey="neutral"  fill={SENTIMENT_COLORS.neutral}  radius={[6,6,0,0]} />
                <Bar dataKey="negative" fill={SENTIMENT_COLORS.negative} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Top Performers table ─────────────────────────────── */}
        <PerformerTable
          title="🏆 Top Performers"
          rows={topPerformers}
          warn={false}
          headers={['Rank', 'Name', 'Role', 'Avg Rating', 'Performance', 'Sentiment', 'Reviews']}
        />

        {/* ── Underperformers table ────────────────────────────── */}
        <PerformerTable
          title="⚠️ Underperformers"
          badge="Score < 50"
          rows={underperformers}
          warn={true}
          headers={['Rank', 'Name', 'Role', 'Avg Rating', 'Performance', 'Sentiment', 'Reviews', '']}
        />

      </div>
    </div>
  );
};

export default SentimentAnalytics;