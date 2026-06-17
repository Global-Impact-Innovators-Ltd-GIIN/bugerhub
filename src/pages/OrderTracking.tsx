import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, MapPin, Receipt, Printer, Bike } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/pages/OrderTracking.css';

export const OrderTracking: React.FC = () => {
  const { activeOrder, updateOrderStatus, clearActiveOrder } = useCart();
  const [eta, setEta] = useState(25); // initial ETA in minutes
  const [progressWidth, setProgressWidth] = useState(15);
  
  const EXCHANGE_RATE = 1300;
  const currency = activeOrder?.details.currency || 'USD';

  // Helper: Format amount with RWF/USD conversions
  const formatAmount = (usdAmount: number) => {
    if (currency === 'RWF') {
      const rwfAmount = Math.round(usdAmount * EXCHANGE_RATE);
      return `${rwfAmount.toLocaleString()} RWF`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  // Timer for status simulation
  useEffect(() => {
    if (!activeOrder) return;

    const timer = setTimeout(() => {
      if (activeOrder.status === 'preparing') {
        updateOrderStatus('cooking');
        setProgressWidth(45);
        setEta(18);
      } else if (activeOrder.status === 'cooking') {
        updateOrderStatus('delivering');
        setProgressWidth(75);
        setEta(10);
      } else if (activeOrder.status === 'delivering') {
        updateOrderStatus('delivered');
        setProgressWidth(100);
        setEta(0);
      }
    }, 12000); // changes status every 12 seconds for mock demonstration

    return () => clearTimeout(timer);
  }, [activeOrder, updateOrderStatus]);

  // Handle print receipt
  const handlePrint = () => {
    window.print();
  };

  if (!activeOrder) {
    return (
      <div className="tracking-page empty-tracking text-center animate-fade-in">
        <div className="container empty-container">
          <Clock size={56} className="muted-icon animate-float" />
          <h2>No Active Order</h2>
          <p>You don't have any active orders currently in progress.</p>
          <div className="mt-4 flex-row-buttons">
            <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
            <Link to="/" className="btn btn-secondary">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const isDelivery = activeOrder.details.deliveryMethod === 'delivery';

  // Status mapping
  const statuses = [
    { key: 'preparing', label: 'Order Placed', desc: `Confirmed from our Kigali flagship` },
    { key: 'cooking', label: 'Kitchen Preparing', desc: 'Chefs are grilling your fresh patties' },
    { key: 'delivering', label: isDelivery ? 'Out for Delivery' : 'Ready for Pickup', desc: isDelivery ? 'MoMo courier heading to your pin' : 'Hot and ready to collect' },
    { key: 'delivered', label: isDelivery ? 'Arrived & Delivered' : 'Order Collected', desc: isDelivery ? 'Enjoy your burger!' : 'Thank you for dining at BurgerHub!' }
  ];

  const getStepClass = (_stepKey: string, index: number) => {
    const currentIndex = statuses.findIndex(s => s.key === activeOrder.status);
    if (currentIndex > index) return 'step-completed';
    if (currentIndex === index) return 'step-active';
    return 'step-pending';
  };

  return (
    <div className="tracking-page animate-fade-in">
      <div className="container">
        
        {/* Print-Only Receipt Block */}
        <div className="print-receipt-only">
          <div className="print-header">
            <h2>BURGERHUB RECEIPT</h2>
            <p>123 Burger Street, Kigali, Rwanda</p>
            <p>Phone: +250 788 123 456</p>
          </div>
          <div className="print-divider"></div>
          <div className="print-meta">
            <p><strong>Order ID:</strong> {activeOrder.id}</p>
            <p><strong>Date:</strong> {activeOrder.date}</p>
            <p><strong>Customer:</strong> {activeOrder.details.name}</p>
            <p><strong>Method:</strong> {activeOrder.details.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
            <p><strong>Payment:</strong> {
              activeOrder.details.paymentMethod === 'stripe' 
                ? `Credit Card ${activeOrder.details.cardNumberMuted}` 
                : activeOrder.details.paymentMethod === 'momo'
                ? `${activeOrder.details.momoProvider?.toUpperCase()} MoMo (${activeOrder.details.momoPhone})`
                : 'Cash'
            }</p>
          </div>
          <div className="print-divider"></div>
          <div className="print-items">
            {activeOrder.items.map(item => (
              <div className="print-item-row" key={item.id}>
                <span>{item.quantity}x {item.name}</span>
                <span>{formatAmount(item.totalPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="print-divider"></div>
          <div className="print-totals">
            <p>Subtotal: {formatAmount(activeOrder.subtotal)}</p>
            <p>Sales Tax (8%): {formatAmount(activeOrder.tax)}</p>
            <p>Delivery Fee: {formatAmount(activeOrder.deliveryFee)}</p>
            <p className="print-grand">Total Paid: {formatAmount(activeOrder.total)}</p>
          </div>
          <div className="print-divider"></div>
          <div className="print-footer-text">
            <p>Thank you for ordering from BurgerHub Rwanda!</p>
          </div>
        </div>

        {/* Interactive UI Screen */}
        <div className="screen-content">
          <div className="tracking-header-row">
            <div>
              <span className="tracking-meta-id">Order ID: {activeOrder.id}</span>
              <h1>TRACK YOUR ORDER</h1>
            </div>
            <div className="header-action-buttons">
              <button onClick={handlePrint} className="btn btn-secondary print-receipt-btn">
                <Printer size={16} /> Print Receipt
              </button>
              <button onClick={clearActiveOrder} className="btn btn-secondary clear-track-btn">
                New Order
              </button>
            </div>
          </div>

          <div className="tracking-layout">
            {/* Left Side: Live tracker status */}
            <div className="tracking-main">
              {/* ETA Banner */}
              <div className="eta-card card">
                <Clock className="eta-icon animate-float" size={32} />
                <div className="eta-info">
                  <span>Estimated Delivery Time</span>
                  {activeOrder.status === 'delivered' ? (
                    <h3>Your Food Has Arrived!</h3>
                  ) : (
                    <h3>{eta} - {eta + 10} Minutes</h3>
                  )}
                </div>
              </div>

              {/* Steps Progress */}
              <div className="status-stepper-card card">
                <div className="stepper-progress-bar">
                  <div className="stepper-progress-fill" style={{ height: `${progressWidth}%` }}></div>
                </div>

                <div className="stepper-steps">
                  {statuses.map((status, index) => {
                    const stepClass = getStepClass(status.key, index);
                    return (
                      <div className={`stepper-step ${stepClass}`} key={status.key}>
                        <div className="step-badge">
                          {stepClass === 'step-completed' ? <Check size={14} /> : <span>{index + 1}</span>}
                        </div>
                        <div className="step-text">
                          <h4>{status.label}</h4>
                          <p>{status.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Animated Map Tracker (Only show for delivery) */}
              {isDelivery && (
                <div className="live-map-card card">
                  <h3>Kigali Transit Route Map</h3>
                  <div className="map-canvas">
                    <svg viewBox="0 0 500 200" className="map-svg">
                      {/* Roads grid */}
                      <path d="M 20,40 L 480,40 M 20,100 L 480,100 M 20,160 L 480,160 M 100,10 L 100,190 M 250,10 L 250,190 M 400,10 L 400,190" stroke="#27272a" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
                      
                      {/* Delivery Path */}
                      <path 
                        d="M 100,40 L 250,40 L 250,100 L 400,100 L 400,160" 
                        fill="none" 
                        stroke="rgba(255, 69, 0, 0.15)" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                      />
                      
                      {/* Store Node (Kigali Center) */}
                      <g transform="translate(100,40)">
                        <circle r="8" fill="var(--secondary)" />
                        <text y="-14" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Store (Kigali)</text>
                      </g>
                      
                      {/* Home Node (Pinned Destination) */}
                      <g transform="translate(400,160)">
                        <circle r="8" fill="var(--accent-green)" />
                        <text y="20" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Delivery Pin</text>
                      </g>
                      
                      {/* Courier Motion path simulation */}
                      {activeOrder.status !== 'delivered' && (
                        <g className="courier-rider-element" style={{
                          transform: activeOrder.status === 'preparing' 
                            ? 'translate(100px, 40px)' 
                            : activeOrder.status === 'cooking'
                            ? 'translate(180px, 40px)'
                            : 'translate(310px, 100px)'
                        }}>
                          <circle r="12" fill="var(--primary)" className="courier-glow" />
                          <Bike size={14} className="rider-bike-icon" transform="scale(0.8) translate(-4, -4)" />
                        </g>
                      )}
                    </svg>
                    <div className="map-overlay-details">
                      <Bike size={16} className="color-primary animate-float" />
                      <span>
                        {activeOrder.status === 'preparing' && 'Kitchen processing your MoMo order'}
                        {activeOrder.status === 'cooking' && 'Food cooking. Rider prepping courier pack'}
                        {activeOrder.status === 'delivering' && 'Courier navigating Kigali streets to your pin'}
                        {activeOrder.status === 'delivered' && 'Courier arrived! Package delivered! Enjoy!'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Invoice Summary */}
            <div className="tracking-sidebar">
              <div className="receipt-card card">
                <div className="receipt-header">
                  <Receipt size={20} className="color-primary" />
                  <h3>Receipt Details</h3>
                </div>

                <div className="receipt-items">
                  {activeOrder.items.map(item => (
                    <div className="receipt-item-row" key={item.id}>
                      <span className="item-row-qty">{item.quantity}x</span>
                      <div className="item-row-info">
                        <span className="item-row-name">{item.name}</span>
                        {item.customizations.bun && (
                          <span className="item-row-cust">{item.customizations.bun}, {item.customizations.doneness}</span>
                        )}
                      </div>
                      <span className="item-row-price">{formatAmount(item.totalPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-totals-table">
                  <div className="totals-table-row">
                    <span>Subtotal</span>
                    <span>{formatAmount(activeOrder.subtotal)}</span>
                  </div>
                  <div className="totals-table-row">
                    <span>Sales Tax (8%)</span>
                    <span>{formatAmount(activeOrder.tax)}</span>
                  </div>
                  <div className="totals-table-row">
                    <span>Delivery Fee</span>
                    <span>{formatAmount(activeOrder.deliveryFee)}</span>
                  </div>
                  <div className="totals-table-divider"></div>
                  <div className="totals-table-row receipt-grand-total">
                    <span>Amount Paid ({currency})</span>
                    <span>{formatAmount(activeOrder.total)}</span>
                  </div>
                </div>

                <div className="receipt-delivery-info">
                  <div className="info-block">
                    <MapPin size={16} className="color-primary" />
                    <div>
                      <h5>Delivery Location</h5>
                      <p>Recipient: {activeOrder.details.name}</p>
                      <p>Address: {activeOrder.details.address}</p>
                      <p>City: {activeOrder.details.city}</p>
                      <p>Phone: {activeOrder.details.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
