import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, ArrowRight } from 'lucide-react';
import { CustomizerModal } from '../components/CustomizerModal';
import '../styles/pages/Menu.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'burgers' | 'sides' | 'drinks' | 'desserts' | 'meals';
  image: string;
}

export const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Sync state if query search param changes
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    setActiveCategory(categoryParam);
  }, [searchParams]);

  const menuItems: MenuItem[] = [
    {
      id: 'triple-threat',
      name: 'Triple Threat Burger',
      description: 'Three juicy beef patties, triple cheddar cheese, smoked bacon, special sauce, brioche bun.',
      price: 18.99,
      category: 'burgers',
      image: '/images/triple_threat_burger.png'
    },
    {
      id: 'spicy-chicken',
      name: 'Spicy Chicken Deluxe',
      description: 'Spicy crispy fried chicken, creamy coleslaw, dill pickle slices, chipotle mayo, brioche bun.',
      price: 14.99,
      category: 'burgers',
      image: '/images/spicy_chicken_deluxe.png'
    },
    {
      id: 'classic-cheeseburger',
      name: 'Classic Cheeseburger',
      description: 'Flame-grilled beef patty, melted cheddar, crisp lettuce, tomato, pickles, and our signature sauce.',
      price: 12.99,
      category: 'burgers',
      image: '/images/hero_burger.png'
    },
    {
      id: 'bacon-avocado',
      name: 'Bacon Avocado Burger',
      description: 'Flame-grilled beef patty, smoked bacon, fresh avocado slices, Swiss cheese, and garlic aioli.',
      price: 15.99,
      category: 'burgers',
      image: '/images/triple_threat_burger.png'
    },
    {
      id: 'animal-fries',
      name: 'Loaded Animal Fries',
      description: 'Crispy golden french fries topped with melted cheese, caramelized grilled onions, and thousand island sauce.',
      price: 9.99,
      category: 'sides',
      image: '/images/loaded_animal_fries.png'
    },
    {
      id: 'sweet-potato-fries',
      name: 'Sweet Potato Fries',
      description: 'Crispy sweet potato fries lightly salted, served with a side of maple dipping sauce.',
      price: 6.99,
      category: 'sides',
      image: '/images/loaded_animal_fries.png'
    },
    {
      id: 'double-stack-meal',
      name: 'Double Stack Combo Deal',
      description: 'Double Cheeseburger, Loaded Animal Fries, and a large draft soda. The ultimate meal.',
      price: 24.99,
      category: 'meals',
      image: '/images/hero_burger.png'
    },
    {
      id: 'draft-soda',
      name: 'Draft Soda',
      description: 'Refreshing carbonated beverages poured fresh over ice. Choice of Coca Cola, Sprite, or Fanta.',
      price: 3.49,
      category: 'drinks',
      image: '/images/loaded_animal_fries.png'
    },
    {
      id: 'milkshake',
      name: 'Classic Milkshake',
      description: 'Thick, creamy milkshake made with real vanilla ice cream. Whipped cream and cherry on top.',
      price: 5.99,
      category: 'desserts',
      image: '/images/spicy_chicken_deluxe.png'
    },
    {
      id: 'chocolate-brownie',
      name: 'Warm Chocolate Brownie',
      description: 'Warm fudge chocolate brownie topped with chocolate drizzle, served with vanilla ice cream.',
      price: 7.99,
      category: 'desserts',
      image: '/images/triple_threat_burger.png'
    }
  ];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleCustomizeClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsCustomizerOpen(true);
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="menu-page">
      {/* Banner */}
      <section className="menu-banner text-center">
        <div className="container">
          <h1 className="animate-fade-in">OUR PREMIUM <span className="orange-text">MENU</span></h1>
          <p className="animate-fade-in subtitle-banner">Handcrafted flavors, premium ingredients, and direct checkout.</p>
        </div>
      </section>

      {/* Controls Container */}
      <section className="menu-controls container">
        {/* Category Tabs */}
        <div className="category-tabs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'burgers', label: 'Signature Burgers' },
            { id: 'meals', label: 'Family Meals' },
            { id: 'sides', label: 'Sides & Drinks' },
            { id: 'desserts', label: 'Desserts' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`category-tab-btn ${activeCategory === tab.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <Search size={18} className="search-icon-svg" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-menu-input"
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="menu-products container">
        {filteredItems.length === 0 ? (
          <div className="no-products-found text-center">
            <h3>No items matched your criteria</h3>
            <p>Try searching for something else or changing the active category filter.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item, index) => {
              // Custom ratings just for aesthetic realism
              const ratings = item.id.includes('threat') || item.id.includes('classic') ? '4.9' : '4.8';
              
              return (
                <div className="menu-product-card card animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }} key={item.id}>
                  <div className="product-card-img-wrapper">
                    <img src={item.image} alt={item.name} className="product-image" />
                    {item.id === 'triple-threat' && <span className="product-badge badge-hot">HOT</span>}
                    {item.id === 'double-stack-meal' && <span className="product-badge badge-deal">COMBO</span>}
                  </div>
                  
                  <div className="product-card-body">
                    <div className="product-title-row">
                      <h4>{item.name}</h4>
                      <span className="product-rating">
                        <Star size={12} fill="currentColor" /> {ratings}
                      </span>
                    </div>
                    <p className="product-desc">{item.description}</p>
                    
                    <div className="product-footer">
                      <span className="product-price">${item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => handleCustomizeClick(item)} 
                        className="btn btn-secondary customize-btn-menu"
                      >
                        Customize <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Customizer Modal */}
      <CustomizerModal
        item={selectedItem}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
};
