import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, LogOut, Clock, Check, Eye, ClipboardList, 
  AlertCircle, X, BarChart3, TrendingUp, Sparkles, Thermometer
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import { fetchChefs, saveChefs } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const ChefDashboard: React.FC = () => {
  const { orders, assignChefToOrder, completeCookingOrder } = useCart();
  const navigate = useNavigate();
  const [chef, setChef] = useState<any>(null);
  
  // Local item check-offs for active cooking session
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'prep' | 'queue' | 'history' | 'insights'>('prep');

  // Kitchen Mock Stock Levels
  const stockLevels = [
    { name: 'Gourmet Burger Buns', value: 85, color: 'var(--primary)' },
    { name: 'Angus Beef Patties', value: 68, color: 'var(--secondary)' },
    { name: 'Fresh Crispy Lettuce', value: 92, color: 'var(--accent-green)' },
    { name: 'BurgerHub Secret Sauce', value: 35, color: '#f59e0b', pulse: true }, // Low stock alert
    { name: 'Cheddar Cheese Slices', value: 74, color: 'var(--accent-blue)' }
  ];

  useEffect(() => {
    const session = sessionStorage.getItem('burgerhub_active_chef') || localStorage.getItem('burgerhub_active_chef');
    if (!session) {
      navigate('/login');
      return;
    }
    const chefObj = JSON.parse(session);

    // Refresh state from central chefs collection to stay synced
    const syncChefState = async () => {
      const chefsList = await fetchChefs();
      const currentChef = chefsList.find((c: any) => c.id === chefObj.id);
      if (currentChef) {
        setChef(currentChef);
      } else {
        setChef(chefObj);
      }
    };

    syncChefState();
    // Setup interval to keep kitchen queue refreshed
    const interval = setInterval(syncChefState, 3000);
    return () => clearInterval(interval);
  }, [navigate, orders]);

  const handleLogout = () => {
    sessionStorage.removeItem('burgerhub_active_chef');
    localStorage.removeItem('burgerhub_active_chef');
    navigate('/login');
  };

  const handleToggleStatus = async () => {
    if (!chef) return;
    const newStatus = chef.status === 'idle' ? 'busy' : 'idle';
    const updatedChef = { ...chef, status: newStatus };
    setChef(updatedChef);
    
    try {
      const currentChefs = await fetchChefs();
      const updatedChefs = currentChefs.map(c => c.id === chef.id ? updatedChef : c);
      await saveChefs(updatedChefs);
      
      // Play brief status change sound
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(newStatus === 'idle' ? 523.25 : 392.00, ctx.currentTime); // C5 or G4
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch (err) {}
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleStartCooking = (orderId: string) => {
    if (!chef) return;
    if (chef.status === 'busy') {
      alert('You are already preparing an order! Finish it first.');
      return;
    }
    assignChefToOrder(orderId, chef.id, chef.name);
    setCheckedItems({});
    setActiveTab('prep'); // Focus on counter
  };

  const handleFinishCooking = (orderId: string) => {
    if (!chef) return;
    completeCookingOrder(orderId, chef.id);
    setCheckedItems({});
  };

  const toggleItemCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (!chef) return null;

  // Filter orders
  const activeQueue = orders.filter(o => o.status === 'preparing');
  const myCurrentOrder = orders.find(o => o.id === chef.assignedOrderId);
  
  // History of orders prepared by me
  const myHistory = orders.filter(o => o.assignedChefId === chef.id && o.status !== 'preparing' && o.status !== 'cooking');

  return (
    <div className="admin-dashboard-layout animate-fade-in">
      
      {/* Fixed Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo" style={{ background: 'var(--secondary)' }}>C</div>
          <span className="admin-sidebar-brand-text">KITCHEN<span className="color-orange">PORTAL</span></span>
        </div>

        <div className="admin-sidebar-user" style={{ borderLeft: '3px solid var(--secondary)' }}>
          <div className="admin-sidebar-avatar" style={{ background: 'rgba(255, 135, 0, 0.1)', color: 'var(--secondary)' }}>
            {chef.name.charAt(0).toUpperCase()}
          </div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{chef.name}</span>
            <span className="admin-sidebar-user-role">Head Kitchen Chef</span>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <button 
            className={`admin-sidebar-item ${activeTab === 'prep' ? 'active' : ''}`}
            onClick={() => setActiveTab('prep')}
            style={{ 
              color: activeTab === 'prep' ? 'var(--secondary)' : 'var(--text-secondary)',
              background: activeTab === 'prep' ? 'rgba(255, 135, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'prep' ? 'var(--secondary)' : 'transparent'
            }}
          >
            <ChefHat size={16} /> Active Counter
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
            style={{ 
              color: activeTab === 'queue' ? 'var(--secondary)' : 'var(--text-secondary)',
              background: activeTab === 'queue' ? 'rgba(255, 135, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'queue' ? 'var(--secondary)' : 'transparent'
            }}
          >
            <ClipboardList size={16} /> Kitchen Queue ({activeQueue.length})
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ 
              color: activeTab === 'history' ? 'var(--secondary)' : 'var(--text-secondary)',
              background: activeTab === 'history' ? 'rgba(255, 135, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'history' ? 'var(--secondary)' : 'transparent'
            }}
          >
            <Clock size={16} /> Prepared History ({myHistory.length})
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            style={{ 
              color: activeTab === 'insights' ? 'var(--secondary)' : 'var(--text-secondary)',
              background: activeTab === 'insights' ? 'rgba(255, 135, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'insights' ? 'var(--secondary)' : 'transparent'
            }}
          >
            <BarChart3 size={16} /> Kitchen Insights
          </button>
        </nav>

        {/* Live Status Switcher in Sidebar Footer */}
        <div style={{ padding: '15px 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>TOGGLE AVAILABILITY</span>
          <button 
            onClick={handleToggleStatus} 
            className={`btn w-full ${chef.status === 'idle' ? 'btn-secondary' : 'btn-primary'}`}
            style={{ 
              padding: '10px', 
              fontSize: '12px', 
              fontWeight: 700, 
              background: chef.status === 'idle' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 135, 0, 0.15)',
              color: chef.status === 'idle' ? 'var(--accent-green)' : 'var(--secondary)',
              borderColor: chef.status === 'idle' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 135, 0, 0.3)'
            }}
          >
            {chef.status === 'idle' ? '🟢 KITCHEN IDLE' : '🔥 BUSY COOKING'}
          </button>
        </div>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-sidebar-logout-btn">
            <LogOut size={16} /> Logout Station
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main-content">
        
        {/* Tab 1: Active Prep Counter */}
        {activeTab === 'prep' && (
          <div className="active-prep-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Active Preparation Counter</h3>
            
            {myCurrentOrder ? (
              <div className="card active-assignment-card" style={{ padding: '30px', borderLeft: '4px solid var(--secondary)', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span className="text-xs text-muted">ACTIVE ASSIGNMENT ORDER ID</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.5px' }}>{myCurrentOrder.id}</h2>
                    <p className="text-sm text-secondary mt-1">Placed: {myCurrentOrder.date}</p>
                  </div>
                  <div style={{ background: 'rgba(255, 135, 0, 0.08)', padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'right', border: '1px solid rgba(255,135,0,0.15)' }}>
                    <span className="text-xs text-muted block">Recipient Name</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '15px' }}>{myCurrentOrder.details.name}</strong>
                  </div>
                </div>

                <div className="active-order-checklist mt-4">
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={18} className="color-orange" />
                    Specifications Checklist (Double Tap to check off ingredients)
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {myCurrentOrder.items.map(item => {
                      const isChecked = !!checkedItems[item.id];
                      return (
                        <div 
                          key={item.id}
                          onClick={() => toggleItemCheck(item.id)}
                          className={`checklist-item-row ${isChecked ? 'checked' : ''}`}
                          style={{
                            display: 'flex',
                            gap: '15px',
                            background: isChecked ? 'rgba(34, 197, 94, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                            border: isChecked ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid var(--border)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: isChecked ? 'none' : '2px solid var(--border-focus)',
                            background: isChecked ? 'var(--accent-green)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isChecked && <Check size={14} color="#fff" />}
                          </div>
                          
                          <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                          
                          <div style={{ flexGrow: 1 }}>
                            <strong style={{ fontSize: '16px', color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                              {item.quantity}x {item.name}
                            </strong>
                            
                            {/* Modifications list */}
                            {(item.customizations.bun || item.customizations.doneness || item.customizations.extras.length > 0 || item.customizations.sauces.length > 0 || item.customizations.notes) && (
                              <div className="customizations-mini-tags mt-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {item.customizations.bun && <span className="tag-micro">Bun: {item.customizations.bun}</span>}
                                {item.customizations.doneness && <span className="tag-micro">Meat: {item.customizations.doneness}</span>}
                                {item.customizations.extras.map(e => <span key={e.name} className="tag-micro extra">Add: {e.name}</span>)}
                                {item.customizations.sauces.map(s => <span key={s} className="tag-micro sauce">Sauce: {s}</span>)}
                                {item.customizations.notes && <span className="tag-micro notes">"{item.customizations.notes}"</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="active-card-actions mt-5 border-t pt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-muted flex items-center gap-2">
                    <Clock size={14} /> Review customizations thoroughly before serving.
                  </span>
                  
                  <button 
                    onClick={() => handleFinishCooking(myCurrentOrder.id)}
                    className="btn btn-primary ready-btn-kitchen"
                    style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#fff', fontSize: '15px', padding: '12px 24px' }}
                  >
                    <Check size={18} /> Cooked & Serve to Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-column-placeholder card" style={{ padding: '80px 20px', background: 'var(--bg-card)' }}>
                <ChefHat size={48} className="muted-icon animate-float" style={{ color: 'var(--secondary)', opacity: 0.3 }} />
                <h3 className="mt-3" style={{ fontSize: '18px', fontWeight: 700 }}>No Active Kitchen Assignment</h3>
                <p style={{ maxWidth: '400px', margin: '10px auto 0 auto', color: 'var(--text-secondary)' }}>Accept an incoming storefront order from the kitchen queue to initiate preparation controls.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Kitchen Queue */}
        {activeTab === 'queue' && (
          <div className="queue-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Incoming Kitchen Queue ({activeQueue.length})</h3>
            
            {activeQueue.length === 0 ? (
              <div className="empty-column-placeholder card" style={{ padding: '80px 20px', background: 'var(--bg-card)' }}>
                <AlertCircle size={48} className="muted-icon animate-pulse" />
                <h3 className="mt-3" style={{ fontSize: '18px', fontWeight: 700 }}>Kitchen Queue is Empty</h3>
                <p style={{ color: 'var(--text-secondary)' }}>All storefront delivery or pickup orders are currently under active preparation.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {activeQueue.map(order => (
                  <div key={order.id} className="card queue-order-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                      <span className="font-bold text-gradient-orange" style={{ fontSize: '16px', fontFamily: 'monospace' }}>{order.id}</span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock size={12} /> {order.date.split(',')[1]?.trim() || 'Just now'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <span className="text-xs text-muted block mb-1">Dish details:</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-secondary text-xs"
                        style={{ padding: '10px 14px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Eye size={14} /> Spec Specs
                      </button>
                      <button 
                        onClick={() => handleStartCooking(order.id)}
                        className="btn btn-primary text-xs"
                        style={{ padding: '10px 14px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--secondary)', borderColor: 'var(--secondary)' }}
                        disabled={chef.status === 'busy'}
                      >
                        <Sparkles size={14} /> Claim Counter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Prepared History */}
        {activeTab === 'history' && (
          <div className="history-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Prepared Orders History Today ({myHistory.length})</h3>
            
            {myHistory.length === 0 ? (
              <p className="text-sm text-muted">You haven't prepared any orders today. When you release orders, they will show here.</p>
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
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{order.id}</strong>
                      <span className="text-xs text-muted block mt-1">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <span className="text-xs text-muted">{order.date.split(',')[1]?.trim() || order.date}</span>
                      <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)', padding: '5px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(34,197,94,0.2)' }}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Kitchen Analytics (Insights Dashboard) */}
        {activeTab === 'insights' && (
          <div className="insights-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Kitchen Performance Insights</h3>
            
            {/* Micro-Metrics Cards */}
            <div className="admin-stats-grid mb-5">
              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(255, 135, 0, 0.1)', color: 'var(--secondary)' }}>
                  <TrendingUp size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Prepared Today</span>
                  <h3>{myHistory.length} Dishes</h3>
                  <p className="stat-subtitle">All prep limits met</p>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)' }}>
                  <Clock size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Avg Prep Speed</span>
                  <h3>8.5 Mins</h3>
                  <p className="stat-subtitle">Fastest station in Kigali</p>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <AlertCircle size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Queue Congestion</span>
                  <h3>{activeQueue.length > 5 ? '🔴 HIGH' : activeQueue.length > 2 ? '🟡 MODERATE' : '🟢 LIGHT'}</h3>
                  <p className="stat-subtitle">{activeQueue.length} orders waiting claim</p>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-icon-box" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)' }}>
                  <Thermometer size={20} />
                </div>
                <div className="stat-details">
                  <span className="stat-title">Cabinet Temp</span>
                  <h3>185°F</h3>
                  <p className="stat-subtitle">Prep warm shelf active</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              {/* Load rush chart */}
              <div className="card" style={{ padding: '24px' }}>
                <div className="card-header mb-3">
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Kitchen Load Rush Forecast (Peak Times)</h4>
                  <span className="text-xs text-muted">Weekly aggregated statistics of order frequency</span>
                </div>
                
                <div className="chart-container" style={{ position: 'relative' }}>
                  <svg className="line-chart-svg" viewBox="0 0 500 200" style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="chefChartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    
                    <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <line x1="40" y1="20" x2="40" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                    <path d="M 40,170 Q 120,160 200,60 T 320,140 T 440,40 L 480,40 L 480,170 Z" fill="url(#chefChartGlow)" />
                    <path d="M 40,170 Q 120,160 200,60 T 320,140 T 440,40 L 480,40" fill="none" stroke="var(--secondary)" strokeWidth="3" strokeLinecap="round" />

                    <circle cx="200" cy="60" r="5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                    <circle cx="320" cy="140" r="5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                    <circle cx="440" cy="40" r="5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />

                    <text x="40" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">8 AM</text>
                    <text x="150" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">12 PM (Lunch)</text>
                    <text x="260" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">4 PM</text>
                    <text x="380" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">8 PM (Dinner)</text>
                    <text x="470" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">11 PM</text>
                  </svg>
                </div>
              </div>

              {/* Kitchen ingredient stock board */}
              <div className="card" style={{ padding: '24px' }}>
                <div className="card-header mb-3">
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Ingredient Stocks</h4>
                  <span className="text-xs text-muted">Daily availability status level logs</span>
                </div>
                
                <div className="products-volume-list mt-3">
                  {stockLevels.map(stock => (
                    <div className="volume-item mb-3" key={stock.name}>
                      <div className="volume-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                        <span className="volume-name" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stock.name}</span>
                        <span className="volume-value" style={{ color: stock.pulse ? '#fbbf24' : 'var(--text-secondary)' }}>{stock.value}% Available</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div 
                          className={`progress-fill ${stock.pulse ? 'animate-pulse' : ''}`} 
                          style={{ 
                            width: `${stock.value}%`,
                            background: stock.color,
                            height: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
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
                <h3>Kitchen Cooking Specifications</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="details-section-box">
                <h4>Dish List & Customizations</h4>
                <div className="admin-order-items-list mt-2">
                  {selectedOrder.items.map(item => (
                    <div className="admin-order-item-card" key={item.id} style={{ alignItems: 'flex-start' }}>
                      <img src={item.image} alt={item.name} className="admin-order-item-img" style={{ width: '48px', height: '48px' }} />
                      <div className="admin-order-item-desc" style={{ flexGrow: 1 }}>
                        <h5 style={{ fontSize: '15px' }}>{item.quantity}x {item.name}</h5>
                        
                        <div className="item-customizations-list mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                          {item.customizations.bun && <span>• <strong>Bun:</strong> {item.customizations.bun}</span>}
                          {item.customizations.doneness && <span>• <strong>Meat Temp:</strong> {item.customizations.doneness}</span>}
                          {item.customizations.extras.length > 0 && (
                            <span>• <strong>Add-ons:</strong> {item.customizations.extras.map(e => e.name).join(', ')}</span>
                          )}
                          {item.customizations.sauces.length > 0 && (
                            <span>• <strong>Sauces:</strong> {item.customizations.sauces.join(', ')}</span>
                          )}
                          {item.customizations.notes && (
                            <span style={{ fontStyle: 'italic', color: 'var(--secondary)' }}>• <strong>Chef Note:</strong> "{item.customizations.notes}"</span>
                          )}
                        </div>
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
