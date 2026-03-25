import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import GrocerySection from './components/GrocerySection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Delivery pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import ShopSelection from './pages/delivery/ShopSelection';
import ProductListing from './pages/delivery/ProductListing';
import CartPage from './pages/delivery/CartPage';
import PaymentPage from './pages/delivery/PaymentPage';
import OrderTracking from './pages/delivery/OrderTracking';
import DeliveryConfirmation from './pages/delivery/DeliveryConfirmation';
import RatingPage from './pages/delivery/RatingPage';
import OrderHistory from './pages/delivery/OrderHistory';

// Home Page component
function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <GrocerySection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/delivery/shops" element={<ShopSelection />} />
        <Route path="/delivery/products/:shopId" element={<ProductListing />} />
        <Route path="/delivery/cart" element={<CartPage />} />
        <Route path="/delivery/payment/:orderId" element={<PaymentPage />} />
        <Route path="/delivery/tracking/:orderId" element={<OrderTracking />} />
        <Route path="/delivery/confirmation/:orderId" element={<DeliveryConfirmation />} />
        <Route path="/delivery/rating/:orderId" element={<RatingPage />} />
        <Route path="/delivery/history" element={<OrderHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
