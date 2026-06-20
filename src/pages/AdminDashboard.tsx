import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, Truck, Check, Clock, 
  MapPin, ClipboardList, Plus, ShieldCheck, LogOut, 
  ChefHat, Bike, Eye, ChevronRight, X, Users, Lock, Settings, BarChart3
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import { RwandaMap } from '../components/RwandaMap';
import { 
  fetchChefs, saveChefs, removeChef, fetchRiders, saveRiders, removeRider,
  fetchUsers, saveUser, removeUser, fetchMenuCategories, 
  saveMenuCategories, removeMenuCategory, fetchMenuItems, 
  saveMenuItem, removeMenuItem, fetchAdmins, saveAdmin, saveOrder
} from '../utils/supabaseDb';
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
  const [admins, setAdmins] = useState<any[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'chefs' | 'riders' | 'menu' | 'users' | 'access'>('analytics');

  // Analytics states
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [radarCouriers, setRadarCouriers] = useState<any[]>([]);

  // Seed analytics logs and couriers on mount
  useEffect(() => {
    setActivityLogs([
      { id: 1, time: '11:42 AM', type: 'system', text: 'Supabase real-time sync channel established (MTN MoMo Gateway active).' },
      { id: 2, time: '12:05 PM', type: 'order', text: 'Order BH-827411 placed by customer@burgerhub.com (24,500 RWF via Stripe).' },
      { id: 3, time: '12:06 PM', type: 'staff', text: 'Chef Aimable bound to Order BH-827411. Status set to cooking.' },
      { id: 4, time: '12:15 PM', type: 'promo', text: 'Promo code WELCOME5000 successfully applied for Order BH-940251.' },
      { id: 5, time: '12:20 PM', type: 'loyalty', text: 'Customer redeemed 2,500 BurgerCoins (Savings: 2,500 RWF).' },
      { id: 6, time: '12:30 PM', type: 'order', text: 'Order BH-940251 dispatched. Rider Jean-Paul bound for Nyarugenge District.' }
    ]);

    setRadarCouriers([
      { id: 'RC-1', name: 'Rider Jean-Paul', x: 120, y: 80, speed: 28, status: 'delivering', path: 'MTN Road' },
      { id: 'RC-2', name: 'Rider Pierre', x: 280, y: 140, speed: 0, status: 'idle', path: 'Nyarugenge Central' },
      { id: 'RC-3', name: 'Rider Olivier', x: 390, y: 60, speed: 35, status: 'delivering', path: 'Kigali City Mall' }
    ]);
  }, []);

  // Animate mock couriers on the logistics radar
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarCouriers(prev => 
        prev.map(c => {
          if (c.status === 'idle') return c;
          const newX = c.x + (Math.random() > 0.5 ? 6 : -6);
          const newY = c.y + (Math.random() > 0.5 ? 4 : -4);
          return {
            ...c,
            x: Math.max(50, Math.min(450, newX)),
            y: Math.max(35, Math.min(165, newY)),
            speed: Math.round(25 + Math.random() * 15)
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // System Overrides State
  const [systemLockout, setSystemLockout] = useState(false);
  const [autoAssignment, setAutoAssignment] = useState(true);

  // New Admin states
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

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

  // User database states
  const [users, setUsers] = useState<any[]>([]);

  // Edit modals state
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Edit Staff inputs
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [editStaffRole, setEditStaffRole] = useState<'chef' | 'rider'>('chef');
  const [editStaffStatus, setEditStaffStatus] = useState<'idle' | 'busy'>('idle');

  // Edit User inputs
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserCity, setEditUserCity] = useState('');
  const [editUserZipCode, setEditUserZipCode] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');

  const refreshStaff = async () => {
    const dbChefs = await fetchChefs();
    setChefs(dbChefs);
    const dbRiders = await fetchRiders();
    setRiders(dbRiders);
  };

  useEffect(() => {
    const interval = setInterval(refreshStaff, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Strict Authentication Guard
    const session = sessionStorage.getItem('burgerhub_active_admin') || localStorage.getItem('burgerhub_active_admin');
    if (!session) {
      navigate('/login');
      return;
    }
    const adminObj = JSON.parse(session);
    
    // Check if admin is valid in the database
    const verifyAndLoad = async () => {
      const admins = await fetchAdmins();
      setAdmins(admins);
      const verifiedAdmin = admins.find((a: any) => a.email.toLowerCase() === adminObj.email?.toLowerCase());
      if (!verifiedAdmin) {
        sessionStorage.removeItem('burgerhub_active_admin');
        localStorage.removeItem('burgerhub_active_admin');
        navigate('/login');
        return;
      }
      setAdminName(verifiedAdmin.name || 'Admin');

      // Load data from Supabase
      await refreshStaff();

      const dbUsers = await fetchUsers();
      setUsers(dbUsers);

      const dbCats = await fetchMenuCategories();
      setCategories(dbCats);
      if (dbCats.length > 0) {
        const defaultCat = dbCats[0].id === 'all' ? (dbCats[1]?.id || 'burgers') : dbCats[0].id;
        setNewItemCategory(defaultCat);
      }

      const dbItems = await fetchMenuItems();
      setMenuItems(dbItems);
    };
    verifyAndLoad();
  }, [navigate]);

  // Persist staff changes
  const updateChefsInStorage = (updated: Staff[]) => {
    setChefs(updated);
    saveChefs(updated);
  };

  const updateRidersInStorage = (updated: Staff[]) => {
    setRiders(updated);
    saveRiders(updated);
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
    saveMenuCategories(updated);
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
      removeMenuCategory(catId);
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
      price: priceNum / EXCHANGE_RATE,
      category: newItemCategory,
      image: finalImage
    };

    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    saveMenuItem(newItem);

    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemImage('');
  };

  const handleRemoveMenuItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      const updated = menuItems.filter(item => item.id !== itemId);
      setMenuItems(updated);
      removeMenuItem(itemId);
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

  const openEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setEditStaffName(staff.name);
    setEditStaffEmail(staff.email);
    setEditStaffPassword(staff.password || '');
    setEditStaffRole(staff.role);
    setEditStaffStatus(staff.status);
  };

  const openEditUser = (userObj: any) => {
    setEditingUser(userObj);
    setEditUserName(userObj.name || '');
    setEditUserEmail(userObj.email || '');
    setEditUserPhone(userObj.phone || '');
    setEditUserAddress(userObj.address || '');
    setEditUserCity(userObj.city || '');
    setEditUserZipCode(userObj.zipCode || '');
    setEditUserPassword(userObj.password || '');
  };

  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    if (editingStaff.role === 'chef') {
      const updated = chefs.map(c => c.id === editingStaff.id ? {
        ...c,
        name: editStaffName.trim(),
        email: editStaffEmail.trim(),
        password: editStaffPassword.trim(),
        role: editStaffRole,
        status: editStaffStatus
      } : c);
      updateChefsInStorage(updated);
    } else {
      const updated = riders.map(r => r.id === editingStaff.id ? {
        ...r,
        name: editStaffName.trim(),
        email: editStaffEmail.trim(),
        password: editStaffPassword.trim(),
        role: editStaffRole,
        status: editStaffStatus
      } : r);
      updateRidersInStorage(updated);
    }
    setEditingStaff(null);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUserObj = {
      id: editingUser.id,
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      phone: editUserPhone.trim(),
      address: editUserAddress.trim(),
      city: editUserCity.trim(),
      zipCode: editUserZipCode.trim(),
      password: editUserPassword.trim()
    };

    const updated = users.map(u => u.id === editingUser.id ? updatedUserObj : u);
    setUsers(updated);
    saveUser(updatedUserObj);

    // Update active user session if that user was logged in
    const activeSession = localStorage.getItem('burgerhub_active_user');
    if (activeSession) {
      const sessionUser = JSON.parse(activeSession);
      if (sessionUser.id === editingUser.id) {
        localStorage.setItem('burgerhub_active_user', JSON.stringify({
          id: editingUser.id,
          name: editUserName.trim(),
          email: editUserEmail.trim(),
          phone: editUserPhone.trim(),
          address: editUserAddress.trim(),
          city: editUserCity.trim(),
          zipCode: editUserZipCode.trim()
        }));
      }
    }

    setEditingUser(null);
  };

  const handleRemoveUser = (id: string) => {
    if (confirm('Are you sure you want to delete this customer account?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      removeUser(id);

      // Clear session if that user was logged in
      const activeSession = localStorage.getItem('burgerhub_active_user');
      if (activeSession) {
        const sessionUser = JSON.parse(activeSession);
        if (sessionUser.id === id) {
          localStorage.removeItem('burgerhub_active_user');
        }
      }
    }
  };
  const handleRemoveStaff = (id: string, role: 'chef' | 'rider') => {
    if (role === 'chef') {
      const updated = chefs.filter(c => c.id !== id);
      setChefs(updated);
      removeChef(id);
    } else {
      const updated = riders.filter(r => r.id !== id);
      setRiders(updated);
      removeRider(id);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) return;

    if (admins.some(a => a.email.toLowerCase() === newAdminEmail.trim().toLowerCase())) {
      alert('This admin email is already registered!');
      return;
    }

    const newAdmin = {
      name: newAdminName.trim(),
      email: newAdminEmail.trim().toLowerCase(),
      password: newAdminPassword.trim()
    };
    
    const updated = [...admins, newAdmin];
    setAdmins(updated);
    await saveAdmin(newAdmin);
    
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    alert('Administrative access granted successfully!');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('burgerhub_active_admin');
    localStorage.removeItem('burgerhub_active_admin');
    navigate('/login');
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

  const handleInjectDemoOrder = async () => {
    let selectedItemsList: any[] = [];
    const EXCHANGE_RATE = 1300;
    
    const defaultMockItems = [
      { id: 'triple-threat-burger', name: 'Triple Threat Burger', price: 16250 / EXCHANGE_RATE, image: '/images/triple_threat_burger.png', category: 'burgers', description: 'Three flame-grilled patties.' },
      { id: 'loaded-animal-fries', name: 'Loaded Animal Fries', price: 8450 / EXCHANGE_RATE, image: '/images/loaded_animal_fries.png', category: 'sides', description: 'Crispy fries with toppings.' },
      { id: 'spicy-chicken-deluxe', name: 'Spicy Chicken Deluxe', price: 12987 / EXCHANGE_RATE, image: '/images/spicy_chicken_deluxe.png', category: 'burgers', description: 'Spicy chicken breast fillet.' }
    ];

    const sourceItems = menuItems.length > 0 ? menuItems : defaultMockItems;
    const itemCount = Math.floor(Math.random() * 2) + 1;

    let subtotal = 0;
    for (let i = 0; i < itemCount; i++) {
      const baseItem = sourceItems[Math.floor(Math.random() * sourceItems.length)];
      const isBurger = baseItem.category === 'burgers';
      const customizations = {
        bun: isBurger ? (Math.random() > 0.5 ? 'Brioche' : 'Sesame') : undefined,
        doneness: isBurger ? (Math.random() > 0.5 ? 'Medium Well' : 'Well Done') : undefined,
        extras: isBurger && Math.random() > 0.5 ? [{ name: 'Extra Cheddar', price: 1500 / EXCHANGE_RATE }] : [],
        sauces: ['House Secret Sauce'],
        notes: Math.random() > 0.7 ? 'No onions please' : undefined
      };
      
      const extrasPrice = customizations.extras.reduce((acc, curr) => acc + curr.price, 0);
      const totalPrice = baseItem.price + extrasPrice;
      const quantity = Math.floor(Math.random() * 2) + 1;

      selectedItemsList.push({
        id: baseItem.id + '-' + Math.floor(100 + Math.random() * 900),
        menuId: baseItem.id,
        name: baseItem.name,
        basePrice: baseItem.price,
        totalPrice: totalPrice,
        image: baseItem.image || '/images/hero_burger.png',
        customizations: customizations,
        quantity: quantity
      });
      subtotal += totalPrice * quantity;
    }

    const tax = subtotal * 0.08;
    const isPickup = Math.random() > 0.5;
    const deliveryFee = isPickup ? 0 : 3990 / EXCHANGE_RATE;
    const total = subtotal + tax + deliveryFee;

    const customers = [
      { name: 'Kevine Murenzi', email: 'kevine.m@gmail.com', phone: '+250788123456', address: 'KN 82 St, Nyarugenge District, Kigali', city: 'Nyarugenge District, Rwanda', zipCode: '250' },
      { name: 'David Nshuti', email: 'david.nshuti@yahoo.fr', phone: '+250785987654', address: 'KG 11 Ave, Gasabo District, Kigali', city: 'Gasabo District, Rwanda', zipCode: '250' },
      { name: 'Ange Uwase', email: 'ange.uwase@gmail.com', phone: '+250783111222', address: 'KK 312 St, Kicukiro District, Kigali', city: 'Kicukiro District, Rwanda', zipCode: '250' }
    ];
    const customer = customers[Math.floor(Math.random() * customers.length)];

    const paymentMethods: ('stripe' | 'cash' | 'momo')[] = ['stripe', 'momo', 'cash'];
    const selectedPay = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const orderId = 'BH-' + Math.floor(100000 + Math.random() * 900000);

    const mockOrder: Order = {
      id: orderId,
      date: new Date().toLocaleString(),
      items: selectedItemsList,
      subtotal,
      tax,
      deliveryFee,
      total,
      details: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
        deliveryMethod: isPickup ? 'pickup' : 'delivery',
        paymentMethod: selectedPay,
        cardNumberMuted: selectedPay === 'stripe' ? '•••• •••• •••• ' + Math.floor(1000 + Math.random() * 9000) : undefined,
        momoProvider: selectedPay === 'momo' ? (Math.random() > 0.5 ? 'mtn' : 'airtel') : undefined,
        momoPhone: selectedPay === 'momo' ? '078' + Math.floor(1000000 + Math.random() * 9000000) : undefined,
        currency: 'RWF',
        couponApplied: Math.random() > 0.7 ? 'WELCOME5000' : undefined,
        couponDiscount: 0,
        coinsRedeemed: 0,
        coinsDiscount: 0
      },
      status: 'preparing'
    };

    try {
      await saveOrder(mockOrder);
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: Date.now(),
        time: timeStr,
        type: 'order',
        text: `Demo order ${orderId} injected: ${customer.name} (${Math.round(total * EXCHANGE_RATE).toLocaleString()} RWF via ${selectedPay.toUpperCase()}).`
      };
      setActivityLogs(prev => [newLog, ...prev]);

      if (autoAssignment) {
        setTimeout(async () => {
          const freshChefs = await fetchChefs();
          const idleChef = freshChefs.find((c: any) => c.status === 'idle');
          if (idleChef) {
            const timeStr2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const chefLog = {
              id: Date.now() + 1,
              time: timeStr2,
              type: 'staff',
              text: `Chef ${idleChef.name} auto-assigned to Order ${orderId}. Status: cooking.`
            };
            setActivityLogs(prev => [chefLog, ...prev]);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error injecting demo order:', err);
      alert('Failed to save demo order to database.');
    }
  };

  const handleAssignChef = async (orderId: string, chefId: string) => {
    const targetChef = chefs.find(c => c.id === chefId);
    if (!targetChef) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: 'cooking' as const,
      assignedChefId: chefId,
      assignedChefName: targetChef.name
    };

    const updatedChefs = chefs.map(c => 
      c.id === chefId 
        ? { ...c, status: 'busy' as const, assignedOrderId: orderId } 
        : c
    );

    try {
      await saveOrder(updatedOrder);
      updateChefsInStorage(updatedChefs);
      updateOrderStatusInHistory(orderId, 'cooking');
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: Date.now(),
        time: timeStr,
        type: 'staff',
        text: `Chef ${targetChef.name} explicitly assigned to Order ${orderId} by Admin.`
      };
      setActivityLogs(prev => [newLog, ...prev]);

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (err) {}
    } catch (err) {
      console.error('Failed to assign chef:', err);
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    const targetRider = riders.find(r => r.id === riderId);
    if (!targetRider) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedChefs = chefs.map(c => 
      c.assignedOrderId === orderId 
        ? { ...c, status: 'idle' as const, assignedOrderId: undefined } 
        : c
    );
    updateChefsInStorage(updatedChefs);

    const updatedOrder = {
      ...order,
      status: 'delivering' as const,
      assignedRiderId: riderId,
      assignedRiderName: targetRider.name
    };

    const updatedRiders = riders.map(r => 
      r.id === riderId 
        ? { ...r, status: 'busy' as const, assignedOrderId: orderId } 
        : r
    );

    try {
      await saveOrder(updatedOrder);
      updateRidersInStorage(updatedRiders);
      updateOrderStatusInHistory(orderId, 'delivering');

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: Date.now(),
        time: timeStr,
        type: 'staff',
        text: `Rider ${targetRider.name} explicitly assigned to Order ${orderId} by Admin.`
      };
      setActivityLogs(prev => [newLog, ...prev]);

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (err) {}
    } catch (err) {
      console.error('Failed to assign rider:', err);
    }
  };

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
    <div className="admin-dashboard-layout animate-fade-in">
      {/* Fixed Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">B</div>
          <span className="admin-sidebar-brand-text">BURGER<span className="color-orange">HUB</span></span>
        </div>

        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{adminName}</span>
            <span className="admin-sidebar-user-role">Master Administrator</span>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <button 
            className={`admin-sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} /> System Analytics
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={16} /> Live Orders Kanban
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'chefs' ? 'active' : ''}`}
            onClick={() => setActiveTab('chefs')}
          >
            <ChefHat size={16} /> Kitchen Chefs Crew
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'riders' ? 'active' : ''}`}
            onClick={() => setActiveTab('riders')}
          >
            <Bike size={16} /> Courier Riders Fleet
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <ShoppingBag size={16} /> Menu & Categories
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> Customer Directory
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'access' ? 'active' : ''}`}
            onClick={() => setActiveTab('access')}
          >
            <Lock size={16} /> Access Controls
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-sidebar-logout-btn">
            <LogOut size={16} /> Logout Panel
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main-content">
        
        {/* Global Overview Metrics */}
        <div className="admin-stats-grid mb-5">
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
              <span className="stat-title">Riders Fleet</span>
              <h3>{riders.length - busyRidersCount} / {riders.length} Idle</h3>
              <p className="stat-subtitle">{busyRidersCount} riders in transit</p>
            </div>
          </div>
        </div>

        {/* Tab 0: System Analytics Dashboard (Default View) */}
        {activeTab === 'analytics' && (
          <div className="analytics-section animate-fade-in">
            <div className="analytics-header mb-4">
              <h3 className="section-title text-gradient">System Operations Analytics</h3>
              <div className="live-sync-indicator">
                <span className="pulse-beacon"></span>
                <span className="sync-text">Supabase Realtime Sync Active</span>
              </div>
            </div>

            {/* Grid layout for Charts and Radar */}
            <div className="analytics-grid">
              
              {/* Row 1, Left Column: Sales Trend & Top Products */}
              <div className="analytics-left-col">
                {/* Revenue Trend SVG Line Chart */}
                <div className="analytics-card card">
                  <div className="card-header">
                    <h4>Revenue Trend (Last 7 Days)</h4>
                    <span className="text-xs text-muted">MTN MoMo & Stripe Consolidated</span>
                  </div>
                  <div className="chart-container">
                    <svg className="line-chart-svg" viewBox="0 0 500 200">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="neonShadow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--primary)" floodOpacity="0.6" />
                        </filter>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      
                      {/* X/Y Axis */}
                      <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      <line x1="40" y1="20" x2="40" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                      {/* Area Under Curve */}
                      <path 
                        d="M 40,170 Q 100,120 160,150 T 280,70 T 400,60 T 480,40 L 480,170 Z" 
                        fill="url(#chartGlow)" 
                      />

                      {/* Spark Line */}
                      <path 
                        d="M 40,170 Q 100,120 160,150 T 280,70 T 400,60 T 480,40" 
                        fill="none" 
                        stroke="var(--primary)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        filter="url(#neonShadow)" 
                      />

                      {/* Interactive Data Dots */}
                      <circle cx="100" cy="135" r="4.5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx="160" cy="150" r="4.5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx="220" cy="110" r="4.5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx="280" cy="70" r="4.5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx="340" cy="65" r="4.5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx="400" cy="60" r="4.5" fill="var(--secondary)" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx="480" cy="40" r="4.5" fill="var(--primary)" stroke="var(--bg-card)" strokeWidth="2" />

                      {/* Label values */}
                      <text x="35" y="175" fill="var(--text-secondary)" fontSize="9" textAnchor="end">0</text>
                      <text x="35" y="153" fill="var(--text-secondary)" fontSize="9" textAnchor="end">100k</text>
                      <text x="35" y="113" fill="var(--text-secondary)" fontSize="9" textAnchor="end">250k</text>
                      <text x="35" y="73" fill="var(--text-secondary)" fontSize="9" textAnchor="end">400k</text>
                      <text x="35" y="33" fill="var(--text-secondary)" fontSize="9" textAnchor="end">550k</text>

                      <text x="100" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Mon</text>
                      <text x="160" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Tue</text>
                      <text x="220" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Wed</text>
                      <text x="280" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Thu</text>
                      <text x="340" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Fri</text>
                      <text x="400" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Sat</text>
                      <text x="480" y="185" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Sun</text>
                    </svg>
                  </div>
                </div>

                {/* Top Product Performance */}
                <div className="analytics-card card mt-4">
                  <div className="card-header">
                    <h4>Top Product Volume (Units)</h4>
                    <span className="text-xs text-muted">Weekly aggregated statistics</span>
                  </div>
                  <div className="products-volume-list mt-3">
                    {[
                      { name: 'Triple Threat Burger', count: 184, percent: 92, color: 'var(--primary)' },
                      { name: 'Loaded Animal Fries', count: 142, percent: 71, color: 'var(--secondary)' },
                      { name: 'Spicy Chicken Deluxe', count: 118, percent: 59, color: 'var(--accent-blue)' },
                      { name: 'Mango Passion Smoothie', count: 86, percent: 43, color: 'var(--accent-green)' }
                    ].map(prod => (
                      <div className="volume-item mb-3" key={prod.name}>
                        <div className="volume-label-row">
                          <span className="volume-name">{prod.name}</span>
                          <span className="volume-value">{prod.count} units sold</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${prod.percent}%`,
                              background: prod.color
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 1, Right Column: Logistics Radar & Operations Controller */}
              <div className="analytics-right-col">
                {/* Logistics Radar Tracker */}
                <div className="analytics-card card">
                  <div className="card-header">
                    <h4>Kigali Logistics Radar (Nyarugenge District)</h4>
                    <span className="text-xs text-muted">Simulating Rider coordinates walkpaths</span>
                  </div>
                  
                  <div className="radar-screen-container mt-3">
                    <svg viewBox="0 0 500 200" className="radar-grid-svg">
                      <defs>
                        <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                          <stop offset="85%" stopColor="var(--primary)" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                        </radialGradient>
                      </defs>
                      
                      {/* Grid circles */}
                      <circle cx="250" cy="100" r="90" fill="none" stroke="rgba(255, 69, 0, 0.08)" strokeWidth="1" />
                      <circle cx="250" cy="100" r="60" fill="none" stroke="rgba(255, 69, 0, 0.08)" strokeWidth="1" />
                      <circle cx="250" cy="100" r="30" fill="none" stroke="rgba(255, 69, 0, 0.08)" strokeWidth="1" />
                      
                      {/* Radar sweeps */}
                      <line x1="250" y1="10" x2="250" y2="190" stroke="rgba(255, 69, 0, 0.1)" strokeWidth="0.75" />
                      <line x1="20" y1="100" x2="480" y2="100" stroke="rgba(255, 69, 0, 0.1)" strokeWidth="0.75" />
                      
                      {/* Scanning sweep beam */}
                      <circle cx="250" cy="100" r="90" fill="url(#radarSweep)" className="radar-sweep-beam" />
                      
                      {/* Plot couriers */}
                      {radarCouriers.map(courier => (
                        <g key={courier.id} transform={`translate(${courier.x}, ${courier.y})`}>
                          <circle r="7" fill={courier.status === 'idle' ? 'var(--text-secondary)' : 'var(--primary)'} className="radar-ping-dot" />
                          <circle r="15" fill="none" stroke={courier.status === 'idle' ? 'var(--text-secondary)' : 'var(--primary)'} strokeWidth="1" className="radar-ping-wave" />
                          <text y="-10" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                            {courier.name} ({courier.speed} km/h)
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="radar-couriers-legend mt-2">
                    {radarCouriers.map(c => (
                      <div className="legend-item" key={c.id}>
                        <span className={`status-dot ${c.status === 'idle' ? 'bg-muted' : 'bg-orange'}`}></span>
                        <span className="text-xs">{c.name}: <strong>{c.path}</strong> ({c.status})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database Operations & Mock Injector */}
                <div className="analytics-card card mt-4">
                  <div className="card-header">
                    <h4>Operations Command Deck</h4>
                    <span className="text-xs text-muted">Direct mock integrations</span>
                  </div>
                  
                  <div className="ops-deck-actions mt-3">
                    <button onClick={handleInjectDemoOrder} className="btn btn-primary inject-btn w-full py-3 mb-2 font-semibold">
                      ⚡ Inject Demo Order to Supabase
                    </button>
                    <p className="text-xs text-muted text-center mt-1">
                      Instantly writes a randomized 3-item guest order to the Postgres database.
                      The page's state sync interval will pull the entry into active pipelines.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Payment Breakdown & Live Activity Stream */}
            <div className="analytics-bottom-row mt-4">
              
              {/* Payment Methods and Channels */}
              <div className="analytics-card card">
                <div className="card-header">
                  <h4>Billing & Secure Channels (Share)</h4>
                  <span className="text-xs text-muted">Consolidated transaction metrics</span>
                </div>
                
                <div className="payment-breakdown mt-4">
                  <div className="donut-and-legend">
                    {/* Visual Meter */}
                    <div className="breakdown-bars">
                      {[
                        { label: 'MTN Mobile Money (MoMo)', value: '62%', valNum: 62, color: 'var(--primary)' },
                        { label: 'Credit/Debit Card (Stripe)', value: '26%', valNum: 26, color: 'var(--secondary)' },
                        { label: 'Cash on Hand (Delivery)', value: '12%', valNum: 12, color: 'var(--text-secondary)' }
                      ].map(item => (
                        <div className="breakdown-bar-item mb-3" key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span className="text-xs">{item.label}</span>
                            <span className="text-xs font-semibold">{item.value}</span>
                          </div>
                          <div className="meter-track">
                            <div className="meter-fill" style={{ width: `${item.valNum}%`, background: item.color }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time audit activity log */}
              <div className="analytics-card card">
                <div className="card-header">
                  <h4>Real-Time Operations Audit Feed</h4>
                  <span className="text-xs text-muted">Live Postgres database sync streams</span>
                </div>
                
                <div className="audit-feed-wrapper mt-3">
                  {activityLogs.map(log => (
                    <div className="audit-log-item" key={log.id}>
                      <span className="audit-log-time">[{log.time}]</span>
                      <span className={`audit-log-type type-${log.type}`}>{log.type.toUpperCase()}:</span>
                      <span className="audit-log-text">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 1: Live Orders Kanban Queue */}
        {activeTab === 'orders' && (
          <div className="kanban-section animate-fade-in">
            <h3 className="section-title text-gradient">Live Kitchen Queue Monitor</h3>
            
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
                                <>
                                  {order.status === 'preparing' && (
                                    <div className="delegation-select-container">
                                      <select 
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            handleAssignChef(order.id, e.target.value);
                                          }
                                        }}
                                        defaultValue=""
                                        className="delegation-select select-chef"
                                      >
                                        <option value="" disabled>👩‍🍳 Assign Chef...</option>
                                        {chefs.map(chef => (
                                          <option key={chef.id} value={chef.id} disabled={chef.status === 'busy'}>
                                            {chef.name} ({chef.status.toUpperCase()})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                  {order.status === 'cooking' && (
                                    <div className="delegation-select-container">
                                      <select 
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            handleAssignRider(order.id, e.target.value);
                                          }
                                        }}
                                        defaultValue=""
                                        className="delegation-select select-rider"
                                      >
                                        <option value="" disabled>🚴 Assign Rider...</option>
                                        {riders.map(rider => (
                                          <option key={rider.id} value={rider.id} disabled={rider.status === 'busy'}>
                                            {rider.name} ({rider.status.toUpperCase()})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                  {order.status === 'delivering' && (
                                    <button 
                                      onClick={() => handleStatusTransition(order.id, order.status)}
                                      className="btn btn-primary next-status-btn"
                                    >
                                      Arrived <ChevronRight size={14} />
                                    </button>
                                  )}
                                </>
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
        )}

        {/* Tab 2: Kitchen Chefs Crew */}
        {activeTab === 'chefs' && (
          <div className="staff-management-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Kitchen Staff Management</h3>
            
            <div className="staff-management-card card" style={{ padding: '24px' }}>
              <div className="staff-card-header mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChefHat className="color-orange" size={22} />
                <h4 style={{ margin: 0 }}>Add Kitchen Chef Account</h4>
              </div>

              <form onSubmit={handleAddChef} className="add-staff-form mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Chef's Full Name..."
                    className="form-input text-sm"
                    value={newChefName}
                    onChange={(e) => setNewChefName(e.target.value)}
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Chef Email Address..."
                    className="form-input text-sm"
                    value={newChefEmail}
                    onChange={(e) => setNewChefEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                  <input 
                    type="password" 
                    placeholder="System Login Password..."
                    className="form-input text-sm"
                    value={newChefPassword}
                    onChange={(e) => setNewChefPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary add-staff-btn" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Register Chef
                  </button>
                </div>
              </form>

              <h4 className="mt-4 mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>Kitchen Chefs Directory ({chefs.length})</h4>
              <div className="staff-list" style={{ maxHeight: 'none' }}>
                {chefs.length === 0 ? (
                  <p className="text-center text-sm text-muted">No chefs registered.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                    {chefs.map(chef => (
                      <div className="staff-item" key={chef.id} style={{ padding: '15px' }}>
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
                        <div className="staff-actions" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.02)', width: '100%', justifyContent: 'space-between' }}>
                          <button 
                            onClick={() => toggleStaffStatus(chef.id, 'chef')}
                            className={`status-pill ${chef.status === 'idle' ? 'idle' : 'busy'}`}
                          >
                            {chef.status.toUpperCase()}
                          </button>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => openEditStaff(chef)}
                              className="btn-link icon-btn text-xs"
                              style={{ padding: '4px 8px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveStaff(chef.id, 'chef')}
                              className="btn-remove"
                              style={{ background: 'rgba(234, 56, 56, 0.1)', color: 'var(--accent-red)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Courier Riders Fleet */}
        {activeTab === 'riders' && (
          <div className="staff-management-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Courier Fleet Management</h3>

            <div className="staff-management-card card" style={{ padding: '24px' }}>
              <div className="staff-card-header mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bike className="color-blue" size={22} />
                <h4 style={{ margin: 0 }}>Add Courier Rider Account</h4>
              </div>

              <form onSubmit={handleAddRider} className="add-staff-form mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Rider's Full Name..."
                    className="form-input text-sm"
                    value={newRiderName}
                    onChange={(e) => setNewRiderName(e.target.value)}
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Rider Email Address..."
                    className="form-input text-sm"
                    value={newRiderEmail}
                    onChange={(e) => setNewRiderEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                  <input 
                    type="password" 
                    placeholder="System Login Password..."
                    className="form-input text-sm"
                    value={newRiderPassword}
                    onChange={(e) => setNewRiderPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary add-staff-btn" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Register Rider
                  </button>
                </div>
              </form>

              <h4 className="mt-4 mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>Couriers Directory ({riders.length})</h4>
              <div className="staff-list" style={{ maxHeight: 'none' }}>
                {riders.length === 0 ? (
                  <p className="text-center text-sm text-muted">No riders registered.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                    {riders.map(rider => (
                      <div className="staff-item" key={rider.id} style={{ padding: '15px' }}>
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
                        <div className="staff-actions" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.02)', width: '100%', justifyContent: 'space-between' }}>
                          <button 
                            onClick={() => toggleStaffStatus(rider.id, 'rider')}
                            className={`status-pill ${rider.status === 'idle' ? 'idle' : 'busy'}`}
                          >
                            {rider.status.toUpperCase()}
                          </button>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => openEditStaff(rider)}
                              className="btn-link icon-btn text-xs"
                              style={{ padding: '4px 8px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveStaff(rider.id, 'rider')}
                              className="btn-remove"
                              style={{ background: 'rgba(234, 56, 56, 0.1)', color: 'var(--accent-red)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Menu & Category Manager */}
        {activeTab === 'menu' && (
          <div className="menu-management-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4 font-bold">Food Menu & Categories Manager</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Category Management Card */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <ClipboardList className="color-orange" size={22} />
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Menu Categories</h4>
                </div>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Category ID (e.g. pizzas, sides)</label>
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
                      <label className="text-xs text-muted mb-1 block">Price (RWF)</label>
                      <input 
                        type="number" 
                        step="1"
                        placeholder="e.g. 8500"
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
                        <strong style={{ color: 'var(--secondary)', fontSize: '15px' }}>{item.price.toLocaleString()} RWF</strong>
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

        {/* Tab 5: Customer Directory */}
        {activeTab === 'users' && (
          <div className="menu-management-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Customer Directory</h3>
            
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <ShieldCheck className="color-orange" size={22} />
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Registered Customer Profiles</h4>
              </div>

              <div className="staff-list" style={{ maxHeight: 'none' }}>
                {users.length === 0 ? (
                  <p className="text-center text-sm text-muted">No registered customer accounts.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {users.map(u => (
                      <div key={u.id} className="staff-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="staff-id">ID: {u.id}</span>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => openEditUser(u)}
                              className="btn btn-secondary text-xs"
                              style={{ padding: '5px 10px' }}
                            >
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => handleRemoveUser(u.id)}
                              className="btn btn-secondary text-xs"
                              style={{ padding: '5px 10px', color: 'var(--accent-red)', borderColor: 'rgba(234, 56, 56, 0.2)' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <p><strong>Name:</strong> {u.name}</p>
                          <p><strong>Email:</strong> {u.email}</p>
                          <p><strong>Phone:</strong> {u.phone}</p>
                          <p style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                            <strong>Address:</strong> 
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.address}</span>
                          </p>
                          <p><strong>City:</strong> {u.city}</p>
                          <p><strong>Password:</strong> {u.password}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Access Controls & System Settings */}
        {activeTab === 'access' && (
          <div className="access-controls-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Access Controls & Security Overrides</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Overrides Card */}
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Settings className="color-orange" size={22} />
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>System Control Switches</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px' }}>System Maintenance Lockout</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Prevent customers from placing new orders during updates.</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSystemLockout(!systemLockout);
                        alert(`System lockout ${!systemLockout ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`btn ${systemLockout ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {systemLockout ? '🔐 LOCKED' : '🔓 ACTIVE'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px' }}>Auto-Assign Dispatch Algorithms</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automatically bind idle chefs & couriers to incoming orders.</span>
                    </div>
                    <button 
                      onClick={() => {
                        setAutoAssignment(!autoAssignment);
                        alert(`Auto-dispatch algorithm ${!autoAssignment ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`btn ${autoAssignment ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {autoAssignment ? '🟢 AUTOMATIC' : '🔴 MANUAL'}
                    </button>
                  </div>
                </div>

                {/* Role Jurisdiction Guide */}
                <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(255, 69, 0, 0.02)', border: '1px dashed rgba(255, 69, 0, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--secondary)', fontWeight: 700 }}>🛡️ Access Level Jurisdictions</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Admin</strong>: Complete jurisdiction. Oversees menus, categories, user profiles, chefs, riders, orders, and system configurations.</li>
                    <li><strong>Chef</strong>: View kitchen prep queues, start and complete order preparations. Restricted from rider, customer, or inventory panels.</li>
                    <li><strong>Rider</strong>: Access delivery queue, accept transit dispatches, track destination coordinate address pins, and complete deliveries.</li>
                    <li><strong>Customer</strong>: View catalog, build carts, configure product custom ingredients, pin delivery addresses, and track real-time dispatches.</li>
                  </ul>
                </div>
              </div>

              {/* Add Administrators Card */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Lock className="color-orange" size={22} />
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Delegate Admin Authority</h4>
                </div>

                <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Master Administrator"
                      className="form-input text-sm"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. admin@burgerhub.com"
                      className="form-input text-sm"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Login Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="form-input text-sm"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '5px' }}>
                    <Plus size={16} /> Grant Admin Access
                  </button>
                </form>

                <h5 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Active Administrators ({admins.length})</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {admins.map(adm => (
                    <div 
                      key={adm.email} 
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
                        <strong style={{ display: 'block', fontSize: '13px' }}>{adm.name}</strong>
                        <span className="text-xs text-muted">{adm.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

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

              {/* Explicit Staff Delegation Deck */}
              {selectedOrder.status !== 'delivered' && (
                <div className="details-section-box mt-4 border-t pt-3">
                  <h4>Staff Assignment Deck</h4>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px', alignItems: 'center' }}>
                    {selectedOrder.status === 'preparing' && (
                      <div style={{ flex: 1 }}>
                        <label className="text-xs text-muted mb-1 block">Delegate a Kitchen Chef:</label>
                        <select 
                          onChange={(e) => handleAssignChef(selectedOrder.id, e.target.value)}
                          defaultValue=""
                          className="form-input text-sm"
                          style={{ width: '100%', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                        >
                          <option value="" disabled>Select Chef...</option>
                          {chefs.map(chef => (
                            <option key={chef.id} value={chef.id} disabled={chef.status === 'busy'}>
                              {chef.name} ({chef.status.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {selectedOrder.status === 'cooking' && (
                      <div style={{ flex: 1 }}>
                        <label className="text-xs text-muted mb-1 block">Delegate a Courier Rider:</label>
                        <select 
                          onChange={(e) => handleAssignRider(selectedOrder.id, e.target.value)}
                          defaultValue=""
                          className="form-input text-sm"
                          style={{ width: '100%', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                        >
                          <option value="" disabled>Select Rider...</option>
                          {riders.map(rider => (
                            <option key={rider.id} value={rider.id} disabled={rider.status === 'busy'}>
                              {rider.name} ({rider.status.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedOrder.status === 'delivering' && (
                      <div style={{ flex: 1 }}>
                        <span className="text-xs text-muted">Assigned Rider:</span>
                        <strong style={{ display: 'block', color: 'var(--accent-green)' }}>
                          {selectedOrder.assignedRiderName || 'Courier Rider'} (In Transit)
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="admin-modal-overlay" onClick={() => setEditingStaff(null)}>
          <form className="admin-modal-container card animate-admin-modal-enter" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveStaffEdit}>
            <div className="modal-header border-b pb-3 mb-3">
              <div>
                <span className="text-xs text-muted">ID: {editingStaff.id}</span>
                <h3>Edit Staff Credentials</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setEditingStaff(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="details-section-box" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label className="form-label mb-1 block">Staff Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={editStaffName}
                    onChange={(e) => setEditStaffName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label mb-1 block">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="form-input" 
                    value={editStaffEmail}
                    onChange={(e) => setEditStaffEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label mb-1 block">Staff Password</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={editStaffPassword}
                    onChange={(e) => setEditStaffPassword(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="form-label mb-1 block">Role</label>
                    <select 
                      className="form-input" 
                      value={editStaffRole} 
                      onChange={(e) => setEditStaffRole(e.target.value as 'chef' | 'rider')}
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px' }}
                    >
                      <option value="chef">Chef</option>
                      <option value="rider">Rider</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label mb-1 block">Status</label>
                    <select 
                      className="form-input" 
                      value={editStaffStatus} 
                      onChange={(e) => setEditStaffStatus(e.target.value as 'idle' | 'busy')}
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px' }}
                    >
                      <option value="idle">Idle</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-t pt-3 mt-3" style={{ display: 'flex', gap: '15px' }}>
              <button type="button" className="btn btn-secondary w-full" onClick={() => setEditingStaff(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary w-full">
                Save Staff Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <form className="admin-modal-container card animate-admin-modal-enter" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveUserEdit} style={{ maxWidth: '650px' }}>
            <div className="modal-header border-b pb-3 mb-3">
              <div>
                <span className="text-xs text-muted">ID: {editingUser.id}</span>
                <h3>Edit User Profile</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-content" style={{ maxHeight: '70vh' }}>
              <div className="details-section-box" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="form-label mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label mb-1 block">Phone Number</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={editUserPhone}
                      onChange={(e) => setEditUserPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="form-label mb-1 block">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input" 
                      value={editUserEmail}
                      onChange={(e) => setEditUserEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label mb-1 block">Password</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={editUserPassword}
                      onChange={(e) => setEditUserPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '10px' }}>
                  <label className="form-label mb-2 block" style={{ color: 'var(--secondary)' }}>Select Map Coordinates</label>
                  <RwandaMap onLocationSelected={(addr: string, cityStr: string) => {
                    setEditUserAddress(addr);
                    setEditUserCity(`${cityStr} District, Rwanda`);
                    setEditUserZipCode('250');
                  }} />
                </div>

                <div>
                  <label className="form-label mb-1 block">Pinned Address Details</label>
                  <input 
                    type="text" 
                    required 
                    readOnly
                    className="form-input read-only-input" 
                    value={editUserAddress}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="form-label mb-1 block">District / City</label>
                    <input 
                      type="text" 
                      required 
                      readOnly
                      className="form-input read-only-input" 
                      value={editUserCity}
                    />
                  </div>
                  <div>
                    <label className="form-label mb-1 block">Postal Code</label>
                    <input 
                      type="text" 
                      required 
                      readOnly
                      className="form-input read-only-input" 
                      value={editUserZipCode}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-t pt-3 mt-3" style={{ display: 'flex', gap: '15px' }}>
              <button type="button" className="btn btn-secondary w-full" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary w-full">
                Save User Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
