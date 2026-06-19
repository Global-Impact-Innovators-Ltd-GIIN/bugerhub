import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, ArrowRight } from 'lucide-react';
import { CustomizerModal } from '../components/CustomizerModal';
import { fetchMenuCategories, fetchMenuItems } from '../utils/supabaseDb';
import { formatRWF } from '../utils/pricing';
import '../styles/pages/Menu.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const loadMenuData = async () => {
      const cats = await fetchMenuCategories();
      setCategories(cats);

      const items = await fetchMenuItems();
      setMenuItems(items);
    };
    loadMenuData();
  }, []);

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
          {categories.map(tab => (
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
                      <span className="product-price">{formatRWF(item.price)}</span>
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
