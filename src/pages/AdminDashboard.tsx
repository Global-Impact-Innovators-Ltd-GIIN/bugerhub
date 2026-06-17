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
  email: string;
  password?: string;
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
  const [newChefEmail, setNewChefEmail] = useState('');
  const [newChefPassword, setNewChefPassword] = useState('');

  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderEmail, setNewRiderEmail] = useState('');
  const [newRiderPassword, setNewRiderPassword] = useState('');

  // Menu and Categories states
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  // Input states for new category
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');

  // Input states for new item
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemPresetImage, setNewItemPresetImage] = useState('/images/hero_burger.png');
  
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
        { id: 'C1', name: 'Chef Kwizera', email: 'chef1@burgerhub.com', password: 'chef123', role: 'chef', status: 'idle' },
        { id: 'C2', name: 'Chef Mutoni', email: 'chef2@burgerhub.com', password: 'chef123', role: 'chef', status: 'busy', assignedOrderId: 'BH-582910' },
        { id: 'C3', name: 'Chef Gakire', email: 'chef3@burgerhub.com', password: 'chef123', role: 'chef', status: 'idle' }
      ];
      setChefs(defaultChefs);
      localStorage.setItem('burgerhub_chefs', JSON.stringify(defaultChefs));
    }

    const savedRiders = localStorage.getItem('burgerhub_riders');
    if (savedRiders) {
      setRiders(JSON.parse(savedRiders));
    } else {
      const defaultRiders: Staff[] = [
        { id: 'R1', name: 'Rider Jean', email: 'rider1@burgerhub.com', password: 'rider123', role: 'rider', status: 'busy', assignedOrderId: 'BH-248910' },
        { id: 'R2', name: 'Rider Claude', email: 'rider2@burgerhub.com', password: 'rider123', role: 'rider', status: 'idle' },
        { id: 'R3', name: 'Rider Diane', email: 'rider3@burgerhub.com', password: 'rider123', role: 'rider', status: 'idle' }
      ];
      setRiders(defaultRiders);
      localStorage.setItem('burgerhub_riders', JSON.stringify(defaultRiders));
    }

    // Seed/Load categories & menu items
    const savedCategories = localStorage.getItem('burgerhub_menu_categories');
    let cats = [];
    if (savedCategories) {
      cats = JSON.parse(savedCategories);
    } else {
      cats = [
        { id: 'all', label: 'All Items' },
        { id: 'burgers', label: 'Signature Burgers' },
        { id: 'meals', label: 'Family Meals' },
        { id: 'sides', label: 'Sides & Drinks' },
        { id: 'desserts', label: 'Desserts' }
      ];
      localStorage.setItem('burgerhub_menu_categories', JSON.stringify(cats));
    }
    setCategories(cats);

    const savedItems = localStorage.getItem('burgerhub_menu_items');
    let items = [];
    if (savedItems) {
      items = JSON.parse(savedItems);
    } else {
      items = [
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
      localStorage.setItem('burgerhub_menu_items', JSON.stringify(items));
    }
    setMenuItems(items);
    
    // Set default category selection
    if (cats.length > 0) {
      setNewItemCategory(cats[0].id === 'all' ? (cats[1]?.id || 'burgers') : cats[0].id);
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
    if (!newChefName.trim() || !newChefEmail.trim() || !newChefPassword.trim()) return;

    if (chefs.some(c => c.email.toLowerCase() === newChefEmail.trim().toLowerCase())) {
      alert('This chef email is already registered!');
      return;
    }

    const newChef: Staff = {
      id: 'C' + Math.floor(100 + Math.random() * 900),
      name: newChefName.trim(),
      email: newChefEmail.trim(),
      password: newChefPassword.trim(),
      role: 'chef',
      status: 'idle'
    };
    updateChefsInStorage([...chefs, newChef]);
    setNewChefName('');
    setNewChefEmail('');
    setNewChefPassword('');
  };

  const handleAddRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName.trim() || !newRiderEmail.trim() || !newRiderPassword.trim()) return;

    if (riders.some(r => r.email.toLowerCase() === newRiderEmail.trim().toLowerCase())) {
      alert('This rider email is already registered!');
      return;
    }

    const newRider: Staff = {
      id: 'R' + Math.floor(100 + Math.random() * 900),
      name: newRiderName.trim(),
      email: newRiderEmail.trim(),
      password: newRiderPassword.trim(),
      role: 'rider',
      status: 'idle'
    };
    updateRidersInStorage([...riders, newRider]);
    setNewRiderName('');
    setNewRiderEmail('');
    setNewRiderPassword('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId.trim() || !newCatLabel.trim()) return;
    
    const cid = newCatId.trim().toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.id === cid)) {
      alert('Category ID already exists!');
      return;
    }

    const updated = [...categories, { id: cid, label: newCatLabel.trim() }];
    setCategories(updated);
    localStorage.setItem('burgerhub_menu_categories', JSON.stringify(updated));
    setNewCatId('');
    setNewCatLabel('');
  };

  const handleRemoveCategory = (catId: string) => {
    if (catId === 'all') {
      alert('Cannot delete "All Items" category!');
      return;
    }
    if (confirm('Are you sure you want to delete this category? Items under this category will not be deleted but they will not belong to a valid category.')) {
      const updated = categories.filter(c => c.id !== catId);
      setCategories(updated);
      localStorage.setItem('burgerhub_menu_categories', JSON.stringify(updated));
    }
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || !newItemCategory) return;

    const priceNum = parseFloat(newItemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price!');
      return;
    }

    const finalImage = newItemImage.trim() || newItemPresetImage;
    const newItem = {
      id: newItemName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(100 + Math.random() * 900),
      name: newItemName.trim(),
      description: newItemDesc.trim(),
      price: priceNum,
      category: newItemCategory,
      image: finalImage
    };

    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    localStorage.setItem('burgerhub_menu_items', JSON.stringify(updated));

    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemImage('');
  };

  const handleRemoveMenuItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      const updated = menuItems.filter(item => item.id !== itemId);
      setMenuItems(updated);
      localStorage.setItem('burgerhub_menu_items', JSON.stringify(updated));
    }
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

      {/* Sub Header / Tabs Navigation */}
      <div className="container mt-4">
        <div className="admin-tab-bar" style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '10px 20px',
              borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Live Orders & Staff
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '10px 20px',
              borderBottom: activeTab === 'menu' ? '2px solid var(--primary)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Menu & Category Manager
          </button>
        </div>
      </div>

      <div className="container main-admin-container mt-4">
        {activeTab === 'orders' && (
          <>
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

                  <form onSubmit={handleAddChef} className="add-staff-form mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Chef's Name..."
                        className="form-input text-sm"
                        value={newChefName}
                        onChange={(e) => setNewChefName(e.target.value)}
                        required
                      />
                      <input 
                        type="email" 
                        placeholder="Email..."
                        className="form-input text-sm"
                        value={newChefEmail}
                        onChange={(e) => setNewChefEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                      <input 
                        type="password" 
                        placeholder="Password..."
                        className="form-input text-sm"
                        value={newChefPassword}
                        onChange={(e) => setNewChefPassword(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary add-staff-btn" style={{ whiteSpace: 'nowrap' }}>
                        <Plus size={16} /> Add Chef
                      </button>
                    </div>
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
                              <span className="text-xs text-muted" style={{ display: 'block', opacity: 0.7 }}>{chef.email}</span>
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

                  <form onSubmit={handleAddRider} className="add-staff-form mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Rider's Name..."
                        className="form-input text-sm"
                        value={newRiderName}
                        onChange={(e) => setNewRiderName(e.target.value)}
                        required
                      />
                      <input 
                        type="email" 
                        placeholder="Email..."
                        className="form-input text-sm"
                        value={newRiderEmail}
                        onChange={(e) => setNewRiderEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                      <input 
                        type="password" 
                        placeholder="Password..."
                        className="form-input text-sm"
                        value={newRiderPassword}
                        onChange={(e) => setNewRiderPassword(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary add-staff-btn" style={{ whiteSpace: 'nowrap' }}>
                        <Plus size={16} /> Add Rider
                      </button>
                    </div>
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
                              <span className="text-xs text-muted" style={{ display: 'block', opacity: 0.7 }}>{rider.email}</span>
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
          </>
        )}

        {activeTab === 'menu' && (
          <div className="menu-management-section animate-fade-in mt-4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
              {/* Category Management Card */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <ClipboardList className="color-orange" size={22} />
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Menu Categories</h4>
                </div>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Category ID (e.g. burgers, sides)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. pizzas"
                      className="form-input text-sm"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Category Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Spicy Pizzas"
                      className="form-input text-sm"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '5px' }}>
                    <Plus size={16} /> Add Category
                  </button>
                </form>

                <h5 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Existing Categories</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categories.map(cat => (
                    <div 
                      key={cat.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        padding: '10px 12px', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px' }}>{cat.label}</strong>
                        <span className="text-xs text-muted">ID: {cat.id}</span>
                      </div>
                      {cat.id !== 'all' && cat.id !== 'burgers' && cat.id !== 'sides' && cat.id !== 'drinks' && cat.id !== 'desserts' && cat.id !== 'meals' && (
                        <button 
                          onClick={() => handleRemoveCategory(cat.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-red)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add MenuItem Card */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Plus className="color-orange" size={22} />
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add New Food Item</h4>
                </div>

                <form onSubmit={handleAddMenuItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Food Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Classic Margherita"
                        className="form-input text-sm"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Description</label>
                      <textarea 
                        placeholder="Describe the ingredients, size, toppings..."
                        className="form-input text-sm"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        rows={3}
                        style={{ height: 'auto', resize: 'vertical' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Price ($ USD)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 12.99"
                        className="form-input text-sm"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Menu Category</label>
                      <select 
                        className="form-input text-sm"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        required
                        style={{ color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id} style={{ color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Custom Image URL (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Paste image link here..."
                        className="form-input text-sm"
                        value={newItemImage}
                        onChange={(e) => setNewItemImage(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted mb-1 block">Or Choose Preset Image</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '5px' }}>
                        {[
                          { path: '/images/hero_burger.png', name: 'Classic Burger' },
                          { path: '/images/triple_threat_burger.png', name: 'Triple Threat' },
                          { path: '/images/spicy_chicken_deluxe.png', name: 'Spicy Chicken' },
                          { path: '/images/loaded_animal_fries.png', name: 'Loaded Fries' }
                        ].map(preset => {
                          const isSelected = (!newItemImage && newItemPresetImage === preset.path);
                          return (
                            <div 
                              key={preset.path}
                              onClick={() => {
                                setNewItemImage('');
                                setNewItemPresetImage(preset.path);
                              }}
                              style={{
                                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                padding: '4px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <img src={preset.path} alt={preset.name} style={{ width: '100%', height: '40px', objectFit: 'contain' }} />
                              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preset.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginTop: '15px' }}>
                      <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px' }}>
                        <Plus size={18} /> Upload Food to Live Menu
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Live Menu Items Grid */}
            <div className="card mt-5" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Live Store Menu Items ({menuItems.length})</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {menuItems.map(item => (
                  <div 
                    key={item.id} 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-md)', 
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ height: '140px', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '10px' }} />
                      <span 
                        style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          background: 'rgba(0,0,0,0.6)', 
                          color: 'var(--text-secondary)', 
                          fontSize: '10px', 
                          padding: '3px 8px', 
                          borderRadius: '10px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        {categories.find(c => c.id === item.category)?.label || item.category}
                      </span>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h5 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 700 }}>{item.name}</h5>
                      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', flexGrow: 1 }}>
                        {item.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--secondary)', fontSize: '15px' }}>${item.price.toFixed(2)}</strong>
                        <button 
                          onClick={() => handleRemoveMenuItem(item.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--accent-red)', borderColor: 'rgba(234, 56, 56, 0.2)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
