import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import SentimentBadge from '../../components/SentimentBadge';
import RatingBreakdownBar from '../../components/RatingBreakdownBar';
import PerformanceScoreBar from '../../components/PerformanceScoreBar';

const SENTIMENT_COLORS = { positive: '#10B981', neutral: '#F59E0B', negative: '#EF4444' };

const PublicProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  useEffect(() => {
    api.get(`/public/profile/${id}`)
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-gray-600">Profile not found.</p>
        <Link to="/" className="text-blue-700 text-sm mt-2 block hover:underline">Go home</Link>
      </div>
    </div>
  );

  const { user, feedbacks, stats, ratingBreakdown, sentimentCounts } = data;
  const isRateable = ['delivery_person', 'shop_owner'].includes(user.role);

  const ROLE_LABEL = { student: '🎓 Student', doctor: '👨‍⚕️ Doctor', shop_owner: '🏪 Shop Owner', delivery_person: '🚴 Delivery Person', admin: '🛡️ Admin' };

  const sentimentPie = [
    { name: 'Positive', value: sentimentCounts.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentimentCounts.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentimentCounts.negative, color: SENTIMENT_COLORS.negative },
  ].filter(s => s.value > 0);

  const paginated = feedbacks.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(feedbacks.length / PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
          {user.avatar ? (
            <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-900 flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.shopName || user.name}</h1>
            {user.shopName && <p className="text-gray-500 text-sm">{user.name}</p>}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{ROLE_LABEL[user.role]}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              {!user.isActive && <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Inactive</span>}
            </div>
          </div>
        </div>

        {/* Ratings & Performance (only for delivery/shop) */}
        {isRateable && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4">Overall Rating</h2>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-bold text-blue-900">{stats.avgRating || '—'}</span>
                  <div>
                    <StarRating value={Math.round(stats.avgRating)} readOnly size={22} />
                    <p className="text-sm text-gray-500 mt-1">{stats.totalRatings} reviews</p>
                  </div>
                </div>
                <RatingBreakdownBar breakdown={ratingBreakdown} totalReviews={stats.totalRatings} />
              </div>

              {/* Performance + Sentiment */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4">Performance</h2>
                <PerformanceScoreBar score={user.performanceScore} />
                <h3 className="font-semibold text-gray-700 mt-5 mb-3">Sentiment Breakdown</h3>
                {sentimentPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={sentimentPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                        {sentimentPie.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-400">No feedback yet</p>
                )}
              </div>
            </div>

            {/* Feedback list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">Recent Reviews ({feedbacks.length})</h2>
              {paginated.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {paginated.map(f => (
                    <div key={f._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm shrink-0">
                          {f.fromUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="font-semibold text-gray-800 text-sm">{f.fromUser?.name}</p>
                            <div className="flex items-center gap-2">
                              <SentimentBadge label={f.sentimentLabel} />
                              <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <StarRating value={f.rating} readOnly size={14} />
                          <p className="text-sm text-gray-600 mt-1">{f.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
