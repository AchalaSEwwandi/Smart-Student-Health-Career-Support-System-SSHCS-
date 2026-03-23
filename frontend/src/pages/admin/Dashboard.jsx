import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../services/api';

const PIE_COLORS = { pending: '#F59E0B', under_review: '#3B82F6', resolved: '#10B981', dismissed: '#9CA3AF' };

const StatCard = ({ icon, label, value, sub, color = 'bg-blue-50' }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, registrationsPerDay, complaintsByStatus, recentUsers, recentComplaints } = data || {};

  const pieData = complaintsByStatus?.map(c => ({
    name: c._id,
    value: c.count,
    color: PIE_COLORS[c._id] || '#9CA3AF',
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of the CareMate platform.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color="bg-blue-50" />
          <StatCard icon="🎓" label="Students" value={stats?.totalStudents} color="bg-purple-50" />
          <StatCard icon="👨‍⚕️" label="Doctors" value={stats?.totalDoctors} color="bg-teal-50" />
          <StatCard icon="🏪" label="Shop Owners" value={stats?.totalShopOwners} color="bg-emerald-50" />
          <StatCard icon="🚴" label="Delivery" value={stats?.totalDelivery} color="bg-yellow-50" />
          <StatCard icon="⚠️" label="Open Complaints" value={stats?.openComplaints} color="bg-orange-50" />
          <StatCard icon="✅" label="Resolved" value={stats?.resolvedComplaints} color="bg-green-50" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Registrations line chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">New Registrations (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={registrationsPerDay?.map(r => ({ date: r._id, count: r.count })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#1E3A8A' }} name="Registrations" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints pie chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Complaints by Status</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center mt-8">No complaints yet</p>}
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Recent Registrations</h2>
              <Link to="/admin/users" className="text-sm text-blue-700 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentUsers?.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.role} · {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Recent Complaints</h2>
              <Link to="/admin/complaints" className="text-sm text-blue-700 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentComplaints?.map(c => {
                const statusColor = { pending: 'bg-yellow-100 text-yellow-700', under_review: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700', dismissed: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={c._id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.subject}</p>
                      <p className="text-xs text-gray-500">{c.submittedBy?.name} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
