import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FALLBACK_SHOPS = [
  { _id: 'cargils', name: 'Cargils', description: 'Leading supermarket chain with a wide variety of fresh & packaged goods.', location: 'Main Campus, Block A' },
  { _id: 'abenayaka', name: 'Abenayaka Stores', description: 'Fresh groceries & daily essentials at affordable prices.', location: 'Campus Gate 2' },
  { _id: 'dewnini', name: 'Dewnini Stores', description: 'Variety store for stationery, personal care & daily needs.', location: 'Student Area, Block C' },
];

const shopEmoji = (name) => {
  if (name.toLowerCase().includes('cargils')) return '🏪';
  if (name.toLowerCase().includes('abenayaka')) return '🛒';
  return '🏬';
};

const STEPS = ['Shop', 'Products', 'Cart', 'Payment'];

export default function ShopSelection() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/shops')
      .then((res) => setShops(res.data.data && res.data.data.length > 0 ? res.data.data : FALLBACK_SHOPS))
      .catch(() => setShops(FALLBACK_SHOPS))
      .finally(() => setLoading(false));
  }, []);

  const handleShopClick = (shop) => {
    setSelected(shop._id);
    setError('');
    setTimeout(() => {
      navigate(`/delivery/products/${shop._id}`, { state: { shopName: shop.name } });
    }, 150);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Navbar */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/delivery')}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: '#60A5FA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2563EB' }}>
              <span className="text-sm">🚚</span>
            </div>
            <span className="font-bold text-sm" style={{ color: '#F8FAFC' }}>SSHCS Delivery</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>Step 1 of 4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: '#F8FAFC' }}>Select a Shop</h1>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Choose from available campus shops to start your order</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={
                  i === 0
                    ? { background: '#2563EB', color: '#F8FAFC', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {i + 1}. {s}
              </span>
              {i < STEPS.length - 1 && (
                <svg className="w-4 h-4" style={{ color: i < 0 ? '#60A5FA' : '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 rounded-xl flex items-center gap-2 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(96,165,250,0.3)', borderTopColor: '#60A5FA' }} />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading shops...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shops.map((shop) => (
              <div
                key={shop._id}
                id={`shop-${shop.name?.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-center gap-5 p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: selected === shop._id ? 'rgba(37,99,235,0.15)' : '#1E293B',
                  border: selected === shop._id ? '1px solid rgba(37,99,235,0.6)' : '1px solid rgba(96,165,250,0.1)',
                  boxShadow: selected === shop._id ? '0 0 24px rgba(37,99,235,0.25)' : '0 4px 16px rgba(0,0,0,0.3)',
                }}
                onClick={() => handleShopClick(shop)}
                onMouseEnter={e => { if (selected !== shop._id) { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.2)'; } }}
                onMouseLeave={e => { if (selected !== shop._id) { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; } }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}
                >
                  {shopEmoji(shop.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl mb-1" style={{ color: '#F8FAFC' }}>{shop.name}</h2>
                  <p className="text-sm mb-2 leading-relaxed" style={{ color: '#CBD5E1' }}>{shop.description}</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#60A5FA' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {shop.location}
                  </div>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ background: selected === shop._id ? '#2563EB' : 'rgba(96,165,250,0.1)' }}
                >
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" style={{ color: selected === shop._id ? '#fff' : '#60A5FA' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
