import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, LogOut, Clock, Check, Eye, MapPin, Phone, 
  AlertCircle, X, BarChart3, TrendingUp, Zap, Radio, BellRing
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import { fetchRiders, saveOrder, saveRiders } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const RiderDashboard: React.FC = () => {
  const { orders, assignRiderToOrder, completeDeliveryOrder } = useCart();
  const navigate = useNavigate();
  const [rider, setRider] = useState<any>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mapProgress, setMapProgress] = useState(0);
  const [localRiderPos, setLocalRiderPos] = useState<{ x: number; y: number } | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'transit' | 'queue' | 'history' | 'earnings'>('transit');

  // Diagnostic states
  const [emergencySOS, setEmergencySOS] = useState(false);

  const availableQueue = orders.filter(o => o.status === 'delivering' && !o.assignedRiderId);
  const myCurrentOrder = orders.find(o => o.id === rider?.assignedOrderId);
  const myHistory = orders.filter(o => o.assignedRiderId === rider?.id && o.status === 'delivered');

  useEffect(() => {
    if (myCurrentOrder) {
      setLocalRiderPos({
        x: myCurrentOrder.details.riderX ?? 100,
        y: myCurrentOrder.details.riderY ?? 40
      });
    } else {
      setLocalRiderPos(null);
    }
  }, [myCurrentOrder?.id, myCurrentOrder?.details.riderX, myCurrentOrder?.details.riderY]);

  useEffect(() => {
    const session = sessionStorage.getItem('burgerhub_active_rider') || localStorage.getItem('burgerhub_active_rider');
    if (!session) {
      navigate('/login');
      return;
    }
    const riderObj = JSON.parse(session);

    // Refresh state from central riders collection to stay synced
    const syncRiderState = async () => {
      const ridersList = await fetchRiders();
      const currentRider = ridersList.find((r: any) => r.id === riderObj.id);
      if (currentRider) {
        setRider(currentRider);
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
    sessionStorage.removeItem('burgerhub_active_rider');
    localStorage.removeItem('burgerhub_active_rider');
    navigate('/login');
  };

  const handleToggleStatus = async () => {
    if (!rider) return;
    const newStatus = rider.status === 'idle' ? 'busy' : 'idle';
    const updatedRider = { ...rider, status: newStatus };
    setRider(updatedRider);
    
    try {
      const currentRiders = await fetchRiders();
      const updatedRiders = currentRiders.map(r => r.id === rider.id ? updatedRider : r);
      await saveRiders(updatedRiders);
      
      // Sound feedback
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(newStatus === 'idle' ? 587.33 : 440.00, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch (err) {}
    } catch (err) {
      console.error('Failed to toggle rider status:', err);
    }
  };

  const handleClaimDelivery = (orderId: string) => {
    if (!rider) return;
    if (rider.status === 'busy') {
      alert('You are currently on a delivery! Complete it first.');
      return;
    }
    assignRiderToOrder(orderId, rider.id, rider.name);
    setMapProgress(0);
    setActiveTab('transit'); // Switch to active route
  };

  const handleCompleteDelivery = (orderId: string) => {
    if (!rider) return;
    completeDeliveryOrder(orderId, rider.id);
    setMapProgress(0);
    setLocalRiderPos(null);
    alert('Delivery completed successfully! Great job.');
  };

  const handleMapClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    if (!myCurrentOrder) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 500);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 200);

    setLocalRiderPos({ x, y });

    const updatedOrder = {
      ...myCurrentOrder,
      details: {
        ...myCurrentOrder.details,
        riderX: x,
        riderY: y
      }
    };

    try {
      await saveOrder(updatedOrder);
      
      // Play a synthesized success audio feedback chime
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch (err) {}
    } catch (err) {
      console.error('Failed to pin location:', err);
    }
  };

  if (!rider) return null;

  // Earnings calculations
  const baseEarnings = myHistory.length * 1500; // 1500 RWF per order
  const mockTips = myHistory.length * 800; // 800 RWF tip average
  const totalRiderEarnings = baseEarnings + mockTips;
  const mockDistanceKm = (myHistory.length * 3.8).toFixed(1);

  return (
    <div className="admin-dashboard-layout animate-fade-in">
      
      {/* Fixed Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo" style={{ background: '#3b82f6' }}>R</div>
          <span className="admin-sidebar-brand-text">COURIER<span className="color-orange">FLEET</span></span>
        </div>

        <div className="admin-sidebar-user" style={{ borderLeft: '3px solid #3b82f6' }}>
          <div className="admin-sidebar-avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            {rider.name.charAt(0).toUpperCase()}
          </div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{rider.name}</span>
            <span className="admin-sidebar-user-role">Courier Fleet Rider</span>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <button 
            className={`admin-sidebar-item ${activeTab === 'transit' ? 'active' : ''}`}
            onClick={() => setActiveTab('transit')}
            style={{ 
              color: activeTab === 'transit' ? '#3b82f6' : 'var(--text-secondary)',
              background: activeTab === 'transit' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'transit' ? '#3b82f6' : 'transparent'
            }}
          >
            <MapPin size={16} /> Active Route
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
            style={{ 
              color: activeTab === 'queue' ? '#3b82f6' : 'var(--text-secondary)',
              background: activeTab === 'queue' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'queue' ? '#3b82f6' : 'transparent'
            }}
          >
            <Bike size={16} /> Available Jobs ({availableQueue.length})
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ 
              color: activeTab === 'history' ? '#3b82f6' : 'var(--text-secondary)',
              background: activeTab === 'history' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'history' ? '#3b82f6' : 'transparent'
            }}
          >
            <Clock size={16} /> Completed Logs ({myHistory.length})
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
            style={{ 
              color: activeTab === 'earnings' ? '#3b82f6' : 'var(--text-secondary)',
              background: activeTab === 'earnings' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'earnings' ? '#3b82f6' : 'transparent'
            }}
          >
            <BarChart3 size={16} /> Fleet Analytics
          </button>
        </nav>

        {/* Live Status Switcher in Sidebar Footer */}
        <div style={{ padding: '15px 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>TOGGLE FLEET STATUS</span>
          <button 
            onClick={handleToggleStatus} 
            className={`btn w-full ${rider.status === 'idle' ? 'btn-secondary' : 'btn-primary'}`}
            style={{ 
              padding: '10px', 
              fontSize: '12px', 
              fontWeight: 700, 
              background: rider.status === 'idle' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: rider.status === 'idle' ? 'var(--accent-green)' : '#3b82f6',
              borderColor: rider.status === 'idle' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'
            }}
          >
            {rider.status === 'idle' ? '🟢 COURIER IDLE' : '🚴 FLEET ON DUTY'}
          </button>
        </div>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-sidebar-logout-btn">
            <LogOut size={16} /> Logout Fleet
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        
        {/* Tab 1: Active Route Map */}
        {activeTab === 'transit' && (
          <div className="transit-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Active Delivery Route</h3>

            {myCurrentOrder ? (
              <div className="card active-assignment-card" style={{ padding: '30px', borderLeft: '4px solid #3b82f6', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span className="text-xs text-muted">ACTIVE DELIVERY ID</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace' }}>{myCurrentOrder.id}</h2>
                    <p className="text-sm text-secondary mt-1">Status: Transit to Client Pin Address</p>
                  </div>
                  
                  <div style={{ background: 'rgba(255, 69, 0, 0.08)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,69,0,0.15)' }}>
                    <span className="text-xs text-muted block text-right">Order Payout</span>
                    <strong style={{ color: 'var(--secondary)', display: 'block', textAlign: 'right', fontSize: '16px' }}>
                      {myCurrentOrder.details.currency === 'USD' 
                        ? `$${myCurrentOrder.total.toFixed(2)}`
                        : `${Math.round(myCurrentOrder.total * 1300).toLocaleString()} RWF`
                      } ({myCurrentOrder.details.paymentMethod.toUpperCase()})
                    </strong>
                  </div>
                </div>

                {/* Contact grid */}
                <div className="recipient-details-box mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <h5 className="text-xs text-muted mb-2 font-semibold" style={{ letterSpacing: '1px' }}>RECIPIENT CONTACT</h5>
                    <strong style={{ fontSize: '16px', display: 'block', color: 'var(--text-primary)' }}>{myCurrentOrder.details.name}</strong>
                    <a href={`tel:${myCurrentOrder.details.phone}`} style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', textDecoration: 'none', fontWeight: 700 }}>
                      <Phone size={14} /> {myCurrentOrder.details.phone}
                    </a>
                  </div>
                  <div>
                    <h5 className="text-xs text-muted mb-2 font-semibold" style={{ letterSpacing: '1px' }}>DELIVERY PIN ADDRESS</h5>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                      <MapPin size={16} className="color-primary mt-1" style={{ flexShrink: 0, color: '#3b82f6' }} />
                      <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{myCurrentOrder.details.address}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Transit Map */}
                <div className="rider-transit-map mt-4">
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} style={{ color: '#3b82f6' }} />
                    GPS Live Tracking Sync {localRiderPos ? `(Coordinates Pinned)` : `(${mapProgress}%)`}
                  </h4>
                  <p className="text-xs text-muted mb-3">📍 Tap Metropolitan Grid to Pin GPS: Click anywhere on the map paths to update the customer's live tracking screen in real time.</p>

                  <div className="transit-map-canvas-container card" style={{ height: '200px', background: '#09090b', border: '1px solid var(--border)' }}>
                    <svg viewBox="0 0 500 200" className="map-svg" onClick={handleMapClick} style={{ cursor: 'crosshair' }}>
                      {/* Roads grid */}
                      <path d="M 20,40 L 480,40 M 20,100 L 480,100 M 20,160 L 480,160 M 100,10 L 100,190 M 250,10 L 250,190 M 400,10 L 400,190" stroke="#27272a" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
                      
                      {/* Path */}
                      <path 
                        d="M 100,40 L 250,40 L 250,100 L 400,100 L 400,160" 
                        fill="none" 
                        stroke="rgba(59, 130, 246, 0.15)" 
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

                      {/* GPS Target Crosshair */}
                      {localRiderPos && (
                        <>
                          <line x1="0" y1={localRiderPos.y} x2="500" y2={localRiderPos.y} stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1={localRiderPos.x} y1="0" x2={localRiderPos.x} y2="200" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                        </>
                      )}
                      
                      {/* Rider Dot */}
                      <g style={{
                        transform: localRiderPos
                          ? `translate(${localRiderPos.x}px, ${localRiderPos.y}px)`
                          : mapProgress < 33 
                          ? `translate(${100 + (mapProgress / 33) * 150}px, 40px)` 
                          : mapProgress < 66
                          ? `translate(250px, ${40 + ((mapProgress - 33) / 33) * 60}px)`
                          : `translate(${250 + ((mapProgress - 66) / 34) * 150}px, ${100 + ((mapProgress - 66) / 34) * 60}px)`
                      }}>
                        <circle r="12" fill="#3b82f6" className="courier-glow" style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }} />
                        <Bike size={14} className="rider-bike-icon" transform="scale(0.8) translate(-4, -4)" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="order-items-summary-rider mt-4 border-t pt-4">
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Delivery Items Checklist</h4>
                  <p className="text-sm text-secondary">
                    {myCurrentOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>

                <div className="active-card-actions mt-5 border-t pt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-muted">Verify payment completion on MoMo/Cash before mark delivered.</span>
                  
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
              <div className="empty-column-placeholder card" style={{ padding: '80px 20px', background: 'var(--bg-card)' }}>
                <Bike size={48} className="muted-icon animate-float" style={{ color: '#3b82f6', opacity: 0.3 }} />
                <h3 className="mt-3" style={{ fontSize: '18px', fontWeight: 700 }}>No Active Delivery Assignment</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Accept an available job dispatch from the waitlist to start your transit navigation.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Available Jobs Waitlist */}
        {activeTab === 'queue' && (
          <div className="queue-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Available Delivery Jobs ({availableQueue.length})</h3>

            {availableQueue.length === 0 ? (
              <div className="empty-column-placeholder card" style={{ padding: '80px 20px', background: 'var(--bg-card)' }}>
                <AlertCircle size={48} className="muted-icon animate-pulse" />
                <h3 className="mt-3" style={{ fontSize: '18px', fontWeight: 700 }}>Waitlist is Empty</h3>
                <p style={{ color: 'var(--text-secondary)' }}>All cooked orders have been dispatched and claimed by other fleet riders.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {availableQueue.map(order => (
                  <div key={order.id} className="card queue-order-card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                      <span className="font-bold text-gradient-orange" style={{ fontFamily: 'monospace' }}>{order.id}</span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock size={12} /> {order.date.split(',')[1]?.trim() || 'Just now'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <span className="text-xs text-muted block mb-1">Destination:</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        {order.details.address}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-secondary text-xs"
                        style={{ padding: '10px', flexGrow: 1 }}
                      >
                        <Eye size={14} /> Spec Specs
                      </button>
                      <button 
                        onClick={() => handleClaimDelivery(order.id)}
                        className="btn btn-primary text-xs"
                        style={{ padding: '10px', flexGrow: 1, background: '#3b82f6', borderColor: '#3b82f6' }}
                        disabled={rider.status === 'busy'}
                      >
                        Claim Transit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed Delivery Logs */}
        {activeTab === 'history' && (
          <div className="history-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Completed Delivery Logs ({myHistory.length})</h3>

            {myHistory.length === 0 ? (
              <p className="text-sm text-muted">No completed deliveries on file yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myHistory.map(order => (
                  <div 
                    key={order.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border)', 
                      padding: '16px 24px', 
                      borderRadius: 'var(--radius-md)' 
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '15px', fontFamily: 'monospace' }}>{order.id}</strong>
                      <span className="text-xs text-muted block mt-1">{order.details.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <span className="text-xs text-muted">{order.date.split(',')[1]?.trim() || order.date}</span>
                      <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)', padding: '5px 10px', borderRadius: '6px', fontWeight: 700 }}>
                        DELIVERED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Rider Telemetry & Insights */}
        {activeTab === 'earnings' && (
          <div className="insights-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Fleet Rider Telemetry & Performance</h3>
            
            {/* Micro-Metrics Cards */}
            <div className="admin-stats-grid mb-5">
              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <TrendingUp size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Completed Today</span>
                  <h3>{myHistory.length} Trips</h3>
                  <p className="stat-subtitle">100% on-time dispatch</p>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(255, 135, 0, 0.1)', color: 'var(--secondary)' }}>
                  <TrendingUp size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Today's Payout</span>
                  <h3>{totalRiderEarnings.toLocaleString()} RWF</h3>
                  <p className="stat-subtitle">{mockTips.toLocaleString()} RWF tip share included</p>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)' }}>
                  <Bike size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Fleet Distance</span>
                  <h3>{mockDistanceKm} km</h3>
                  <p className="stat-subtitle">Consolidated tracking metrics</p>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)' }}>
                  <Zap size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Rider Status</span>
                  <h3>{rider.status.toUpperCase()}</h3>
                  <p className="stat-subtitle">Syncing with Kigali radar</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              {/* Deliveries chart */}
              <div className="card" style={{ padding: '24px' }}>
                <div className="card-header mb-3">
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Weekly Delivery Load (Trips Completed)</h4>
                  <span className="text-xs text-muted">Performance statistics over the past 7 days</span>
                </div>
                
                <div className="chart-container" style={{ position: 'relative' }}>
                  <svg className="line-chart-svg" viewBox="0 0 500 200" style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="riderChartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    
                    <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <line x1="40" y1="20" x2="40" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                    {/* Weekly bar blocks */}
                    {[
                      { day: 'Mon', val: 5, x: 70 },
                      { day: 'Tue', val: 8, x: 130 },
                      { day: 'Wed', val: 6, x: 190 },
                      { day: 'Thu', val: 11, x: 250 },
                      { day: 'Fri', val: 14, x: 310 },
                      { day: 'Sat', val: 18, x: 370 },
                      { day: 'Sun', val: 12, x: 430 }
                    ].map(bar => {
                      const barHeight = (bar.val / 20) * 140;
                      return (
                        <g key={bar.day}>
                          <rect 
                            x={bar.x - 12} 
                            y={170 - barHeight} 
                            width="24" 
                            height={barHeight} 
                            fill="rgba(59, 130, 246, 0.45)" 
                            rx="4" 
                            style={{ transition: 'all 0.3s' }}
                          />
                          <rect 
                            x={bar.x - 12} 
                            y={170 - barHeight} 
                            width="24" 
                            height="4" 
                            fill="#3b82f6" 
                            rx="2"
                          />
                          <text x={bar.x} y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{bar.day}</text>
                          <text x={bar.x} y={160 - barHeight} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">{bar.val}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Courier Vehicle Diagnostics */}
              <div className="card" style={{ padding: '24px' }}>
                <div className="card-header mb-4">
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>E-Bike Diagnostic HUD</h4>
                  <span className="text-xs text-muted">Realtime smart vehicle telematics status</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={16} className="color-primary" style={{ color: 'var(--accent-green)' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px' }}>E-Bike Battery Charge</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status: Discharging slowly</span>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--accent-green)' }}>82% Capacity</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Radio size={16} style={{ color: '#3b82f6' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px' }}>Smart Helmet Bluetooth</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status: Active call link</span>
                      </div>
                    </div>
                    <strong style={{ color: '#3b82f6' }}>Connected</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BellRing size={16} style={{ color: 'var(--accent-red)' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px' }}>Emergency Dispatcher (SOS)</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status: Standby telemetry</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setEmergencySOS(!emergencySOS);
                        alert(`SOS Rescue Alert ${!emergencySOS ? 'BROADCASTING to Central Command Hub!' : 'CANCELLED'}`);
                      }}
                      className={`btn text-xs ${emergencySOS ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', background: emergencySOS ? 'var(--accent-red)' : 'transparent', color: emergencySOS ? '#fff' : 'var(--accent-red)', borderColor: 'rgba(234, 56, 56, 0.4)' }}
                    >
                      {emergencySOS ? '⚠️ SOS SIGNAL ON' : 'TEST SOS'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Details Specifications Modal */}
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
