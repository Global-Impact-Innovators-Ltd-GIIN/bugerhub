import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Calendar, ArrowRight, Percent } from 'lucide-react';
import '../styles/pages/Deals.css';

interface Deal {
  id: string;
  title: string;
  code?: string;
  description: string;
  badge: string;
  discount: string;
  expiry: string;
  image: string;
}

export const Deals: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const dealsList: Deal[] = [
    {
      id: 'double-stack',
      title: 'Double Stack Combo Deal',
      description: 'Get a Double Cheeseburger, Loaded Animal Fries, and a large draft soda. Save over $5.00!',
      badge: 'POPULAR COMBO',
      discount: '$24.99 Only',
      expiry: 'Expires 07/15/2026',
      image: '/images/hero_burger.png'
    },
    {
      id: 'coupon-burger20',
      title: '20% Off All Signature Burgers',
      code: 'BURGER20',
      description: 'Enjoy a 20% discount on any signature burgers on the menu. Valid for online orders only.',
      badge: 'WEEKLY COUPON',
      discount: '20% OFF',
      expiry: 'Expires 06/30/2026',
      image: '/images/triple_threat_burger.png'
    },
    {
      id: 'coupon-freefries',
      title: 'Free Loaded Fries with Order over $30',
      code: 'FREEANIMAL',
      description: 'Add a portion of Loaded Animal Fries to your cart and apply code to get it completely free.',
      badge: 'SPECIAL DEAL',
      discount: 'FREE FRIES',
      expiry: 'Expires 07/04/2026',
      image: '/images/loaded_animal_fries.png'
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="deals-page animate-fade-in">
      {/* Banner */}
      <section className="deals-banner text-center">
        <div className="container">
          <div className="deals-icon-box animate-float">
            <Percent size={26} />
          </div>
          <h1>EXCLUSIVE <span className="orange-text">DEALS</span></h1>
          <p className="subtitle-banner">Savor premium tastes with active discounts, combo savings, and coupon codes.</p>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="deals-section container">
        <div className="deals-grid">
          {dealsList.map(deal => (
            <div className="deal-card card" key={deal.id}>
              <div className="deal-img-wrapper">
                <img src={deal.image} alt={deal.title} className="deal-image" />
                <span className="deal-badge">{deal.badge}</span>
              </div>

              <div className="deal-body">
                <div className="deal-title-row">
                  <h3>{deal.title}</h3>
                  <span className="deal-discount-tag">{deal.discount}</span>
                </div>
                <p className="deal-desc">{deal.description}</p>
                
                {deal.code ? (
                  <div className="coupon-code-box">
                    <span className="coupon-code-text">{deal.code}</span>
                    <button 
                      onClick={() => handleCopyCode(deal.code!)}
                      className="btn btn-secondary copy-coupon-btn"
                    >
                      {copiedCode === deal.code ? (
                        <>
                          <Check size={14} className="color-green" /> Copied
                        </>
                      ) : (
                        'Copy Code'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="combo-order-box">
                    <Link to="/menu?category=meals" className="btn btn-primary combo-order-btn">
                      Order Combo <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

                <div className="deal-footer">
                  <div className="deal-expiry">
                    <Calendar size={13} />
                    <span>{deal.expiry}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
