import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../../services/api';

/* ─── Palette ──────────────────────────────────────────────────────────── */
const PIE_COLORS = {
  pending:      '#F97316',
  under_review: '#6366F1',
  resolved:     '#10B981',
  dismissed:    '#94A3B8',
};

const STATUS_CHIP = {
  pending:      'bg-orange-100 text-orange-600 ring-1 ring-orange-200',
  under_review: 'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200',
  resolved:     'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200',
  dismissed:    'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

const CARD_ACCENTS = [
  { from: '#6366F1', to: '#818CF8' },
  { from: '#8B5CF6', to: '#A78BFA' },
  { from: '#06B6D4', to: '#22D3EE' },
  { from: '#10B981', to: '#34D399' },
  { from: '#F59E0B', to: '#FCD34D' },
  { from: '#F97316', to: '#FB923C' },
  { from: '#10B981', to: '#6EE7B7' },
];

/* ─── Custom tooltip ────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-xs shadow-xl">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-slate-500">
          {p.name}: <span className="font-black text-indigo-600">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Stat card ─────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, from, to }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2 cursor-default transition-transform duration-200 hover:-translate-y-1"
    style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      boxShadow: `0 4px 24px -4px ${from}55`,
    }}
  >
    <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
    <div className="absolute -bottom-8 right-0 w-14 h-14 rounded-full bg-white/10" />
    <span className="text-2xl">{icon}</span>
    <p className="text-3xl font-black text-white tracking-tight leading-none mt-1">{value ?? '—'}</p>
    <p className="text-xs font-semibold text-white/75 uppercase tracking-widest">{label}</p>
  </div>
);

/* ─── Section heading ─────────────────────────────────────────────────── */
const SectionHeading = ({ children }) => (
  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{children}</h2>
);

/* ─── Main component ────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-[3px] border-indigo-200 border-t-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Loading</p>
      </div>
    </div>
  );

  const { stats, registrationsPerDay, complaintsByStatus, recentUsers, recentComplaints } = data || {};

  const pieData = complaintsByStatus?.map(c => ({
    name: c._id,
    value: c.count,
    color: PIE_COLORS[c._id] || '#94A3B8',
  })) || [];

  const lineData = registrationsPerDay?.map(r => ({ date: r._id, count: r.count })) || [];

  const statCards = [
    { icon: '👥', label: 'Total Users',     value: stats?.totalUsers         },
    { icon: '🎓', label: 'Students',        value: stats?.totalStudents      },
    { icon: '🩺', label: 'Doctors',         value: stats?.totalDoctors       },
    { icon: '🏪', label: 'Shop Owners',     value: stats?.totalShopOwners    },
    { icon: '🚴', label: 'Delivery',        value: stats?.totalDelivery      },
    { icon: '⚠️', label: 'Open Complaints', value: stats?.openComplaints     },
    { icon: '✅', label: 'Resolved',        value: stats?.resolvedComplaints },
  ];

  return (
    <div
      className="min-h-screen py-10 px-4 md:px-8"
      style={{
        background: '#F1F5FB',
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 0% 0%, rgba(99,102,241,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 100% 100%, rgba(16,185,129,0.06) 0%, transparent 60%)
        `,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">CareMate Platform</p>
            <h1 className="text-3xl font-black text-slate-800 leading-tight">
              Admin{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #6366F1, #06B6D4)' }}
              >
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Platform overview &amp; live statistics</p>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-emerald-700"
            style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </div>
        </div>

        {/* ── Stat grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {statCards.map((c, i) => (
            <StatCard key={c.label} {...c} from={CARD_ACCENTS[i].from} to={CARD_ACCENTS[i].to} />
          ))}
        </div>

        {/* ── Charts row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Line chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 bg-white"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(99,102,241,0.06)' }}
          >
            <SectionHeading>New Registrations — Last 7 Days</SectionHeading>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone" dataKey="count" name="Registrations"
                  stroke="url(#lineGrad)" strokeWidth={3}
                  dot={{ fill: '#6366F1', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#06B6D4', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div
            className="rounded-2xl p-6 bg-white"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(99,102,241,0.06)' }}
          >
            <SectionHeading>Complaints by Status</SectionHeading>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3}
                    >
                      {pieData.map(entry => (
                        <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-slate-500 capitalize flex-1">{d.name.replace('_', ' ')}</span>
                      <span className="text-xs font-black text-slate-700">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p className="text-slate-400 text-sm">No complaints yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent activity ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent users */}
          <div
            className="rounded-2xl p-6 bg-white"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(99,102,241,0.06)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <SectionHeading>Recent Registrations</SectionHeading>
              <Link to="/admin/users"
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors tracking-wide">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              {recentUsers?.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-3 group p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: `hsl(${(u.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 55%)` }}
                  >
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 capitalize font-medium">{u.role} · {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-slate-300 text-lg group-hover:text-indigo-400 transition-colors font-bold">›</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent complaints */}
          <div
            className="rounded-2xl p-6 bg-white"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(99,102,241,0.06)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <SectionHeading>Recent Complaints</SectionHeading>
              <Link to="/admin/complaints"
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors tracking-wide">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              {recentComplaints?.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {c.submittedBy?.name} · {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_CHIP[c.status] || STATUS_CHIP.dismissed}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;