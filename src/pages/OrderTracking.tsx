import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, MapPin, Receipt, Printer, Bike } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/pages/OrderTracking.css';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const OrderTracking: React.FC = () => {
  const { activeOrder, updateOrderStatus, clearActiveOrder } = useCart();
  const [eta, setEta] = useState(25); // initial ETA in minutes
  const [progressWidth, setProgressWidth] = useState(15);
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const EXCHANGE_RATE = 1300;
  const currency = activeOrder?.details.currency || 'RWF';

  // Helper: Format amount with RWF/USD conversions
  const formatAmount = (usdAmount: number) => {
    if (currency === 'RWF') {
      const rwfAmount = Math.round(usdAmount * EXCHANGE_RATE);
      return `${rwfAmount.toLocaleString()} RWF`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  // Sound synthesis player using Web Audio API
  const playStatusChime = (status: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      if (status === 'cooking') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (status === 'delivering') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (status === 'delivered') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  };

  // Welcome Messages Effect
  useEffect(() => {
    if (!activeOrder) return;
    const currentStatus = activeOrder.status;
    const chefName = activeOrder.assignedChefName || "Chef Aimable";
    const riderName = activeOrder.assignedRiderName || "Rider Jean-Paul";

    if (currentStatus === 'preparing' || currentStatus === 'cooking') {
      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          text: `👋 Hello! I am your kitchen chef, ${chefName}. We are preparing your fresh gourmet order now! Let me know if you need any adjustments.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (currentStatus === 'delivering') {
      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          text: `🚴 Hey! I am ${riderName}, your delivery rider. I have packed your order from the kitchen and I am heading over to your location.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (currentStatus === 'delivered') {
      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          text: `🍔 Enjoy your meal! Your order has been delivered by ${riderName}. Thank you for choosing BurgerHub!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeOrder?.status]);

  // Chat Submission Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const userText = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let replyText = "Received! Let me look into that for you.";
      const chefName = activeOrder?.assignedChefName || "Chef Aimable";
      const riderName = activeOrder?.assignedRiderName || "Rider Jean-Paul";
      const status = activeOrder?.status;

      if (status === 'preparing' || status === 'cooking') {
        if (userText.includes('onion') || userText.includes('napkin') || userText.includes('sauce') || userText.includes('extra')) {
          replyText = `👨‍🍳 [Chef ${chefName.split(' ')[1] || chefName}]: Noted! I'll update the kitchen ticket for your customizations.`;
        } else {
          replyText = `👨‍🍳 [Chef ${chefName.split(' ')[1] || chefName}]: Thank you! We are working hard to make this the best burger. It will be ready for transit shortly.`;
        }
      } else if (status === 'delivering') {
        if (userText.includes('where') || userText.includes('eta') || userText.includes('time')) {
          replyText = `🚴 [Rider ${riderName.split(' ')[1] || riderName}]: I'm navigating Nyarugenge streets right now, about 8 minutes away from your pinned coordinates!`;
        } else {
          replyText = `🚴 [Rider ${riderName.split(' ')[1] || riderName}]: Got it! I'm on my way to your exact map pin. See you soon!`;
        }
      } else if (status === 'delivered') {
        replyText = `🍔 [Rider ${riderName.split(' ')[1] || riderName}]: You're welcome! Please don't forget to rate your experience. Have a delicious day!`;
      }

      const agentMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-reply',
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
      
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, ctx.currentTime);
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        }
      } catch (err) {}
    }, 1200);
  };

  // Timer for status simulation
  useEffect(() => {
    if (!activeOrder) return;

    const timer = setTimeout(() => {
      if (activeOrder.status === 'preparing') {
        updateOrderStatus('cooking');
        playStatusChime('cooking');
        setProgressWidth(45);
        setEta(18);
      } else if (activeOrder.status === 'cooking') {
        updateOrderStatus('delivering');
        playStatusChime('delivering');
        setProgressWidth(75);
        setEta(10);
      } else if (activeOrder.status === 'delivering') {
        updateOrderStatus('delivered');
        playStatusChime('delivered');
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
  const riderX = activeOrder.details.riderX;
  const riderY = activeOrder.details.riderY;
  const hasLiveLocation = riderX !== undefined && riderY !== undefined;

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
                      
                      {/* GPS Target Crosshair for Live Location */}
                      {hasLiveLocation && activeOrder.status !== 'delivered' && (
                        <>
                          <line x1="0" y1={riderY} x2="500" y2={riderY} stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1={riderX} y1="0" x2={riderX} y2="200" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                        </>
                      )}

                      {/* Courier Motion path simulation */}
                      {activeOrder.status !== 'delivered' && (
                        <g className="courier-rider-element" style={{
                          transform: hasLiveLocation
                            ? `translate(${riderX}px, ${riderY}px)`
                            : activeOrder.status === 'preparing' 
                            ? 'translate(100px, 40px)' 
                            : activeOrder.status === 'cooking'
                            ? 'translate(180px, 40px)'
                            : 'translate(310px, 100px)'
                        }}>
                          <circle r="12" fill={hasLiveLocation ? "#3b82f6" : "var(--primary)"} className="courier-glow" style={{ filter: hasLiveLocation ? 'drop-shadow(0 0 10px #3b82f6)' : undefined }} />
                          {hasLiveLocation && (
                            <circle r="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="radar-ping-wave" />
                          )}
                          <Bike size={14} className="rider-bike-icon" transform="scale(0.8) translate(-4, -4)" />
                        </g>
                      )}
                    </svg>
                    {hasLiveLocation && activeOrder.status !== 'delivered' && (
                      <div className="live-tracking-active-banner">
                        <span className="live-tracking-beacon"></span>
                        <span>🛰️ Live Satellite Tracking Active: {activeOrder.assignedRiderName || 'Rider'} has pinned their live delivery location.</span>
                      </div>
                    )}
                    <div className="map-overlay-details">
                      <Bike size={16} className={hasLiveLocation ? "color-blue animate-float" : "color-primary animate-float"} style={{ color: hasLiveLocation ? '#3b82f6' : undefined }} />
                      <span>
                        {activeOrder.status === 'delivered'
                          ? 'Courier arrived! Package delivered! Enjoy!'
                          : hasLiveLocation
                          ? `Courier is actively navigating to your coordinates (GPS Pin: ${riderX}, ${riderY})`
                          : activeOrder.status === 'preparing'
                          ? 'Kitchen processing your MoMo order'
                          : activeOrder.status === 'cooking'
                          ? 'Food cooking. Rider prepping courier pack'
                          : 'Courier navigating Kigali streets to your pin'
                        }
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

              {/* Live Support Chat Card */}
              <div className="receipt-card card chat-support-card" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', height: '360px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px var(--accent-green)' }}></span>
                    <h3 style={{ fontSize: '14px', margin: 0, fontWeight: 700 }}>Live Order Support</h3>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online</span>
                </div>

                {/* Messages Box */}
                <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map(msg => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%',
                          background: isUser ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          padding: '10px 14px',
                          borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          fontSize: '12px',
                          lineHeight: '1.4',
                          border: isUser ? 'none' : '1px solid var(--border)',
                          textAlign: 'left'
                        }}>
                          <p style={{ margin: 0 }}>{msg.text}</p>
                          <span style={{ fontSize: '9px', color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '10px' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', color: '#fff', outline: 'none' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 15px', marginLeft: '8px', fontSize: '12px', borderRadius: 'var(--radius-md)' }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
