import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PerformanceScoreBar from './PerformanceScoreBar';

const Avatar = ({ user, type }) => {
  const initials = (user.name || user.shopName || '?').charAt(0).toUpperCase();
  if (user.avatar) {
    return <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="w-10 h-10 rounded-full object-cover" />;
  }
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${type === 'delivery' ? 'bg-blue-700' : 'bg-emerald-600'}`}>
      {initials}
    </div>
  );
};

/**
 * TopRatedWidget — compact card showing top 3 delivery persons and top 3 shops.
 * Intended for student dashboard.
 */
const TopRatedWidget = () => {
  const [data, setData] = useState({ deliveryPersons: [], shops: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/top-rated-all')
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const MiniCard = ({ user, type }) => (
    <Link
      to={`/profile/${user._id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <Avatar user={user} type={type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-800">
          {type === 'delivery' ? user.name : user.shopName || user.name}
        </p>
        <p className="text-xs text-gray-500">⭐ {user.avgRating} · {user.totalRatings} reviews</p>
        <PerformanceScoreBar score={user.performanceScore} showLabel={false} />
      </div>
    </Link>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-lg">⭐ Top Rated</h3>
        <Link to="/student/top-rated" className="text-sm text-blue-700 hover:underline font-medium">See All →</Link>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🚴 Delivery</p>
        {data.deliveryPersons.slice(0, 3).map(u => <MiniCard key={u._id} user={u} type="delivery" />)}
        {data.deliveryPersons.length === 0 && <p className="text-xs text-gray-400 pl-3">No data yet</p>}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🏪 Shops</p>
        {data.shops.slice(0, 3).map(u => <MiniCard key={u._id} user={u} type="shop" />)}
        {data.shops.length === 0 && <p className="text-xs text-gray-400 pl-3">No data yet</p>}
      </div>
    </div>
  );
};

export default TopRatedWidget;
