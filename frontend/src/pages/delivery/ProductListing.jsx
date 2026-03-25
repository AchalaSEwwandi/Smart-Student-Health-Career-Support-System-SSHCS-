import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const FALLBACK = {
  cargils: [
    { _id: 'p1', name: 'Milk (1L)', description: 'Fresh pasteurized milk', price: 85, category: 'Dairy' },
    { _id: 'p2', name: 'Bread (Loaf)', description: 'Soft white bread', price: 120, category: 'Bakery' },
    { _id: 'p3', name: 'Rice (1kg)', description: 'Premium basmati rice', price: 280, category: 'Grains' },
    { _id: 'p4', name: 'Eggs (10 pcs)', description: 'Farm fresh eggs', price: 350, category: 'Protein' },
    { _id: 'p5', name: 'Butter (200g)', description: 'Creamy salted butter', price: 190, category: 'Dairy' },
    { _id: 'p6', name: 'Orange Juice (500ml)', description: 'Fresh squeezed OJ', price: 155, category: 'Beverages' },
  ],
  abenayaka: [
    { _id: 'p7', name: 'Sugar (1kg)', description: 'White refined sugar', price: 175, category: 'Essentials' },
    { _id: 'p8', name: 'Coconut Oil (500ml)', description: 'Pure coconut oil', price: 320, category: 'Cooking' },
    { _id: 'p9', name: 'Dhal (500g)', description: 'Red lentils', price: 180, category: 'Protein' },
    { _id: 'p10', name: 'Noodles (Pack)', description: 'Instant noodles', price: 75, category: 'Dry Food' },
    { _id: 'p11', name: 'Tomato Sauce', description: 'Rich tomato sauce', price: 140, category: 'Sauces' },
    { _id: 'p12', name: 'Tea (100g)', description: 'Ceylon black tea', price: 220, category: 'Beverages' },
  ],
  dewnini: [
    { _id: 'p13', name: 'Soap Bar', description: 'Moisturizing soap', price: 60, category: 'Personal Care' },
    { _id: 'p14', name: 'Shampoo (200ml)', description: 'Herbal shampoo', price: 180, category: 'Personal Care' },
    { _id: 'p15', name: 'Toothpaste', description: 'Whitening toothpaste', price: 95, category: 'Personal Care' },
    { _id: 'p16', name: 'Pen (Pack of 5)', description: 'Blue ballpoint pens', price: 55, category: 'Stationery' },
    { _id: 'p17', name: 'Notebook', description: 'A4 ruled notebook', price: 145, category: 'Stationery' },
    { _id: 'p18', name: 'Hand Sanitizer (100ml)', description: 'Antibacterial gel', price: 110, category: 'Health' },
  ],
};

const CATEGORY_EMOJI = {
  Dairy: '🥛', Bakery: '🍞', Grains: '🌾', Protein: '🥚', Beverages: '🧃',
  Essentials: '🧂', Cooking: '🫙', 'Dry Food': '🍜', Sauces: '🍅',
  'Personal Care': '🧴', Stationery: '📝', Health: '🧼',
};

const STEPS = ['Shop', 'Products', 'Cart', 'Payment'];

export default function ProductListing() {
  const { shopId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const shopName = location.state?.shopName || 'Shop';

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('shopId', shopId);
    sessionStorage.setItem('shopName', shopName);
    const existing = JSON.parse(sessionStorage.getItem('cart') || '[]');
    setCartCount(existing.length);

    axios
      .get(`http://localhost:5000/api/shops/${shopId}/products`)
      .then((res) => setProducts(res.data.data && res.data.data.length > 0 ? res.data.data : getFallback()))
      .catch(() => setProducts(getFallback()))
      .finally(() => setLoading(false));
  }, [shopId]);

  const getFallback = () => FALLBACK[shopId.toLowerCase()] || FALLBACK.cargils;

  const setQty = (productId, val) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 0) {
      setErrors((e) => ({ ...e, [productId]: 'Quantity must be a positive number' }));
      setCart((c) => ({ ...c, [productId]: '' }));
      return;
    }
    if (num > 99) {
      setErrors((e) => ({ ...e, [productId]: 'Maximum quantity is 99' }));
      return;
    }
    setErrors((e) => { const n = { ...e }; delete n[productId]; return n; });
    setCart((c) => ({ ...c, [productId]: num }));
  };

  const addToCart = (product) => {
    const qty = cart[product._id];
    if (!qty || qty <= 0) {
      setErrors((e) => ({ ...e, [product._id]: 'Please enter a quantity of at least 1' }));
      return;
    }
    setErrors((e) => { const n = { ...e }; delete n[product._id]; return n; });
    const existing = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const idx = existing.findIndex((i) => i._id === product._id);
    if (idx >= 0) existing[idx].quantity = qty;
    else existing.push({ ...product, quantity: qty });
    sessionStorage.setItem('cart', JSON.stringify(existing));
    setCartCount(existing.length);
    setAddedItems((a) => ({ ...a, [product._id]: true }));
    setTimeout(() => setAddedItems((a) => ({ ...a, [product._id]: false })), 2000);
  };

  const goToCart = () => {
    const cartItems = JSON.parse(sessionStorage.getItem('cart') || '[]');
    if (cartItems.length === 0) { alert('Your cart is empty. Please add items first.'); return; }
    navigate('/delivery/cart');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Navbar */}
      <nav style={{ background: '#1E293B', borderBottom: '1px solid rgba(96,165,250,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/delivery/shops')}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: '#60A5FA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shops
          </button>
          <button
            id="go-to-cart-btn"
            onClick={goToCart}
            className="relative flex items-center gap-2 px-5 py-2 font-semibold rounded-xl transition-all duration-200 text-sm hover:-translate-y-0.5"
            style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            🛒 View Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold" style={{ background: '#EF4444' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>Step 2 of 4 — {shopName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: '#F8FAFC' }}>Browse Products</h1>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Select quantities and add items to your cart</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={i === 1
                  ? { background: '#2563EB', color: '#F8FAFC', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }
                  : i < 1
                  ? { background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >{i + 1}. {s}</span>
              {i < 3 && <svg className="w-4 h-4" style={{ color: '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(96,165,250,0.3)', borderTopColor: '#60A5FA' }} />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading products...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: '#1E293B',
                  border: '1px solid rgba(96,165,250,0.1)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.2)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.1)'; }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
                    {CATEGORY_EMOJI[product.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight" style={{ color: '#F8FAFC' }}>{product.name}</h3>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#94A3B8' }}>{product.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' }}>
                    {product.category}
                  </span>
                  <p className="font-extrabold text-lg" style={{ color: '#10B981' }}>Rs. {product.price}</p>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <input
                    id={`qty-${product._id}`}
                    type="number" min="1" max="99" placeholder="Qty"
                    value={cart[product._id] || ''}
                    onChange={(e) => setQty(product._id, e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: errors[product._id] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(96,165,250,0.2)',
                      color: '#F8FAFC',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = errors[product._id] ? 'rgba(239,68,68,0.5)' : 'rgba(96,165,250,0.2)'}
                  />
                  <button
                    id={`add-to-cart-${product._id}`}
                    onClick={() => addToCart(product)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={addedItems[product._id]
                      ? { background: '#10B981', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }
                      : { background: '#2563EB', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }
                    }
                    onMouseEnter={e => { if (!addedItems[product._id]) e.currentTarget.style.background = '#1D4ED8'; }}
                    onMouseLeave={e => { if (!addedItems[product._id]) e.currentTarget.style.background = '#2563EB'; }}
                  >
                    {addedItems[product._id] ? '✓ Added' : '+ Add'}
                  </button>
                </div>
                {errors[product._id] && (
                  <p className="text-xs flex items-center gap-1" style={{ color: '#FCA5A5' }}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors[product._id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={goToCart}
              className="flex items-center gap-2 px-10 py-3.5 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
            >
              Proceed to Cart
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
