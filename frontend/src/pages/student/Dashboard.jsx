import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import TopRatedWidget from '../../components/TopRatedWidget';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my')
      .then(({ data }) => setComplaints(data.data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openComplaints = complaints.filter(c => ['pending', 'under_review'].includes(c.status)).length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            👋 Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your account today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📝" label="Total Complaints" value={complaints.length} color="bg-blue-50" />
          <StatCard icon="⏳" label="Open Complaints" value={openComplaints} color="bg-yellow-50" />
          <StatCard icon="✅" label="Resolved" value={resolvedComplaints} color="bg-green-50" />
          <StatCard icon="🎓" label="Semester" value={user?.semester ? `Sem ${user.semester}` : 'N/A'} color="bg-purple-50" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: quick actions + recent complaints */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { to: '/student/feedback', icon: '⭐', label: 'Give Feedback', color: 'bg-yellow-50 hover:bg-yellow-100' },
                  { to: '/student/complaint', icon: '📢', label: 'File Complaint', color: 'bg-red-50 hover:bg-red-100' },
                  { to: '/student/top-rated', icon: '🏆', label: 'Top Rated', color: 'bg-blue-50 hover:bg-blue-100' },
                  { to: '/student/complaints', icon: '📋', label: 'My Complaints', color: 'bg-purple-50 hover:bg-purple-100' },
                  { to: '/profile', icon: '👤', label: 'My Profile', color: 'bg-green-50 hover:bg-green-100' },
                ].map(({ to, icon, label, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`${color} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors group`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent complaints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800 text-lg">Recent Complaints</h2>
                <Link to="/student/complaints" className="text-sm text-blue-700 hover:underline">View all</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p>No complaints yet</p>
                  <Link to="/student/complaint" className="text-blue-700 text-sm hover:underline mt-1 block">File your first complaint</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {complaints.slice(0, 3).map(c => {
                    const statusColor = { pending: 'bg-yellow-100 text-yellow-700', under_review: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700', dismissed: 'bg-gray-100 text-gray-600' };
                    return (
                      <div key={c._id} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.subject}</p>
                          <p className="text-xs text-gray-500">{c.category} · {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: profile card + top rated widget */}
          <div className="space-y-6">
            {/* Profile summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col items-center text-center">
                {user?.avatar ? (
                  <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-900 flex items-center justify-center text-white text-3xl font-bold mb-3">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-bold text-gray-800 text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">🎓 Student</span>
                {user?.degree && <p className="text-xs text-gray-500 mt-1">{user.degree}</p>}
                <Link to="/profile" className="mt-4 w-full text-center text-sm text-blue-800 border border-blue-200 py-2 rounded-xl hover:bg-blue-50 transition-colors font-medium">
                  Edit Profile
                </Link>
              </div>
            </div>

            <TopRatedWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
