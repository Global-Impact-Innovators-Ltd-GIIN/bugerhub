import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, LogOut, Clock, Check, Eye, MapPin, Phone, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const RiderDashboard: React.FC = () => {
  const { orders, assignRiderToOrder, completeDeliveryOrder } = useCart();
  const navigate = useNavigate();
  const [rider, setRider] = useState<any>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mapProgress, setMapProgress] = useState(0);

  useEffect(() => {
    const session = localStorage.getItem('burgerhub_active_rider');
    if (!session) {
      navigate('/rider/login');
      return;
    }
    const riderObj = JSON.parse(session);

    // Refresh state from central riders collection to stay synced
    const syncRiderState = () => {
      const savedRiders = localStorage.getItem('burgerhub_riders');
      if (savedRiders) {
        const ridersList = JSON.parse(savedRiders);
        const currentRider = ridersList.find((r: any) => r.id === riderObj.id);
        if (currentRider) {
          setRider(currentRider);
        } else {
          setRider(riderObj);
        }
      } else {
        setRider(riderObj);
      }
    };

    syncRiderState();
    const interval = setInterval(syncRiderState, 3000);
    return () => clearInterval(interval);
  }, [navigate, orders]);

  // Kigali transit progress animation simulator for rider's view
  useEffect(() => {
    if (!rider || !rider.assignedOrderId) {
      setMapProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setMapProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 2;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rider]);

  const handleLogout = () => {
    localStorage.removeItem('burgerhub_active_rider');
    navigate('/rider/login');
  };

  const handleClaimDelivery = (orderId: string) => {
    if (!rider) return;
    if (rider.status === 'busy') {
      alert('You are currently on a delivery! Complete it first.');
      return;
    }
    assignRiderToOrder(orderId, rider.id, rider.name);
    setMapProgress(0);
  };

  const handleCompleteDelivery = (orderId: string) => {
    if (!rider) return;
    completeDeliveryOrder(orderId, rider.id);
    setMapProgress(0);
    alert('Delivery completed successfully! Great job.');
  };

  if (!rider) return null;

  // Available deliveries: status is 'delivering' and no rider is assigned yet
  const availableQueue = orders.filter(o => o.status === 'delivering' && !o.assignedRiderId);
  const myCurrentOrder = orders.find(o => o.id === rider.assignedOrderId);
  const myHistory = orders.filter(o => o.assignedRiderId === rider.id && o.status === 'delivered');

  return (
    <div className="admin-dashboard-page staff-dashboard-page rider-dashboard animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="admin-header-bar staff-header-bar">
        <div className="container header-flex-row">
          <div className="admin-branding">
            <span className="admin-badge rider-badge"><Bike size={14} /> Rider Fleet Portal</span>
            <h2>Welcome Back, <span className="text-gradient-orange">{rider.name}</span></h2>
          </div>
          <div className="staff-actions-bar">
            <span className={`staff-status-indicator ${rider.status}`}>
              {rider.status === 'idle' ? '🟢 FLEET IDLE' : '🚴 DELIVERING'}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary logout-btn">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container main-admin-container mt-5">
        <div className="staff-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* Active Rider Courier Panel */}
          <div className="staff-main-panel">
            <h3 className="section-title text-gradient mb-4">Active Delivery Route</h3>

            {myCurrentOrder ? (
              <div className="card active-assignment-card" style={{ padding: '30px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span className="text-xs text-muted">ORDER ID</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{myCurrentOrder.id}</h2>
                    <p className="text-sm text-secondary mt-1">Status: Transit to Pinned Address</p>
                  </div>
                  
                  <div style={{ background: 'rgba(255, 69, 0, 0.1)', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-xs text-muted block text-right">Payment</span>
                    <strong style={{ color: 'var(--secondary)', display: 'block', textAlign: 'right' }}>
                      {myCurrentOrder.details.currency === 'RWF' 
                        ? `${Math.round(myCurrentOrder.total * 1300).toLocaleString()} RWF`
                        : `$${myCurrentOrder.total.toFixed(2)}`
                      } ({myCurrentOrder.details.paymentMethod.toUpperCase()})
                    </strong>
                  </div>
                </div>

                {/* Recipient Coordinates Card */}
                <div className="recipient-details-box mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <h5 className="text-xs text-muted mb-2 font-semibold" style={{ letterSpacing: '1px' }}>RECIPIENT CONTACT</h5>
                    <strong style={{ fontSize: '16px', display: 'block', color: 'var(--text-primary)' }}>{myCurrentOrder.details.name}</strong>
                    <a href={`tel:${myCurrentOrder.details.phone}`} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', textDecoration: 'none', fontWeight: 600 }}>
                      <Phone size={14} /> {myCurrentOrder.details.phone}
                    </a>
                  </div>
                  <div>
                    <h5 className="text-xs text-muted mb-2 font-semibold" style={{ letterSpacing: '1px' }}>DELIVERY PIN ADDRESS</h5>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                      <MapPin size={16} className="color-primary mt-1" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{myCurrentOrder.details.address}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Transit Map */}
                <div className="rider-transit-map mt-4">
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} className="color-primary" />
                    Kigali Route Progress ({mapProgress}%)
                  </h4>

                  <div className="transit-map-canvas-container card" style={{ height: '200px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <svg viewBox="0 0 500 200" className="map-svg">
                      {/* Roads grid */}
                      <path d="M 20,40 L 480,40 M 20,100 L 480,100 M 20,160 L 480,160 M 100,10 L 100,190 M 250,10 L 250,190 M 400,10 L 400,190" stroke="#27272a" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
                      
                      {/* Path */}
                      <path 
                        d="M 100,40 L 250,40 L 250,100 L 400,100 L 400,160" 
                        fill="none" 
                        stroke="rgba(255, 69, 0, 0.15)" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                      />
                      
                      {/* Store */}
                      <g transform="translate(100,40)">
                        <circle r="8" fill="var(--secondary)" />
                        <text y="-14" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Store (Kigali)</text>
                      </g>
                      
                      {/* Destination */}
                      <g transform="translate(400,160)">
                        <circle r="8" fill="var(--accent-green)" />
                        <text y="20" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Recipient Pin</text>
                      </g>
                      
                      {/* Rider Dot */}
                      <g style={{
                        transform: mapProgress < 33 
                          ? `translate(${100 + (mapProgress / 33) * 150}px, 40px)` 
                          : mapProgress < 66
                          ? `translate(250px, ${40 + ((mapProgress - 33) / 33) * 60}px)`
                          : `translate(${250 + ((mapProgress - 66) / 34) * 150}px, ${100 + ((mapProgress - 66) / 34) * 60}px)`
                      }}>
                        <circle r="12" fill="var(--primary)" className="courier-glow" />
                        <Bike size={14} className="rider-bike-icon" transform="scale(0.8) translate(-4, -4)" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Items List */}
                <div className="order-items-summary-rider mt-4 border-t pt-4">
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Delivery Items Checklist</h4>
                  <p className="text-sm text-secondary">
                    {myCurrentOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>

                <div className="active-card-actions mt-5 border-t pt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-muted flex items-center gap-2">
                    Verify client receipt signatures on momo/cash.
                  </span>
                  
                  <button 
                    onClick={() => handleCompleteDelivery(myCurrentOrder.id)}
                    className="btn btn-primary delivered-btn"
                    style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#fff', fontSize: '15px', padding: '12px 24px' }}
                  >
                    <Check size={18} /> Mark Order Delivered
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-column-placeholder card" style={{ padding: '60px 20px' }}>
                <Bike size={48} className="muted-icon animate-float" />
                <h3>No Active Assignment</h3>
                <p>Claim an available delivery from the queue on the right to start transit.</p>
              </div>
            )}

            {/* Rider Delivery Logs */}
            <div className="kitchen-history-section mt-5">
              <h4 className="section-title text-sm mb-3">Your Completed Deliveries ({myHistory.length})</h4>
              
              {myHistory.length === 0 ? (
                <p className="text-sm text-muted">No completed deliveries on file.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myHistory.map(order => (
                    <div 
                      key={order.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--border)', 
                        padding: '14px 20px', 
                        borderRadius: 'var(--radius-md)' 
                      }}
                    >
                      <div>
                        <strong>{order.id}</strong>
                        <span className="text-xs text-muted block mt-1">{order.details.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="text-xs text-muted">{order.date.split(',')[1]?.trim()}</span>
                        <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          DELIVERED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Available Deliveries Queue Column */}
          <div className="staff-side-panel">
            <h3 className="section-title text-gradient mb-4">Available Deliveries ({availableQueue.length})</h3>

            <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {availableQueue.length === 0 ? (
                <div className="empty-column-placeholder card" style={{ padding: '30px 20px' }}>
                  <AlertCircle size={32} className="muted-icon" />
                  <h4>Queue Empty</h4>
                  <p>All cooked orders have been claimed by couriers.</p>
                </div>
              ) : (
                availableQueue.map(order => (
                  <div key={order.id} className="card queue-order-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="font-bold text-gradient-orange">{order.id}</span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock size={12} /> {order.date.split(',')[1]?.trim() || 'Just now'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <span className="text-xs text-muted block">Client Destination:</span>
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-secondary)' }} className="text-truncate">
                        {order.details.address}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-secondary text-xs"
                        style={{ padding: '8px 12px', flexGrow: 1 }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <button 
                        onClick={() => handleClaimDelivery(order.id)}
                        className="btn btn-primary text-xs"
                        style={{ padding: '8px 12px', flexGrow: 1 }}
                        disabled={rider.status === 'busy'}
                      >
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-container card animate-admin-modal-enter" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-b pb-3 mb-3">
              <div>
                <span className="text-xs text-muted">Order ID: {selectedOrder.id}</span>
                <h3>Delivery Specifications</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="details-section-box">
                <h4>Customer Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', fontSize: '14px' }}>
                  <p><strong>Name:</strong> {selectedOrder.details.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.details.phone}</p>
                  <p><strong>Method:</strong> {selectedOrder.details.deliveryMethod.toUpperCase()}</p>
                  <p><strong>Address Pinned:</strong> {selectedOrder.details.address}</p>
                  <p><strong>Payment Mode:</strong> {selectedOrder.details.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              <div className="details-section-box mt-4">
                <h4>Items to Deliver</h4>
                <div className="admin-order-items-list mt-2">
                  {selectedOrder.items.map(item => (
                    <div className="admin-order-item-card" key={item.id}>
                      <img src={item.image} alt={item.name} className="admin-order-item-img" style={{ width: '48px', height: '48px' }} />
                      <div className="admin-order-item-desc" style={{ flexGrow: 1 }}>
                        <h5 style={{ fontSize: '15px' }}>{item.quantity}x {item.name}</h5>
                        {item.customizations.notes && (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px' }}>"{item.customizations.notes}"</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer border-t pt-3 mt-3">
              <button className="btn btn-secondary w-full" onClick={() => setSelectedOrder(null)}>
                Close Specifications
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
