import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSmile, FaFrown, FaMeh, FaQuestionCircle, FaChartBar, FaUserCheck, FaStar } from 'react-icons/fa';

const SentimentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/feedback/admin/analytics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.data.success) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-red-600 font-semibold bg-red-50 px-8 py-4 rounded-xl border border-red-200">
          No data available.
        </div>
      </div>
    );
  }

  const { totalFeedback, averageRating, sentimentDistribution, byType } = analyticsData;

  const getSentimentInfo = (sentiment) => {
    const key = (sentiment || '').toLowerCase();
    switch(key) {
      case 'positive': 
        return { icon: <FaSmile className="text-emerald-500 text-3xl"/>, color: 'text-emerald-600', barColor: 'bg-gradient-to-r from-emerald-400 to-teal-500' };
      case 'negative': 
        return { icon: <FaFrown className="text-rose-500 text-3xl"/>, color: 'text-rose-600', barColor: 'bg-gradient-to-r from-rose-400 to-red-500' };
      case 'neutral': 
        return { icon: <FaMeh className="text-amber-500 text-3xl"/>, color: 'text-amber-600', barColor: 'bg-gradient-to-r from-amber-400 to-orange-500' };
      default: 
        return { icon: <FaQuestionCircle className="text-slate-400 text-3xl"/>, color: 'text-slate-500', barColor: 'bg-gradient-to-r from-slate-400 to-gray-500' };
    }
  };

  // Find max count for sentiment bars
  const maxSentimentCount = sentimentDistribution.reduce((max, item) => Math.max(max, item.count), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 text-slate-800 p-6 md:p-12 font-sans selection:bg-indigo-500/20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
            Intelligence Dashboard
          </h1>
          <p className="text-slate-500 text-lg font-medium tracking-wide">
            Real-time platform sentiment and feedback analysis
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-white/60 shadow-sm rounded-xl px-5 py-3 flex items-center space-x-3">
          <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-sm font-bold tracking-wider text-slate-600 uppercase">Live Metrics Active</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top KPIs */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          
          {/* Total Feedback */}
          <div className="relative group bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
              <FaChartBar className="text-6xl text-indigo-600" />
            </div>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-2">Total Feedback</p>
            <p className="text-6xl font-black text-slate-800 tracking-tighter">
              {totalFeedback}
            </p>
            <div className="mt-4 h-1.5 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>

          {/* Average Rating */}
          <div className="relative group bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(234,179,8,0.1)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
              <FaStar className="text-6xl text-amber-500" />
            </div>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-2">Avg Rating</p>
            <div className="flex items-end space-x-2">
              <p className="text-6xl font-black text-slate-800 tracking-tighter">
                {averageRating ? averageRating.toFixed(1) : '0.0'}
              </p>
              <span className="text-3xl text-amber-400 mb-1 drop-shadow-sm">★</span>
            </div>
            <div className="mt-4 h-1.5 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
          </div>

          {/* Participation Ratio */}
          <div className="relative group bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)] transition-all duration-300 sm:col-span-2 md:col-span-1">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
              <FaUserCheck className="text-6xl text-purple-600" />
            </div>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-2">Service Sources</p>
            <p className="text-6xl font-black text-slate-800 tracking-tighter">
              {byType.length}
            </p>
            <div className="mt-4 h-1.5 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>

        </div>

        {/* Detailed Analytics Rows */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Performance By Type */}
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden h-full">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-100 opacity-50 rounded-full blur-3xl"></div>
            
            <h2 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center">
              Target Performance Overview
            </h2>
            
            <div className="space-y-7 relative z-10">
              {byType.map((item, idx) => {
                const label = item._id ? String(item._id).replace('_', ' ') : 'Unknown';
                const percentage = (item.avgRating / 5) * 100;
                
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="text-lg font-bold text-slate-700 capitalize tracking-wide">{label}</span>
                      <div className="text-right flex items-center space-x-3">
                        <span className="text-xs text-slate-500 font-semibold bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                          {item.count} revs
                        </span>
                        <span className="text-2xl font-black text-indigo-900 leading-none">{item.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200/50 overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)] group-hover:brightness-110" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {byType.length === 0 && (
                <div className="text-center py-10 text-slate-400 font-medium italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Target data unpopulated.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          
          {/* Sentiment Distribution */}
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden h-full">
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-100 opacity-50 rounded-full blur-3xl"></div>
            
            <h2 className="text-2xl font-extrabold text-slate-800 mb-8">
              Sentiment Distribution
            </h2>
            
            <div className="space-y-5 relative z-10">
              {sentimentDistribution.map((item, idx) => {
                const label = item._id || 'unclassified';
                const info = getSentimentInfo(label);
                const barWidth = Math.max((item.count / maxSentimentCount) * 100, 5); // at least 5% so it's visible

                return (
                  <div key={idx} className="group flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex-shrink-0 mr-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                      {info.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-end mb-2">
                        <span className={`text-sm font-bold uppercase tracking-wider ${info.color}`}>
                          {label}
                        </span>
                        <span className="text-slate-800 font-black text-xl">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-200 shadow-inner rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${info.barColor} transition-all duration-1000 ease-out`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {sentimentDistribution.length === 0 && (
                <div className="text-center py-10 text-slate-400 font-medium italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No sentiment analysis recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default SentimentAnalytics;
