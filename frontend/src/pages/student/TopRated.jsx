import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const StarRating = ({ rating }) => {
  const full = Math.round(rating);
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
};

const categoryMeta = {
  doctors:  { label: 'Top Doctors',         emoji: '🩺', gradient: 'from-blue-500 to-indigo-600',   light: 'bg-blue-50',   border: 'border-blue-100',   badge: 'bg-blue-100 text-blue-700',   btn: 'bg-blue-600 hover:bg-blue-700' },
  shops:    { label: 'Top Shops',            emoji: '🛒', gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  drivers:  { label: 'Top Delivery Persons', emoji: '🚴', gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50',  border: 'border-violet-100',  badge: 'bg-violet-100 text-violet-700',  btn: 'bg-violet-600 hover:bg-violet-700' },
};

const ScoreBar = ({ value, max }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
};

const TopRated = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState({ doctors: [], shops: [], drivers: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('doctors');

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await api.get('/feedback/top');
        if (res.data.success) setData(res.data.data);
      } catch {
        toast.error('Failed to load top-rated data.');
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, []);

  const list = data[tab] || [];
  const meta = categoryMeta[tab];
  const maxScore = list.length > 0 ? Math.max(...list.map(i => i.score)) : 1;

  const getName = (item) =>
    tab === 'shops' && item.shopName ? item.shopName : item.name || 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Student View</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">Top Rated 🏆</h1>
          <p className="text-slate-500 text-base">Discover the highest-rated doctors, shops, and delivery persons on the platform.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {Object.entries(categoryMeta).map(([key, m]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm border ${
                tab === key
                  ? `bg-gradient-to-r ${m.gradient} text-white border-transparent shadow-md`
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No ratings yet</h3>
            <p className="text-slate-400 text-sm">No feedback has been submitted for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((item, idx) => (
              <div
                key={item.targetId}
                className={`bg-white rounded-2xl border ${meta.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              >
                {/* Rank ribbon */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />

                <div className="p-5">
                  {/* Rank + name */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-100 text-slate-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        `${meta.badge.split(' ')[0]} ${meta.badge.split(' ')[1]}`
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{getName(item)}</p>
                        <p className="text-xs text-slate-400 capitalize">{tab === 'drivers' ? 'Delivery Person' : tab === 'doctors' ? 'Doctor' : 'Shop'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${meta.badge}`}>
                      {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between mb-1">
                    <StarRating rating={item.averageRating} />
                    <span className="text-lg font-black text-slate-800">{item.averageRating.toFixed(1)}</span>
                  </div>
                  <ScoreBar value={item.score} max={maxScore} />

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/profile/${item.targetId}`)}
                    className={`mt-4 w-full text-white text-xs font-semibold py-2 rounded-xl transition-all ${meta.btn}`}
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRated;
