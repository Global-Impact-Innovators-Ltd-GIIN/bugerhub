import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/components/Header.css';

export const Header: React.FC = () => {
  const { cart, cartCount, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const [isRider, setIsRider] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem('burgerhub_active_user');
    const adminSession = localStorage.getItem('burgerhub_active_admin');
    const chefSession = localStorage.getItem('burgerhub_active_chef');
    const riderSession = localStorage.getItem('burgerhub_active_rider');

    setCurrentUser(userSession ? JSON.parse(userSession) : null);
    setIsAdmin(!!adminSession);
    setIsChef(!!chefSession);
    setIsRider(!!riderSession);
  }, [location.pathname]);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <header className="header animate-fade-in">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo-link">
            <div className="logo-box">B</div>
            <span className="logo-text">BURGER<span className="orange-text">HUB</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
            <Link to="/menu" className={`nav-link ${isActive('/menu')}`}>Menu</Link>
            <Link to="/deals" className={`nav-link ${isActive('/deals')}`}>Deals</Link>
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Contact</Link>
            {isAdmin && <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>Admin</Link>}
            {isChef && <Link to="/chef/dashboard" className={`nav-link ${isActive('/chef/dashboard')}`}>Chef</Link>}
            {isRider && <Link to="/rider/dashboard" className={`nav-link ${isActive('/rider/dashboard')}`}>Rider</Link>}
          </nav>
          
          {/* Actions */}
          <div className="header-actions">
            {currentUser ? (
              <Link to="/profile" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', display: 'inline-block' }}></span>
                <span>{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                Sign In
              </Link>
            )}
            <button className="cart-trigger-btn" onClick={toggleCart} aria-label="Open Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <Link to="/menu" className="btn btn-primary order-btn">ORDER NOW</Link>
            
            <button className="mobile-menu-trigger" onClick={toggleMobileMenu} aria-label="Toggle Menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
 
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="nav-mobile">
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={toggleMobileMenu}>Home</Link>
            <Link to="/menu" className={`nav-link ${isActive('/menu')}`} onClick={toggleMobileMenu}>Menu</Link>
            <Link to="/deals" className={`nav-link ${isActive('/deals')}`} onClick={toggleMobileMenu}>Deals</Link>
            <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={toggleMobileMenu}>About</Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={toggleMobileMenu}>Contact</Link>
            {isAdmin && <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`} onClick={toggleMobileMenu}>Admin Portal</Link>}
            {isChef && <Link to="/chef/dashboard" className={`nav-link ${isActive('/chef/dashboard')}`} onClick={toggleMobileMenu}>Chef Portal</Link>}
            {isRider && <Link to="/rider/dashboard" className={`nav-link ${isActive('/rider/dashboard')}`} onClick={toggleMobileMenu}>Rider Portal</Link>}
            {currentUser ? (
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={toggleMobileMenu}>My Profile ({currentUser.name})</Link>
            ) : (
              <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={toggleMobileMenu}>Sign In / Sign Up</Link>
            )}
            <Link to="/menu" className="btn btn-primary mobile-order-btn" onClick={toggleMobileMenu}>ORDER NOW</Link>
          </nav>
        )}
      </header>

      {/* Cart Drawer Overlay */}
      {isCartOpen && <div className="cart-overlay" onClick={toggleCart}></div>}

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Your Order ({cartCount})</h3>
          <button className="close-btn" onClick={toggleCart} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-content">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              <ShoppingCart size={48} className="muted-icon animate-float" />
              <p>Your cart is empty</p>
              <Link to="/menu" className="btn btn-primary" onClick={toggleCart}>View Menu</Link>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    <p className="cart-item-price">${(item.totalPrice * item.quantity).toFixed(2)}</p>
                    
                    {/* Selected Customizations */}
                    {(item.customizations.bun || item.customizations.doneness || item.customizations.extras.length > 0 || item.customizations.sauces.length > 0) && (
                      <div className="cart-item-customizations">
                        {item.customizations.bun && <span>Bun: {item.customizations.bun}</span>}
                        {item.customizations.doneness && <span>Doneness: {item.customizations.doneness}</span>}
                        {item.customizations.extras.length > 0 && (
                          <span>Add: {item.customizations.extras.map(e => e.name).join(', ')}</span>
                        )}
                        {item.customizations.sauces.length > 0 && (
                          <span>Sauce: {item.customizations.sauces.join(', ')}</span>
                        )}
                        {item.customizations.notes && <span className="notes-span">Notes: "{item.customizations.notes}"</span>}
                      </div>
                    )}

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="price-tag">${cartSubtotal.toFixed(2)}</span>
            </div>
            <p className="footer-disclaimer">Taxes and delivery calculated at checkout</p>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckoutClick}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
};
