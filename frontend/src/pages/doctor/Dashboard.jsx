import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const sentimentMeta = {
  positive: { emoji: '😊', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', border: 'border-emerald-200' },
  neutral:  { emoji: '😐', color: 'text-amber-600',   bg: 'bg-amber-50',   bar: 'bg-amber-400',   border: 'border-amber-200' },
  negative: { emoji: '😞', color: 'text-rose-600',    bg: 'bg-rose-50',    bar: 'bg-rose-500',     border: 'border-rose-200' },
};

const StarRating = ({ rating }) => (
  <span className="text-amber-400 text-sm">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/feedback/my/analytics');
      if (res.data.success) setData(res.data.data);
    } catch {
      toast.error('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const maxSentiment = data
    ? Math.max(...(data.sentimentDistribution.map(s => s.count)), 1)
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-1">Doctor Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              Welcome back, Dr. {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1 text-sm">{user?.specialization || 'General Practitioner'} · {user?.hospitalName || ''}</p>
          </div>
          <button
            onClick={() => navigate('/vendor/messages')}
            className="self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
          >
            📬 My Inbox
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-slate-500">No analytics data available.</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Reviews</p>
                <p className="text-5xl font-black text-slate-800">{data.totalFeedback}</p>
                <div className="mt-3 h-1 w-12 bg-blue-500 rounded-full" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Avg Rating</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-black text-slate-800">
                    {data.averageRating ? data.averageRating.toFixed(1) : '—'}
                  </p>
                  <span className="text-2xl text-amber-400 mb-1">★</span>
                </div>
                <div className="mt-3 h-1 w-12 bg-amber-400 rounded-full" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Positive Sentiment</p>
                <p className="text-5xl font-black text-emerald-600">
                  {data.totalFeedback
                    ? `${Math.round(((data.sentimentDistribution.find(s => s._id === 'positive')?.count || 0) / data.totalFeedback) * 100)}%`
                    : '—'}
                </p>
                <div className="mt-3 h-1 w-12 bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sentiment Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-5">Sentiment Breakdown</h2>
                {data.sentimentDistribution.length === 0 ? (
                  <p className="text-slate-400 text-sm italic text-center py-10">No feedback received yet.</p>
                ) : (
                  <div className="space-y-4">
                    {['positive', 'neutral', 'negative'].map(key => {
                      const item = data.sentimentDistribution.find(s => s._id === key);
                      const count = item?.count || 0;
                      const pct = Math.round((count / maxSentiment) * 100);
                      const m = sentimentMeta[key];
                      return (
                        <div key={key} className={`flex items-center gap-4 p-3 rounded-xl border ${m.bg} ${m.border}`}>
                          <span className="text-2xl">{m.emoji}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className={`text-sm font-semibold capitalize ${m.color}`}>{key}</span>
                              <span className="text-sm font-bold text-slate-700">{count}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${m.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rating Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-5">Rating Distribution</h2>
                {data.ratingDistribution.length === 0 ? (
                  <p className="text-slate-400 text-sm italic text-center py-10">No feedback received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(star => {
                      const item = data.ratingDistribution.find(r => r._id === star);
                      const count = item?.count || 0;
                      const maxCount = Math.max(...data.ratingDistribution.map(r => r.count), 1);
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-500 w-4">{star}</span>
                          <StarRating rating={star} />
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${Math.round((count / maxCount) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-5 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Comments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Recent Student Feedback</h2>
              {data.recentComments.length === 0 ? (
                <p className="text-slate-400 text-sm italic text-center py-10">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.recentComments.map(fb => {
                    const s = sentimentMeta[fb.sentiment] || sentimentMeta.neutral;
                    return (
                      <div key={fb._id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${s.bg} border ${s.border}`}>
                          {s.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm text-slate-700">{fb.userId?.name || 'Student'}</span>
                            <div className="flex items-center gap-2">
                              <StarRating rating={fb.rating} />
                              <span className={`text-xs font-semibold capitalize ${s.color}`}>{fb.sentiment}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{fb.comment}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(fb.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
