import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
      </div>
      <span className="text-4xl opacity-80">{icon}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/users');
        const users = data.data || [];
        setStats({
          total:    users.length,
          students: users.filter((u) => u.role === 'student').length,
          doctors:  users.filter((u) => u.role === 'doctor').length,
          vendors:  users.filter((u) => u.role === 'shop_owner').length,
          pending:  users.filter((u) => u.status === 'pending').length,
        });
      } catch {
        setStats({ total: '?', students: '?', doctors: '?', vendors: '?', pending: '?' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-blue-200 mt-1 text-sm">Overview of CareMate platform activity</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon="👥" label="Total Users"    value={stats.total}    color="border-blue-500" />
            <StatCard icon="🎓" label="Students"        value={stats.students} color="border-indigo-500" />
            <StatCard icon="🩺" label="Doctors"         value={stats.doctors}  color="border-emerald-500" />
            <StatCard icon="🏪" label="Vendors"         value={stats.vendors}  color="border-orange-500" />
            <StatCard icon="⏳" label="Pending Approval" value={stats.pending}  color="border-amber-500" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/users?status=pending"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition group">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Pending Approvals</p>
                <p className="text-xs text-amber-600">Review doctor &amp; vendor accounts</p>
              </div>
            </Link>
            <Link to="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold text-blue-800 text-sm">All Users</p>
                <p className="text-xs text-blue-600">Browse and manage all accounts</p>
              </div>
            </Link>
            <Link to="/admin/users?role=doctor"
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition">
              <span className="text-2xl">🩺</span>
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Doctors</p>
                <p className="text-xs text-emerald-600">View all doctor accounts</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
