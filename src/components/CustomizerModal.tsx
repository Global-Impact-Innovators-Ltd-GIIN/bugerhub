import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRWF } from '../utils/pricing';
import '../styles/components/CustomizerModal.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({ item, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedBun, setSelectedBun] = useState('Brioche Bun');
  const [selectedDoneness, setSelectedDoneness] = useState('Medium-Well');
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>(['Special Sauce']);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [size, setSize] = useState('Regular');
  
  // Floating Toast success message state
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedBun('Brioche Bun');
      setSelectedDoneness('Medium-Well');
      setSelectedExtras([]);
      setSpecialInstructions('');
      setSize('Regular');
      
      // Default sauces based on item
      if (item.id === 'triple-threat') {
        setSelectedSauces(['Special Sauce']);
      } else if (item.id === 'spicy-chicken') {
        setSelectedSauces(['Chipotle Mayo']);
      } else {
        setSelectedSauces(['Special Sauce']);
      }
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const extrasOptions = [
    { name: 'Extra Beef Patty', price: 4.00 },
    { name: 'Cheddar Cheese', price: 1.00 },
    { name: 'Crispy Smoked Bacon', price: 1.50 },
    { name: 'Fried Egg', price: 1.50 },
    { name: 'Sliced Avocado', price: 2.00 }
  ];

  const sauceOptions = [
    'Special Sauce',
    'Chipotle Mayo',
    'BBQ Sauce',
    'Thousand Island',
    'Spicy Buffalo',
    'Creamy Garlic Mayo'
  ];

  const handleExtraToggle = (extra: { name: string; price: number }) => {
    setSelectedExtras(prev => 
      prev.some(e => e.name === extra.name)
        ? prev.filter(e => e.name !== extra.name)
        : [...prev, extra]
    );
  };

  const handleSauceToggle = (sauce: string) => {
    setSelectedSauces(prev =>
      prev.includes(sauce)
        ? prev.filter(s => s !== sauce)
        : [...prev, sauce]
    );
  };

  const calculateItemTotalPrice = (): number => {
    let price = item.price;
    
    // Add size price
    if (size === 'Large') {
      price += 1.50;
    }
    
    // Add extras
    const extrasTotal = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
    return price + extrasTotal;
  };

  const handleAddToCart = () => {
    const customizations = item.category === 'burgers' || item.category === 'meals' ? {
      bun: selectedBun,
      doneness: selectedDoneness,
      extras: selectedExtras,
      sauces: selectedSauces,
      notes: specialInstructions
    } : {
      bun: size !== 'Regular' ? `Size: ${size}` : undefined,
      extras: [],
      sauces: selectedSauces,
      notes: specialInstructions
    };

    addToCart({
      menuId: item.id,
      name: item.name + (size !== 'Regular' && item.category !== 'burgers' ? ` (${size})` : ''),
      basePrice: item.price + (size === 'Large' ? 1.50 : 0),
      image: item.image,
      customizations,
      quantity
    });

    // Trigger audio chime & toast notification
    playChimeAdd();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1200);
  };

  const isBurger = item.category === 'burgers' || item.category === 'meals';
  const itemPrice = calculateItemTotalPrice();
  const grandTotal = itemPrice * quantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-customizer-modal-enter" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customize Your Order</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        <div className="modal-content customizer-two-column">
          {/* Left Column: Visual Burger Builder (Only for Burgers) */}
          {isBurger && (
            <div className="burger-builder-preview-col">
              <div className="burger-builder-canvas-wrapper">
                <div className="burger-builder-canvas">
                  <div className="burger-stack">
                    {/* Top Bun */}
                    <div className={`burger-layer layer-bun-top ${selectedBun === 'Lettuce Wrap' ? 'lettuce' : selectedBun.includes('Gluten-Free') ? 'gf' : 'brioche'}`}>
                      <div className="sesame-seeds">
                        <span className="seed"></span>
                        <span className="seed"></span>
                        <span className="seed"></span>
                        <span className="seed"></span>
                        <span className="seed"></span>
                      </div>
                      <span className="layer-badge">Top Bun</span>
                    </div>

                    {/* Sauces / Melted toppings */}
                    {selectedSauces.map(sauce => (
                      <div key={sauce} className={`burger-layer layer-sauce ${sauce.toLowerCase().replace(/\s/g, '-')}`}>
                        <div className="sauce-drip drip-1"></div>
                        <div className="sauce-drip drip-2"></div>
                        <div className="sauce-drip drip-3"></div>
                      </div>
                    ))}

                    {/* Extras: Egg */}
                    {selectedExtras.some(e => e.name === 'Fried Egg') && (
                      <div className="burger-layer layer-egg animate-slide-down">
                        <div className="egg-white"></div>
                        <div className="egg-yolk"></div>
                        <span className="layer-badge">Fried Egg</span>
                      </div>
                    )}

                    {/* Extras: Bacon */}
                    {selectedExtras.some(e => e.name === 'Crispy Smoked Bacon') && (
                      <div className="burger-layer layer-bacon animate-slide-down">
                        <div className="bacon-strip strip-1"></div>
                        <div className="bacon-strip strip-2"></div>
                        <span className="layer-badge">Smoked Bacon</span>
                      </div>
                    )}

                    {/* Extras: Cheese */}
                    {selectedExtras.some(e => e.name === 'Cheddar Cheese') && (
                      <div className="burger-layer layer-cheese animate-slide-down">
                        <div className="melted-corner corner-1"></div>
                        <div className="melted-corner corner-2"></div>
                        <span className="layer-badge">Melted Cheddar</span>
                      </div>
                    )}

                    {/* Extras: Extra Patty */}
                    {selectedExtras.some(e => e.name === 'Extra Beef Patty') && (
                      <div className="burger-layer layer-patty extra-patty animate-slide-down">
                        <div className="patty-sear"></div>
                        <div className="patty-sear-2"></div>
                        <span className="layer-badge">Double Beef Patty</span>
                      </div>
                    )}

                    {/* Main Patty */}
                    <div className="burger-layer layer-patty main-patty">
                      <div className="patty-sear"></div>
                      <div className="patty-sear-2"></div>
                      <span className="layer-badge">Beef Patty ({selectedDoneness})</span>
                    </div>

                    {/* Extras: Avocado */}
                    {selectedExtras.some(e => e.name === 'Sliced Avocado') && (
                      <div className="burger-layer layer-avocado animate-slide-down">
                        <div className="avocado-slice wedge-1"></div>
                        <div className="avocado-slice wedge-2"></div>
                        <div className="avocado-slice wedge-3"></div>
                        <span className="layer-badge">Sliced Avocado</span>
                      </div>
                    )}

                    {/* Bottom Bun */}
                    <div className={`burger-layer layer-bun-bottom ${selectedBun === 'Lettuce Wrap' ? 'lettuce' : selectedBun.includes('Gluten-Free') ? 'gf' : 'brioche'}`}>
                      <span className="layer-badge">Bottom Bun</span>
                    </div>
                  </div>
                </div>
                <div className="visual-builder-meta">
                  <span className="builder-title">Live 2D Custom Stack</span>
                  <p className="builder-subtitle">Toggle options to build your ideal bite</p>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Scrollable Customizer Form Options */}
          <div className="customizer-options-col">
            {/* Main Info */}
            <div className="modal-item-summary">
              <img src={item.image} alt={item.name} className="modal-item-image" />
              <div className="modal-item-details">
                <h3>{item.name}</h3>
                <p className="modal-item-desc">{item.description}</p>
                <p className="modal-item-base-price">Base Price: <span>{formatRWF(item.price)}</span></p>
              </div>
            </div>

            <div className="modal-divider"></div>

            {/* Conditional Options */}
            {isBurger ? (
              <>
                {/* Bun Selection */}
                <div className="custom-section">
                  <h4>Choose Your Bun</h4>
                  <div className="options-grid">
                    {['Brioche Bun', 'Gluten-Free Bun (+1,300 RWF)', 'Lettuce Wrap'].map(bun => {
                      const isSelected = selectedBun === bun;
                      return (
                        <button 
                          key={bun}
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedBun(bun);
                            playChimeClick();
                          }}
                        >
                          <div className="radio-dot">{isSelected && <div className="radio-dot-inner"></div>}</div>
                          <span>{bun}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doneness Selection */}
                <div className="custom-section">
                  <h4>Meat Doneness</h4>
                  <div className="options-grid">
                    {['Medium', 'Medium-Well', 'Well-Done'].map(done => {
                      const isSelected = selectedDoneness === done;
                      return (
                        <button 
                          key={done}
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedDoneness(done);
                            playChimeClick();
                          }}
                        >
                          <div className="radio-dot">{isSelected && <div className="radio-dot-inner"></div>}</div>
                          <span>{done}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Extras Selection */}
                <div className="custom-section">
                  <h4>Add Extras</h4>
                  <div className="options-grid">
                    {extrasOptions.map(extra => {
                      const isSelected = selectedExtras.some(e => e.name === extra.name);
                      return (
                        <button 
                          key={extra.name}
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            handleExtraToggle(extra);
                            playChimeClick();
                          }}
                        >
                          <div className="checkbox-box">{isSelected && <Check size={14} />}</div>
                          <span className="extra-info">
                            {extra.name} <span className="extra-price">+{formatRWF(extra.price)}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sauces Selection */}
                <div className="custom-section">
                  <h4>Sauces</h4>
                  <div className="options-grid">
                    {sauceOptions.map(sauce => {
                      const isSelected = selectedSauces.includes(sauce);
                      return (
                        <button 
                          key={sauce}
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            handleSauceToggle(sauce);
                            playChimeClick();
                          }}
                        >
                          <div className="checkbox-box">{isSelected && <Check size={14} />}</div>
                          <span>{sauce}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Sizes Selection for Drinks/Sides */}
                {(item.category === 'drinks' || item.category === 'sides') && (
                  <div className="custom-section">
                    <h4>Choose Size</h4>
                    <div className="options-grid">
                      {['Regular', 'Large (+1,950 RWF)'].map(sz => {
                        const sizeName = sz.split(' ')[0];
                        const isSelected = size === sizeName;
                        return (
                          <button 
                            key={sizeName}
                            className={`option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSize(sizeName);
                              playChimeClick();
                            }}
                          >
                            <div className="radio-dot">{isSelected && <div className="radio-dot-inner"></div>}</div>
                            <span>{sz}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Special Instructions */}
            <div className="custom-section">
              <h4>Special Instructions</h4>
              <textarea 
                placeholder="e.g. No onions, sauce on the side, extra napkins..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="form-input instructions-textarea"
                maxLength={200}
              />
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="modal-footer">
          <div className="quantity-selector-container">
            <span className="qty-label">Quantity</span>
            <div className="quantity-controls text-box-qty">
              <button 
                onClick={() => {
                  setQuantity(q => Math.max(1, q - 1));
                  playChimeClick();
                }} 
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button 
                onClick={() => {
                  setQuantity(q => q + 1);
                  playChimeClick();
                }} 
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button className="btn btn-primary add-cart-btn" onClick={handleAddToCart}>
            ADD TO CART • {formatRWF(grandTotal)}
          </button>
        </div>
      </div>

      {/* Floating success feedback toast */}
      {showToast && (
        <div className="toast-notification animate-fade-in">
          <div className="toast-icon"><Check size={18} /></div>
          <span>Added to order!</span>
        </div>
      )}
    </div>
  );
};

// Clean Web Audio Synthesis Helper
const playChimeClick = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
};

const playChimeAdd = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    
    osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.25);
  } catch (e) {}
};
