import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, Clock, Check, Eye, ClipboardList, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import { fetchChefs } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const ChefDashboard: React.FC = () => {
  const { orders, assignChefToOrder, completeCookingOrder } = useCart();
  const navigate = useNavigate();
  const [chef, setChef] = useState<any>(null);
  
  // Local item check-offs for active cooking session
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('burgerhub_active_chef');
    if (!session) {
      navigate('/chef/login');
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
    navigate('/chef/login');
  };

  const handleStartCooking = (orderId: string) => {
    if (!chef) return;
    if (chef.status === 'busy') {
      alert('You are already preparing an order! Finish it first.');
      return;
    }
    assignChefToOrder(orderId, chef.id, chef.name);
    setCheckedItems({});
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
  const myHistory = orders.filter(o => o.assignedChefId === chef.id && o.status !== 'cooking');

  return (
    <div className="admin-dashboard-page staff-dashboard-page chef-dashboard animate-fade-in">
      {/* Top Banner Header */}
      <div className="admin-header-bar staff-header-bar">
        <div className="container header-flex-row">
          <div className="admin-branding">
            <span className="admin-badge chef-badge"><ChefHat size={14} /> Kitchen Staff Portal</span>
            <h2>Welcome Back, <span className="text-gradient-orange">{chef.name}</span></h2>
          </div>
          <div className="staff-actions-bar">
            <span className={`staff-status-indicator ${chef.status}`}>
              {chef.status === 'idle' ? '🟢 KITCHEN IDLE' : '🔥 COOKING'}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary logout-btn">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container main-admin-container mt-5">
        <div className="staff-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* Active Chef Assignment Column */}
          <div className="staff-main-panel">
            <h3 className="section-title text-gradient mb-4">Active Preparation Counter</h3>
            
            {myCurrentOrder ? (
              <div className="card active-assignment-card" style={{ padding: '30px', borderLeft: '4px solid var(--secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span className="text-xs text-muted">ORDER ID</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--secondary)' }}>{myCurrentOrder.id}</h2>
                    <p className="text-sm text-secondary mt-1">Placed: {myCurrentOrder.date}</p>
                  </div>
                  <div style={{ background: 'rgba(255, 135, 0, 0.1)', padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
                    <span className="text-xs text-muted block">Client</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{myCurrentOrder.details.name}</strong>
                  </div>
                </div>

                <div className="active-order-checklist mt-4">
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={18} className="color-orange" />
                    Dish Checklist (Check off as you cook)
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
                            background: isChecked ? 'rgba(34, 197, 94, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                            border: isChecked ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--border)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
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
                            {(item.customizations.bun || item.customizations.doneness || item.customizations.extras.length > 0 || item.customizations.sauces.length > 0) && (
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
                    <Clock size={14} /> Double-check bun & meat specs before releasing.
                  </span>
                  
                  <button 
                    onClick={() => handleFinishCooking(myCurrentOrder.id)}
                    className="btn btn-primary ready-btn-kitchen"
                    style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#fff', fontSize: '15px', padding: '12px 24px' }}
                  >
                    <Check size={18} /> Ready to Serve & Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-column-placeholder card" style={{ padding: '60px 20px' }}>
                <ChefHat size={48} className="muted-icon animate-float" />
                <h3>No Active Assignment</h3>
                <p>Accept an incoming order from the queue on the right to start cooking.</p>
              </div>
            )}

            {/* Preparation History */}
            <div className="kitchen-history-section mt-5">
              <h4 className="section-title text-sm mb-3">Today's Prepared History ({myHistory.length})</h4>
              
              {myHistory.length === 0 ? (
                <p className="text-sm text-muted">You haven't prepared any orders today.</p>
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
                        <span className="text-xs text-muted block mt-1">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="text-xs text-muted">{order.date.split(',')[1]?.trim()}</span>
                        <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Kitchen Orders Queue Column */}
          <div className="staff-side-panel">
            <h3 className="section-title text-gradient mb-4">Kitchen Queue ({activeQueue.length})</h3>

            <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activeQueue.length === 0 ? (
                <div className="empty-column-placeholder card" style={{ padding: '30px 20px' }}>
                  <AlertCircle size={32} className="muted-icon" />
                  <h4>Queue Empty</h4>
                  <p>All storefront orders have been claimed.</p>
                </div>
              ) : (
                activeQueue.map(order => (
                  <div key={order.id} className="card queue-order-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="font-bold text-gradient-orange">{order.id}</span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock size={12} /> {order.date.split(',')[1]?.trim() || 'Just now'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <span className="text-xs text-muted block">Items:</span>
                      <strong style={{ fontSize: '14px' }}>
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
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
                        onClick={() => handleStartCooking(order.id)}
                        className="btn btn-primary text-xs"
                        style={{ padding: '8px 12px', flexGrow: 1 }}
                        disabled={chef.status === 'busy'}
                      >
                        Start Preparing
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
                <h3>Kitchen Specs</h3>
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
