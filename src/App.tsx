import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Deals } from './pages/Deals';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { AdminLogin } from './pages/AdminLogin';
import { AdminSignup } from './pages/AdminSignup';
import { AdminDashboard } from './pages/AdminDashboard';
import { ChefLogin } from './pages/ChefLogin';
import { ChefDashboard } from './pages/ChefDashboard';
import { RiderLogin } from './pages/RiderLogin';
import { RiderDashboard } from './pages/RiderDashboard';
import { UserLogin } from './pages/UserLogin';
import { UserSignup } from './pages/UserSignup';
import { UserProfile } from './pages/UserProfile';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-wrapper">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/tracking" element={<OrderTracking />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/signup" element={<UserSignup />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/chef/login" element={<ChefLogin />} />
              <Route path="/chef/dashboard" element={<ChefDashboard />} />
              <Route path="/rider/login" element={<RiderLogin />} />
              <Route path="/rider/dashboard" element={<RiderDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;

