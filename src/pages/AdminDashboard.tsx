import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, Truck, Check, Clock, 
  MapPin, ClipboardList, Plus, ShieldCheck, LogOut, 
  ChefHat, Bike, Eye, ChevronRight, X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import '../styles/pages/AdminDashboard.css';

interface Staff {
  id: string;
  name: string;
  role: 'chef' | 'rider';
  status: 'idle' | 'busy';
  assignedOrderId?: string;
}

export const AdminDashboard: React.FC = () => {
  const { orders, updateOrderStatusInHistory } = useCart();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin');
  
  // Staff states
  const [chefs, setChefs] = useState<Staff[]>([]);
  const [riders, setRiders] = useState<Staff[]>([]);
  
  // Input states for new staff
  const [newChefName, setNewChefName] = useState('');
  const [newRiderName, setNewRiderName] = useState('');
  
  // UI helper states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRiderMapOrder, setShowRiderMapOrder] = useState<Order | null>(null);
  const [mapProgress, setMapProgress] = useState(0);

  useEffect(() => {
    // Authentication guard
    const session = localStorage.getItem('burgerhub_active_admin');
    if (!session) {
      navigate('/admin/login');
      return;
    }
    const adminObj = JSON.parse(session);
    setAdminName(adminObj.name || 'Admin');

    // Initialize staff from localStorage or set defaults
    const savedChefs = localStorage.getItem('burgerhub_chefs');
    if (savedChefs) {
      setChefs(JSON.parse(savedChefs));
    } else {
      const defaultChefs: Staff[] = [
        { id: 'C1', name: 'Chef Kwizera', role: 'chef', status: 'idle' },
        { id: 'C2', name: 'Chef Mutoni', role: 'chef', status: 'busy', assignedOrderId: 'BH-582910' },
        { id: 'C3', name: 'Chef Gakire', role: 'chef', status: 'idle' }
      ];
      setChefs(defaultChefs);
      localStorage.setItem('burgerhub_chefs', JSON.stringify(defaultChefs));
    }

    const savedRiders = localStorage.getItem('burgerhub_riders');
    if (savedRiders) {
      setRiders(JSON.parse(savedRiders));
    } else {
      const defaultRiders: Staff[] = [
        { id: 'R1', name: 'Rider Jean', role: 'rider', status: 'busy', assignedOrderId: 'BH-248910' },
        { id: 'R2', name: 'Rider Claude', role: 'rider', status: 'idle' },
        { id: 'R3', name: 'Rider Diane', role: 'rider', status: 'idle' }
      ];
      setRiders(defaultRiders);
      localStorage.setItem('burgerhub_riders', JSON.stringify(defaultRiders));
    }
  }, [navigate]);

  // Persist staff changes
  const updateChefsInStorage = (updated: Staff[]) => {
    setChefs(updated);
    localStorage.setItem('burgerhub_chefs', JSON.stringify(updated));
  };

  const updateRidersInStorage = (updated: Staff[]) => {
    setRiders(updated);
    localStorage.setItem('burgerhub_riders', JSON.stringify(updated));
  };

  // Staff management triggers
  const handleAddChef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChefName.trim()) return;
    const newChef: Staff = {
      id: 'C' + Math.floor(100 + Math.random() * 900),
      name: newChefName.trim(),
      role: 'chef',
      status: 'idle'
    };
    updateChefsInStorage([...chefs, newChef]);
    setNewChefName('');
  };

  const handleAddRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName.trim()) return;
    const newRider: Staff = {
      id: 'R' + Math.floor(100 + Math.random() * 900),
      name: newRiderName.trim(),
      role: 'rider',
      status: 'idle'
    };
    updateRidersInStorage([...riders, newRider]);
    setNewRiderName('');
  };

  const toggleStaffStatus = (id: string, role: 'chef' | 'rider') => {
    if (role === 'chef') {
      const updated = chefs.map(c => c.id === id ? { ...c, status: (c.status === 'idle' ? 'busy' : 'idle') as 'idle' | 'busy' } : c);
      updateChefsInStorage(updated);
    } else {
      const updated = riders.map(r => r.id === id ? { ...r, status: (r.status === 'idle' ? 'busy' : 'idle') as 'idle' | 'busy' } : r);
      updateRidersInStorage(updated);
    }
  };

  const handleRemoveStaff = (id: string, role: 'chef' | 'rider') => {
    if (role === 'chef') {
      const updated = chefs.filter(c => c.id !== id);
      updateChefsInStorage(updated);
    } else {
      const updated = riders.filter(r => r.id !== id);
      updateRidersInStorage(updated);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('burgerhub_active_admin');
    navigate('/admin/login');
  };

  // Update order status and manage staff bindings
  const handleStatusTransition = (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'preparing';
    if (currentStatus === 'preparing') {
      nextStatus = 'cooking';
      // Find an idle chef and assign
      const idleChef = chefs.find(c => c.status === 'idle');
      if (idleChef) {
        updateChefsInStorage(chefs.map(c => c.id === idleChef.id ? { ...c, status: 'busy', assignedOrderId: orderId } : c));
      }
    } else if (currentStatus === 'cooking') {
      nextStatus = 'delivering';
      // Release chef
      updateChefsInStorage(chefs.map(c => c.assignedOrderId === orderId ? { ...c, status: 'idle', assignedOrderId: undefined } : c));
      // Assign an idle rider
      const idleRider = riders.find(r => r.status === 'idle');
      if (idleRider) {
        updateRidersInStorage(riders.map(r => r.id === idleRider.id ? { ...r, status: 'busy', assignedOrderId: orderId } : r));
      }
    } else if (currentStatus === 'delivering') {
      nextStatus = 'delivered';
      // Release rider
      updateRidersInStorage(riders.map(r => r.assignedOrderId === orderId ? { ...r, status: 'idle', assignedOrderId: undefined } : r));
    }

    updateOrderStatusInHistory(orderId, nextStatus);
    
    // Update active modal order reference if open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleOpenMap = (order: Order) => {
    setShowRiderMapOrder(order);
    setMapProgress(0);
  };

  // Kigali Transit map simulator progress animation
  useEffect(() => {
    if (!showRiderMapOrder) return;
    const interval = setInterval(() => {
      setMapProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [showRiderMapOrder]);

  // Calculations for stats widgets
  const EXCHANGE_RATE = 1300;
  const totalRevenueUSD = orders.reduce((acc, order) => acc + order.total, 0);
  const totalRevenueRWF = Math.round(totalRevenueUSD * EXCHANGE_RATE);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const busyChefsCount = chefs.filter(c => c.status === 'busy').length;
  const busyRidersCount = riders.filter(r => r.status === 'busy').length;

  // Kanban column categories
  const columns: { title: string; status: Order['status']; icon: any; colorClass: string }[] = [
    { title: 'New Orders', status: 'preparing', icon: ClipboardList, colorClass: 'border-orange' },
    { title: 'In Kitchen', status: 'cooking', icon: ChefHat, colorClass: 'border-yellow' },
    { title: 'Out For Delivery', status: 'delivering', icon: Truck, colorClass: 'border-blue' },
    { title: 'Completed', status: 'delivered', icon: Check, colorClass: 'border-green' }
  ];

  return (
    <div className="admin-dashboard-page animate-fade-in">
      <div className="admin-header-bar">
        <div className="container header-flex-row">
          <div className="admin-branding">
            <span className="admin-badge"><ShieldCheck size={14} /> Master Panel</span>
            <h2>Welcome Back, <span className="text-gradient-orange">{adminName}</span></h2>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="container main-admin-container mt-5">
        {/* Stats Row Widgets */}
        <div className="admin-stats-grid">
          <div className="stat-card card">
            <div className="stat-icon-box bg-orange-dim">
              <TrendingUp className="color-orange" size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Total Revenue</span>
              <h3>{totalRevenueRWF.toLocaleString()} RWF</h3>
              <p className="stat-subtitle">${totalRevenueUSD.toFixed(2)} USD Equivalent</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon-box bg-red-dim">
              <ShoppingBag className="color-red" size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Active Logged Orders</span>
              <h3>{activeOrdersCount} Orders</h3>
              <p className="stat-subtitle">{orders.length} total orders history</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon-box bg-white-dim">
              <ChefHat className="color-white" size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Kitchen Crew</span>
              <h3>{chefs.length - busyChefsCount} / {chefs.length} Idle</h3>
              <p className="stat-subtitle">{busyChefsCount} chefs actively cooking</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon-box bg-blue-dim">
              <Truck className="color-blue" size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-title">Riders Courier Fleet</span>
              <h3>{riders.length - busyRidersCount} / {riders.length} Idle</h3>
              <p className="stat-subtitle">{busyRidersCount} riders in transit</p>
            </div>
          </div>
        </div>

        {/* Live Kanban Board */}
        <div className="kanban-section mt-5">
          <h3 className="section-title text-gradient">Live Kitchen Queue monitor</h3>
          
          <div className="kanban-grid mt-4">
            {columns.map(col => {
              const colOrders = orders.filter(o => o.status === col.status);
              const ColIcon = col.icon;
              return (
                <div className={`kanban-column card ${col.colorClass}`} key={col.status}>
                  <div className="kanban-column-header">
                    <ColIcon size={18} className="column-icon" />
                    <h4>{col.title}</h4>
                    <span className="kanban-count-badge">{colOrders.length}</span>
                  </div>

                  <div className="kanban-cards-wrapper mt-3">
                    {colOrders.length === 0 ? (
                      <div className="empty-column-placeholder">
                        <Clock size={28} className="muted-icon" />
                        <p>No orders in queue</p>
                      </div>
                    ) : (
                      colOrders.map(order => (
                        <div className="kanban-order-card" key={order.id}>
                          <div className="kanban-card-top">
                            <span className="order-id">{order.id}</span>
                            <span className="order-time">{order.date.split(',')[1]?.trim() || order.date}</span>
                          </div>
                          
                          <div className="kanban-card-body mt-2">
                            <strong>{order.details.name}</strong>
                            <p className="text-truncate">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                          </div>

                          <div className="kanban-card-footer mt-3 border-t pt-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="btn-link icon-btn"
                              title="View Order Details"
                            >
                              <Eye size={16} /> Details
                            </button>
                            
                            {order.status !== 'delivered' && (
                              <button 
                                onClick={() => handleStatusTransition(order.id, order.status)}
                                className="btn btn-primary next-status-btn"
                              >
                                {order.status === 'preparing' && 'Cook Patty'}
                                {order.status === 'cooking' && 'Dispatch'}
                                {order.status === 'delivering' && 'Arrived'} <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Management Grids */}
        <div className="staff-management-section mt-5 pt-3">
          <div className="staff-layout-grid">
            
            {/* Chef Management Card */}
            <div className="staff-management-card card">
              <div className="staff-card-header mb-3">
                <ChefHat className="color-orange" size={22} />
                <h4>Manage Kitchen Chefs</h4>
              </div>

              <form onSubmit={handleAddChef} className="add-staff-form mb-4">
                <input 
                  type="text" 
                  placeholder="Enter Chef's Name..."
                  className="form-input text-sm"
                  value={newChefName}
                  onChange={(e) => setNewChefName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary add-staff-btn">
                  <Plus size={16} /> Add Chef
                </button>
              </form>

              <div className="staff-list">
                {chefs.length === 0 ? (
                  <p className="text-center text-sm text-muted">No chefs registered.</p>
                ) : (
                  chefs.map(chef => (
                    <div className="staff-item" key={chef.id}>
                      <div className="staff-details">
                        <span className="staff-id">{chef.id}</span>
                        <div>
                          <strong>{chef.name}</strong>
                          {chef.assignedOrderId && (
                            <span className="assigned-tag">Cooking: {chef.assignedOrderId}</span>
                          )}
                        </div>
                      </div>
                      <div className="staff-actions">
                        <button 
                          onClick={() => toggleStaffStatus(chef.id, 'chef')}
                          className={`status-pill ${chef.status === 'idle' ? 'idle' : 'busy'}`}
                        >
                          {chef.status.toUpperCase()}
                        </button>
                        <button 
                          onClick={() => handleRemoveStaff(chef.id, 'chef')}
                          className="btn-remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rider Management Card */}
            <div className="staff-management-card card">
              <div className="staff-card-header mb-3">
                <Bike className="color-blue" size={22} />
                <h4>Manage Courier Riders</h4>
              </div>

              <form onSubmit={handleAddRider} className="add-staff-form mb-4">
                <input 
                  type="text" 
                  placeholder="Enter Rider's Name..."
                  className="form-input text-sm"
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary add-staff-btn">
                  <Plus size={16} /> Add Rider
                </button>
              </form>

              <div className="staff-list">
                {riders.length === 0 ? (
                  <p className="text-center text-sm text-muted">No riders registered.</p>
                ) : (
                  riders.map(rider => (
                    <div className="staff-item" key={rider.id}>
                      <div className="staff-details">
                        <span className="staff-id">{rider.id}</span>
                        <div>
                          <strong>{rider.name}</strong>
                          {rider.assignedOrderId && (
                            <span className="assigned-tag">Delivering: {rider.assignedOrderId}</span>
                          )}
                        </div>
                      </div>
                      <div className="staff-actions">
                        <button 
                          onClick={() => toggleStaffStatus(rider.id, 'rider')}
                          className={`status-pill ${rider.status === 'idle' ? 'idle' : 'busy'}`}
                        >
                          {rider.status.toUpperCase()}
                        </button>
                        <button 
                          onClick={() => handleRemoveStaff(rider.id, 'rider')}
                          className="btn-remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Order Details Modal (View orders with images) */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-container card animate-admin-modal-enter" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-b pb-3 mb-3">
              <div>
                <span className="text-xs text-muted">Order ID: {selectedOrder.id}</span>
                <h3>Order Details</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-content">
              {/* Recipient details */}
              <div className="details-section-box">
                <h4>Customer Information</h4>
                <div className="details-row-grid mt-2">
                  <p><strong>Name:</strong> {selectedOrder.details.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.details.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.details.phone}</p>
                  <p><strong>Method:</strong> {selectedOrder.details.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
                </div>
                {selectedOrder.details.deliveryMethod === 'delivery' && (
                  <p className="mt-2"><strong>Location Pin Address:</strong> {selectedOrder.details.address}</p>
                )}
              </div>

              {/* Items List (Show food details with photos) */}
              <div className="details-section-box mt-4">
                <h4>Ordered Products</h4>
                <div className="admin-order-items-list mt-2">
                  {selectedOrder.items.map(item => (
                    <div className="admin-order-item-card" key={item.id}>
                      <img src={item.image} alt={item.name} className="admin-order-item-img" />
                      <div className="admin-order-item-desc">
                        <h5>{item.quantity}x {item.name}</h5>
                        
                        {(item.customizations.bun || item.customizations.doneness || item.customizations.extras.length > 0) && (
                          <div className="item-customizations-list mt-1">
                            {item.customizations.bun && <span>Bun: {item.customizations.bun}</span>}
                            {item.customizations.doneness && <span>Doneness: {item.customizations.doneness}</span>}
                            {item.customizations.extras.length > 0 && (
                              <span>Add: {item.customizations.extras.map(e => e.name).join(', ')}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="admin-order-item-price">
                        {selectedOrder.details.currency === 'RWF' 
                          ? `${Math.round(item.totalPrice * item.quantity * EXCHANGE_RATE).toLocaleString()} RWF`
                          : `$${(item.totalPrice * item.quantity).toFixed(2)}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="details-section-box mt-4 border-t pt-3">
                <div className="totals-and-billing-grid">
                  <div>
                    <h4>Billing & Secure Channels</h4>
                    <p className="text-sm mt-1">
                      <strong>Method:</strong> {selectedOrder.details.paymentMethod.toUpperCase()}
                      {selectedOrder.details.paymentMethod === 'stripe' && ` (${selectedOrder.details.cardNumberMuted})`}
                      {selectedOrder.details.paymentMethod === 'momo' && ` (${selectedOrder.details.momoProvider?.toUpperCase()} - ${selectedOrder.details.momoPhone})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Subtotal: {selectedOrder.details.currency === 'RWF' ? `${Math.round(selectedOrder.subtotal * EXCHANGE_RATE).toLocaleString()} RWF` : `$${selectedOrder.subtotal.toFixed(2)}`}</p>
                    <p className="text-sm">Delivery Fee: {selectedOrder.details.currency === 'RWF' ? `${Math.round(selectedOrder.deliveryFee * EXCHANGE_RATE).toLocaleString()} RWF` : `$${selectedOrder.deliveryFee.toFixed(2)}`}</p>
                    <h3 className="mt-1 color-orange font-bold text-lg">
                      Total: {selectedOrder.details.currency === 'RWF' ? `${Math.round(selectedOrder.total * EXCHANGE_RATE).toLocaleString()} RWF` : `$${selectedOrder.total.toFixed(2)}`}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-t pt-3 mt-3">
              {selectedOrder.status === 'delivering' && (
                <button 
                  onClick={() => { setSelectedOrder(null); handleOpenMap(selectedOrder); }} 
                  className="btn btn-secondary map-btn"
                >
                  <MapPin size={16} /> Kigali Transit Map
                </button>
              )}
              
              <div className="footer-action-right">
                <button className="btn btn-secondary mr-2" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
                {selectedOrder.status !== 'delivered' && (
                  <button 
                    onClick={() => handleStatusTransition(selectedOrder.id, selectedOrder.status)}
                    className="btn btn-primary"
                  >
                    Transition Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kigali Transit Route Map Simulator Modal (Unique Premium Feature) */}
      {showRiderMapOrder && (
        <div className="admin-modal-overlay" onClick={() => setShowRiderMapOrder(null)}>
          <div className="admin-modal-container map-simulator-modal card animate-admin-modal-enter" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-b pb-3 mb-3">
              <div>
                <h3>Transit Route Simulator</h3>
                <span className="text-xs text-muted">Tracking Order ID: {showRiderMapOrder.id}</span>
              </div>
              <button className="close-btn" onClick={() => setShowRiderMapOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="map-simulator-body text-center">
              <p className="text-sm text-secondary mb-3">
                Tracking courier delivery pin route in real-time across the Kigali metropolitan grid.
              </p>

              <div className="transit-map-canvas-container card">
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

              <div className="transit-status-indicator mt-4">
                <div className="indicator-row">
                  <span className="text-xs text-muted">Courier Rider Name:</span>
                  <strong className="text-sm font-semibold">{riders.find(r => r.assignedOrderId === showRiderMapOrder.id)?.name || 'Courier Fleet Rider'}</strong>
                </div>
                <div className="indicator-row mt-2">
                  <span className="text-xs text-muted">Delivery Address:</span>
                  <strong className="text-sm font-semibold text-truncate max-w-xs">{showRiderMapOrder.details.address}</strong>
                </div>
                <div className="indicator-row mt-2">
                  <span className="text-xs text-muted">Simulated Transit Progress:</span>
                  <strong className="text-sm font-semibold color-orange">{mapProgress}%</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer border-t pt-3 mt-3">
              <button className="btn btn-secondary w-full" onClick={() => setShowRiderMapOrder(null)}>
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
