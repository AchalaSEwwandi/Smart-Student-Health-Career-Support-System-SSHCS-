import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import api from '../../services/api';
import SentimentBadge from '../../components/SentimentBadge';
import PerformanceScoreBar from '../../components/PerformanceScoreBar';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { summary, sentimentTrend, sentimentByType, topPerformers, underperformers } = data || {};

  // Pivot trend data for recharts
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

  const PerformerRow = ({ user, rank, warn }) => (
    <tr className={`hover:bg-gray-50 ${warn ? 'bg-orange-50/40' : ''}`}>
      <td className="px-4 py-3 text-sm font-bold text-gray-500">#{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-gray-800">{user.name}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{user.role.replace('_', ' ')}</td>
      <td className="px-4 py-3 text-sm font-bold text-yellow-600">{user.avgRating} ⭐</td>
      <td className="px-4 py-3 w-32"><PerformanceScoreBar score={user.performanceScore} showLabel={false} /></td>
      <td className="px-4 py-3"><SentimentBadge label={user.sentiment} /></td>
      <td className="px-4 py-3 text-sm text-gray-500">{user.totalReviews}</td>
      {warn && <td className="px-4 py-3 text-lg">⚠️</td>}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Sentiment & Feedback Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Insights from all platform feedback</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '💬', label: 'Total Feedback', value: summary?.totalFeedback, color: 'bg-blue-50' },
            { icon: '🟢', label: '% Positive', value: `${summary?.positivePercent}%`, color: 'bg-green-50' },
            { icon: '🟡', label: '% Neutral', value: `${summary?.neutralPercent}%`, color: 'bg-yellow-50' },
            { icon: '🔴', label: '% Negative', value: `${summary?.negativePercent}%`, color: 'bg-red-50' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
              <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Trend charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Sentiment Trend (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Sentiment by Target Type</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="neutral" fill="#F59E0B" radius={[4,4,0,0]} />
                <Bar dataKey="negative" fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">🏆 Top Performers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Rank', 'Name', 'Role', 'Avg Rating', 'Performance', 'Sentiment', 'Reviews'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topPerformers?.length > 0
                  ? topPerformers.map((u, i) => <PerformerRow key={u._id} user={u} rank={i + 1} warn={false} />)
                  : <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Underperformers */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-6 border-b border-orange-100 flex items-center gap-2">
            <h2 className="font-bold text-gray-800">⚠️ Underperformers</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Score &lt; 50</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-50">
                <tr>
                  {['Rank', 'Name', 'Role', 'Avg Rating', 'Performance', 'Sentiment', 'Reviews', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {underperformers?.length > 0
                  ? underperformers.map((u, i) => <PerformerRow key={u._id} user={u} rank={i + 1} warn={true} />)
                  : <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No underperformers 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalytics;
