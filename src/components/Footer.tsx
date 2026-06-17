import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import '../styles/components/Footer.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Simulate API call or save to localStorage
      const subs = JSON.parse(localStorage.getItem('burgerhub_subscribers') || '[]');
      if (!subs.includes(email)) {
        subs.push(email);
        localStorage.setItem('burgerhub_subscribers', JSON.stringify(subs));
      }
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="footer animate-fade-in">
      {/* Value Props Row */}
      <div className="value-props">
        <div className="value-props-container">
          <div className="prop-item">
            <div className="prop-icon-wrapper prop-blue">
              <Truck size={24} />
            </div>
            <div className="prop-info">
              <h4>Free Delivery</h4>
              <p>Orders over $25</p>
            </div>
          </div>

          <div className="prop-item">
            <div className="prop-icon-wrapper prop-orange">
              <Award size={24} />
            </div>
            <div className="prop-info">
              <h4>Quality Guaranteed</h4>
              <p>Premium ingredients</p>
            </div>
          </div>

          <div className="prop-item">
            <div className="prop-icon-wrapper prop-green">
              <ShieldCheck size={24} />
            </div>
            <div className="prop-info">
              <h4>Secure Payment</h4>
              <p>100% protected</p>
            </div>
          </div>

          <div className="prop-item">
            <div className="prop-icon-wrapper prop-purple">
              <RotateCcw size={24} />
            </div>
            <div className="prop-info">
              <h4>Easy Returns</h4>
              <p>30-day policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="footer-directory">
        <div className="footer-directory-container">
          {/* Logo & Description */}
          <div className="directory-brand">
            <Link to="/" className="logo-link">
              <div className="logo-box">B</div>
              <span className="logo-text">BURGER<span className="orange-text">HUB</span></span>
            </Link>
            <p className="brand-description">
              Crafting premium burgers with locally-sourced ingredients, cooked to perfection. Every bite tells our story of passion, quality, and innovation. Est. 2015.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Menu */}
          <div className="directory-column">
            <h4>Menu</h4>
            <ul>
              <li><Link to="/menu">All Items</Link></li>
              <li><Link to="/menu?category=burgers">Signature Burgers</Link></li>
              <li><Link to="/menu?category=meals">Family Meals</Link></li>
              <li><Link to="/menu?category=sides">Sides & Drinks</Link></li>
              <li><Link to="/menu?category=desserts">Desserts</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="directory-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Locations</Link></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#franchise">Franchise</a></li>
              <li><a href="#press">Press</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="directory-column contact-column">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <span className="contact-label">Phone</span>
                <a href="tel:5551234567">(555) 123-4567</a>
              </li>
              <li>
                <span className="contact-label">Email</span>
                <a href="mailto:Geekstechnologies911@gmail.com" className="email-link">Made by Geekstechnologies911@gmail.com</a>
              </li>
              <li>
                <span className="contact-label">Address</span>
                <p>123 Burger Street, Food City, FC 12345</p>
              </li>
              <li>
                <span className="contact-label">Hours</span>
                <p>Mon-Thu: 11am - 11pm</p>
                <p>Fri-Sat: 11am - 2am</p>
                <p>Sun: 12pm - 10pm</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="footer-newsletter">
        <div className="newsletter-container">
          <div className="newsletter-header">
            <div className="newsletter-icon-box">
              <Send size={20} />
            </div>
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter for exclusive offers, new menu items, and special promotions delivered to your inbox.</p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="form-input newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary subscribe-btn">
              Subscribe
            </button>
          </form>
          {subscribed && <p className="subscribe-success animate-fade-in">Thank you for subscribing! Welcome to BurgerHub.</p>}
          <p className="newsletter-disclaimer">By subscribing, you agree to our Privacy Policy and consent to receive updates.</p>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} BurgerHub. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookie">Cookie Policy</a>
            <a href="#accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
