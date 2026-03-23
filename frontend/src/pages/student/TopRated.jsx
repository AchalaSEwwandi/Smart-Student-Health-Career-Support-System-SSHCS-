import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import SentimentBadge from '../../components/SentimentBadge';
import PerformanceScoreBar from '../../components/PerformanceScoreBar';

const Avatar = ({ name, avatar, bg = 'bg-blue-700' }) => {
  if (avatar) return <img src={`http://localhost:5000${avatar}`} alt={name} className="w-14 h-14 rounded-full object-cover" />;
  return <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center text-white font-bold text-xl`}>{(name || '?').charAt(0).toUpperCase()}</div>;
};

const VEHICLE_ICONS = { bike: '🛵 Bike', car: '🚗 Car', walk: '🚶 Walk' };
const SHOP_TYPE_ICONS = { pharmacy: '💊 Pharmacy', grocery: '🛒 Grocery' };

const DeliveryCard = ({ person }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <Avatar name={person.name} avatar={person.avatar} bg="bg-blue-700" />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{person.name}</h3>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {VEHICLE_ICONS[person.vehicleType] || person.vehicleType}
        </span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <StarRating value={Math.round(person.avgRating)} readOnly size={18} />
      <div className="text-right">
        <p className="font-bold text-gray-800">{person.avgRating}</p>
        <p className="text-xs text-gray-400">{person.totalRatings} ratings</p>
      </div>
    </div>
    <PerformanceScoreBar score={person.performanceScore} />
    <div className="flex items-center justify-between">
      <SentimentBadge label={person.sentimentLabel} />
      <Link to={`/profile/${person._id}`} className="text-sm text-blue-700 font-medium hover:underline">View Profile →</Link>
    </div>
  </div>
);

const ShopCard = ({ shop }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <Avatar name={shop.shopName || shop.name} avatar={shop.avatar} bg="bg-emerald-600" />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{shop.shopName || shop.name}</h3>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
          {SHOP_TYPE_ICONS[shop.shopType] || shop.shopType}
        </span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <StarRating value={Math.round(shop.avgRating)} readOnly size={18} />
      <div className="text-right">
        <p className="font-bold text-gray-800">{shop.avgRating}</p>
        <p className="text-xs text-gray-400">{shop.totalRatings} ratings</p>
      </div>
    </div>
    <PerformanceScoreBar score={shop.performanceScore} />
    {shop.shopAddress && <p className="text-xs text-gray-500 truncate">📍 {shop.shopAddress}</p>}
    <div className="flex items-center justify-between">
      <SentimentBadge label={shop.sentimentLabel} />
      <Link to={`/profile/${shop._id}`} className="text-sm text-blue-700 font-medium hover:underline">View Shop →</Link>
    </div>
  </div>
);

const TopRated = () => {
  const [data, setData] = useState({ deliveryPersons: [], shops: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('delivery');
  const [sortBy, setSortBy] = useState('performanceScore');
  const [shopFilter, setShopFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/public/top-rated-all')
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sortFn = (a, b) => {
    if (sortBy === 'performanceScore') return b.performanceScore - a.performanceScore;
    if (sortBy === 'avgRating') return b.avgRating - a.avgRating;
    if (sortBy === 'totalRatings') return b.totalRatings - a.totalRatings;
    return 0;
  };

  const deliveryList = data.deliveryPersons
    .filter(p => deliveryFilter === 'all' || p.vehicleType === deliveryFilter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort(sortFn);

  const shopList = data.shops
    .filter(s => shopFilter === 'all' || s.shopType === shopFilter)
    .filter(s => !search || (s.shopName || s.name).toLowerCase().includes(search.toLowerCase()))
    .sort(sortFn);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🏆 Top Rated</h1>
          <p className="text-gray-500 text-sm mt-1">Best-performing delivery persons and shops based on ratings and feedback</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('delivery')} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'delivery' ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            🚴 Top Delivery Persons
          </button>
          <button onClick={() => setActiveTab('shops')} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'shops' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            🏪 Top Shops
          </button>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 w-48"
          />

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
            <option value="performanceScore">Best Performance Score</option>
            <option value="avgRating">Highest Rated</option>
            <option value="totalRatings">Most Reviews</option>
          </select>

          {activeTab === 'delivery' && (
            <div className="flex gap-2">
              {['all', 'bike', 'car', 'walk'].map(v => (
                <button key={v} onClick={() => setDeliveryFilter(v)} className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${deliveryFilter === v ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {v === 'all' ? 'All' : v === 'bike' ? '🛵 Bike' : v === 'car' ? '🚗 Car' : '🚶 Walk'}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'shops' && (
            <div className="flex gap-2">
              {['all', 'pharmacy', 'grocery'].map(t => (
                <button key={t} onClick={() => setShopFilter(t)} className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${shopFilter === t ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t === 'all' ? 'All' : t === 'pharmacy' ? '💊 Pharmacy' : '🛒 Grocery'}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : activeTab === 'delivery' ? (
          deliveryList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryList.map(p => <DeliveryCard key={p._id} person={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-4xl mb-3">😕</p>
              <p className="text-gray-500">No delivery persons found matching your filters.</p>
            </div>
          )
        ) : (
          shopList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopList.map(s => <ShopCard key={s._id} shop={s} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-4xl mb-3">😕</p>
              <p className="text-gray-500">No shops found matching your filters.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TopRated;
