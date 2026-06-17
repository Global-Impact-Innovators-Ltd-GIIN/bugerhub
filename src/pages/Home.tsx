import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Clock, ArrowRight } from 'lucide-react';
import { CustomizerModal } from '../components/CustomizerModal';
import '../styles/pages/Home.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'burgers' | 'sides' | 'drinks' | 'desserts' | 'meals';
  image: string;
}

export const Home: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Featured items definitions matching the screenshot
  const featuredFavorites: MenuItem[] = [
    {
      id: 'triple-threat',
      name: 'Triple Threat Burger',
      description: 'Three juicy patties, triple cheese, bacon, and our special sauce',
      price: 18.99,
      category: 'burgers',
      image: '/images/triple_threat_burger.png'
    },
    {
      id: 'animal-fries',
      name: 'Loaded Animal Fries',
      description: 'Crispy fries topped with cheese, grilled onions, thousand island',
      price: 9.99,
      category: 'sides',
      image: '/images/loaded_animal_fries.png'
    },
    {
      id: 'spicy-chicken',
      name: 'Spicy Chicken Deluxe',
      description: 'Spicy fried chicken, coleslaw, pickles, chipotle mayo',
      price: 14.99,
      category: 'burgers',
      image: '/images/spicy_chicken_deluxe.png'
    }
  ];

  const handleCustomizeClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsCustomizerOpen(true);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-grid">
          {/* Left Column */}
          <div className="hero-content animate-fade-in">
            <div className="status-badge">
              <span className="dot"></span> Now Open • 7 Days a Week
            </div>
            
            <h1>
              Premium Burgers <br />
              <span className="text-gradient-orange">Made Fresh Daily</span>
            </h1>
            
            <p className="hero-subtitle">
              Experience quality ingredients, expert craftsmanship, and flavors that stand out. Every burger is made to order with care.
            </p>
            
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary">View Menu <ArrowRight size={16} /></Link>
              <button 
                onClick={() => handleCustomizeClick(featuredFavorites[0])} 
                className="btn btn-secondary"
              >
                Customize Order
              </button>
            </div>
            
            <div className="hero-props">
              <div className="hero-prop-item">
                <ShieldCheck size={18} className="prop-icon" />
                <div>
                  <h5>Quality</h5>
                  <p>Fresh ingredients</p>
                </div>
              </div>
              
              <div className="hero-prop-item">
                <Truck size={18} className="prop-icon" />
                <div>
                  <h5>Delivery</h5>
                  <p>Free over $25</p>
                </div>
              </div>
              
              <div className="hero-prop-item">
                <Clock size={18} className="prop-icon" />
                <div>
                  <h5>Fast</h5>
                  <p>15 min average</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="hero-media animate-fade-in">
            <div className="hero-image-wrapper">
              <img src="/images/hero_burger.png" alt="Premium Burger" className="hero-burger-img animate-float" />
              
              {/* Frosted Stats Badge */}
              <div className="hero-stats-badge">
                <div className="stat-col">
                  <span className="stat-value"><Star size={14} className="star-icon" fill="currentColor" /> 4.9</span>
                  <span className="stat-label">Average Rating</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-col">
                  <span className="stat-value">5K+</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-col">
                  <span className="stat-value">15m</span>
                  <span className="stat-label">Avg. Wait Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header text-center">
            <h2>FEATURED <span className="orange-text">FAVORITES</span></h2>
            <p>Customer favorites that never disappoint</p>
          </div>
          
          <div className="featured-grid">
            {featuredFavorites.map((item, index) => {
              // Custom tags for favorites based on screenshot
              const tags = index === 0 ? ['HOT', 'NEW'] : index === 1 ? ['BESTSELLER'] : ['SPICY'];
              const ratings = index === 0 ? '4.9' : index === 1 ? '4.7' : '4.8';
              
              return (
                <div className="featured-card card animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }} key={item.id}>
                  <div className="card-image-wrapper">
                    <img src={item.image} alt={item.name} className="featured-item-image" />
                    <div className="card-tags">
                      {tags.map(t => (
                        <span key={t} className={`card-tag tag-${t.toLowerCase()}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-title-row">
                      <h3>{item.name}</h3>
                      <span className="card-rating">
                        <Star size={13} fill="currentColor" /> {ratings}
                      </span>
                    </div>
                    <p className="card-desc">{item.description}</p>
                    
                    <div className="card-footer">
                      <span className="card-price">${item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => handleCustomizeClick(item)} 
                        className="btn btn-secondary customize-btn"
                      >
                        Customize <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="view-menu-footer text-center">
            <Link to="/menu" className="btn btn-primary view-all-btn">
              VIEW FULL MENU <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Customize Modal */}
      <CustomizerModal 
        item={selectedItem} 
        isOpen={isCustomizerOpen} 
        onClose={() => setIsCustomizerOpen(false)} 
      />
    </div>
  );
};
