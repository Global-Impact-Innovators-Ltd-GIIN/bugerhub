import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Check, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react';
import { RwandaMap } from '../components/RwandaMap';
import { useCart } from '../context/CartContext';
import { fetchUsers, saveUser } from '../utils/supabaseDb';
import { formatRWF } from '../utils/pricing';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/UserAccount.css';

export const UserProfile: React.FC = () => {
  const { orders } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Profile update form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [password, setPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      const session = localStorage.getItem('burgerhub_active_user') || sessionStorage.getItem('burgerhub_active_user');
      if (!session) {
        navigate('/login');
        return;
      }
      const userObj = JSON.parse(session);
      setUser(userObj);
      setName(userObj.name || '');
      setEmail(userObj.email || '');
      setPhone(userObj.phone || '');
      setAddress(userObj.address || '');
      setCity(userObj.city || '');
      setZipCode(userObj.zipCode || '');

      const dbUsers = await fetchUsers();
      const matchingUser = dbUsers.find((u: any) => u.id === userObj.id);
      if (matchingUser) {
        setPassword(matchingUser.password || '');
      }
    };
    loadProfileData();
  }, [navigate]);

  const handleLocationSelected = (fullAddr: string, selectedDistrict: string, _coordsStr: string) => {
    setAddress(fullAddr);
    setCity(`${selectedDistrict} District, Rwanda`);
    setZipCode('250');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!user) return;
    if (!address || !city) {
      setErrorMsg('Please pin a valid location on the interactive map.');
      return;
    }

    const usersList = await fetchUsers();
    
    // Check if email already taken by someone else
    const emailTaken = usersList.some((u: any) => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase().trim());
    if (emailTaken) {
      setErrorMsg('This email address is already taken by another account.');
      return;
    }

    const updatedUserObj = {
      id: user.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address,
      city: city,
      zipCode: zipCode,
      password: password
    };

    await saveUser(updatedUserObj);

    // Update session (omit password)
    const updatedSession = {
      id: user.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address,
      city: city,
      zipCode: zipCode
    };
    if (localStorage.getItem('burgerhub_active_user')) {
      localStorage.setItem('burgerhub_active_user', JSON.stringify(updatedSession));
    } else {
      sessionStorage.setItem('burgerhub_active_user', JSON.stringify(updatedSession));
    }
    setUser(updatedSession);
    
    setSuccessMsg('Profile and coordinates updated successfully!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('burgerhub_active_user');
    sessionStorage.removeItem('burgerhub_active_user');
    navigate('/');
    // Refresh page to clean state
    window.location.reload();
  };

  if (!user) return null;

  // Filter orders matching logged in user's email
  const myOrders = orders.filter(o => o.details.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="user-profile-page animate-fade-in">
      <div className="profile-header-bar">
        <div className="container header-flex-row">
          <div className="profile-branding">
            <span className="user-badge"><ShieldCheck size={14} /> My Account</span>
            <h2>Welcome back, <span className="text-gradient-orange">{user.name}</span></h2>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="container main-admin-container mt-5">
        <div className="profile-layout-grid">
          {/* Update Profile Form */}
          <div className="profile-card card">
            <div className="profile-card-header">
              <User className="color-orange" size={22} />
              <h4>Account Information</h4>
            </div>

            {successMsg && (
              <div className="success-toast">
                <Check size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldCheck size={18} className="color-primary" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Password</label>
                  <input 
                    type="password" 
                    required
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                <label className="form-label mb-2 block" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                  Pinned Delivery Coordinates
                </label>
                <div style={{ marginBottom: '15px' }}>
                  <RwandaMap onLocationSelected={handleLocationSelected} />
                </div>

                <div className="form-group">
                  <label className="form-label">Pinned Address Details</label>
                  <input 
                    type="text" 
                    readOnly
                    required
                    className="form-input read-only-input"
                    value={address}
                  />
                </div>

                <div className="form-group-row mt-3">
                  <div className="form-group">
                    <label className="form-label">District / City</label>
                    <input 
                      type="text" 
                      readOnly
                      required
                      className="form-input read-only-input"
                      value={city}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input 
                      type="text" 
                      readOnly
                      required
                      className="form-input read-only-input"
                      value={zipCode}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-3">
                Save Account Updates
              </button>
            </form>
          </div>

          {/* Order History */}
          <div className="profile-card card">
            <div className="profile-card-header">
              <ShoppingBag className="color-orange" size={22} />
              <h4>Order History ({myOrders.length})</h4>
            </div>

            <div className="profile-orders-list">
              {myOrders.length === 0 ? (
                <div className="empty-column-placeholder" style={{ padding: '60px 20px' }}>
                  <ShoppingBag size={48} className="muted-icon" />
                  <p>No orders found. Add burgers to your cart and make your first order!</p>
                </div>
              ) : (
                myOrders.map(order => (
                  <div className="profile-order-card" key={order.id}>
                    <div className="profile-order-header">
                      <div>
                        <span className="order-id" style={{ fontSize: '14px' }}>{order.id}</span>
                        <span className="text-xs text-muted block mt-1">{order.date}</span>
                      </div>
                      <span className={`profile-order-status ${order.status}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="profile-order-items">
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-muted">
                            {order.details.currency === 'USD' 
                              ? `$${(item.totalPrice * item.quantity).toFixed(2)}`
                              : formatRWF(item.totalPrice * item.quantity)
                            }
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="profile-order-footer">
                      <span className="text-muted flex items-center gap-1">
                        <MapPin size={12} className="color-primary" /> 
                        <span className="text-truncate" style={{ maxWidth: '200px' }}>{order.details.address}</span>
                      </span>
                      <span className="profile-order-total">
                        Total:{' '}
                        {order.details.currency === 'USD'
                          ? `$${order.total.toFixed(2)}`
                          : formatRWF(order.total)
                        }
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
