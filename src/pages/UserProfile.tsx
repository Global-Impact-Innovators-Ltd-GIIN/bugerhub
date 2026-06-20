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
  const [addressComponents, setAddressComponents] = useState<any>(null);
  const [password, setPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [coins, setCoins] = useState(0);
  const [coinsHistory, setCoinsHistory] = useState<any[]>([]);

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

      const coinsKey = `burgerhub_coins_${userObj.email.toLowerCase()}`;
      const historyKey = `burgerhub_coins_history_${userObj.email.toLowerCase()}`;
      setCoins(Number(localStorage.getItem(coinsKey) || '0'));
      setCoinsHistory(JSON.parse(localStorage.getItem(historyKey) || '[]'));

      const dbUsers = await fetchUsers();
      const matchingUser = dbUsers.find((u: any) => u.id === userObj.id);
      if (matchingUser) {
        setPassword(matchingUser.password || '');
      }
    };
    loadProfileData();
  }, [navigate]);

  const handleLocationSelected = (fullAddr: string, selectedDistrict: string, _coordsStr: string, details?: any) => {
    setAddress(fullAddr);
    setCity(`${selectedDistrict} District, Rwanda`);
    setZipCode('250');
    if (details) {
      setAddressComponents(details);
    }
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

  const getTier = (pts: number) => {
    if (pts >= 10000) return { tier: 'Platinum', next: 'Max Tier reached!', target: 10000 };
    if (pts >= 5000) return { tier: 'Gold', next: 'Platinum', target: 10000 };
    if (pts >= 2000) return { tier: 'Silver', next: 'Gold', target: 5000 };
    return { tier: 'Bronze', next: 'Silver', target: 2000 };
  };

  const { tier: userTier, next: nextTier, target: tierTarget } = getTier(coins);

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

                {addressComponents && (
                  <div className="pinned-location-details-section animate-fade-in" style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: 'rgba(255, 69, 0, 0.03)',
                    border: '1px solid rgba(255, 69, 0, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📍 Verified Address Breakdown
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 15px' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Province:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.province}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>City/District:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.city}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Cell:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.cell || '-'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Village:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.village || '-'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Community:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.community || '-'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Street:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.street || '-'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>House No:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.houseNumber || '-'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Country:</span> <strong style={{ color: 'var(--text-primary)' }}>{addressComponents.country}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary mt-3">
                Save Account Updates
              </button>
            </form>
          </div>

          {/* Right Side Column: Loyalty Program & Order History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* BurgerCoin Loyalty Card */}
            <div className="profile-card card loyalty-reward-card" style={{
              background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.03) 0%, rgba(251, 191, 36, 0.03) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div className="profile-card-header" style={{ borderBottom: '1px solid rgba(251, 191, 36, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🪙</span>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '15px' }}>BurgerCoin Loyalty Club</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get 5% cashback on all orders</span>
                  </div>
                </div>
                <span className={`tier-badge tier-${userTier.toLowerCase()}`} style={{
                  background: userTier === 'Platinum' ? 'linear-gradient(90deg, #e5e7eb, #9ca3af)' :
                              userTier === 'Gold' ? 'linear-gradient(90deg, #fbbf24, #d97706)' :
                              userTier === 'Silver' ? 'linear-gradient(90deg, #9ca3af, #4b5563)' :
                              'linear-gradient(90deg, #b45309, #78350f)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '100px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {userTier} Tier
                </span>
              </div>

              <div style={{ padding: '16px 0 0 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--primary)' }}>
                    {coins.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>BurgerCoins</span>
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Equivalent to {formatRWF(coins)}
                  </p>
                </div>

                {/* Progress to next tier */}
                {userTier !== 'Platinum' && (
                  <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <span>Next Level: <strong>{nextTier}</strong></span>
                      <span>{coins} / {tierTarget} Coins</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #fbbf24)', width: `${Math.min(100, (coins / tierTarget) * 100)}%`, borderRadius: '100px' }}></div>
                    </div>
                  </div>
                )}

                {/* Coins Transaction History */}
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Recent Coins Activity
                  </h5>
                  <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {coinsHistory.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '15px 0' }}>
                        No transactions recorded yet.
                      </p>
                    ) : (
                      coinsHistory.map((tx: any) => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                              {tx.type === 'redeemed_and_earned' ? 'Purchase Redemption' : 'Order Cashback'}
                            </strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{tx.date} • {tx.id}</span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '11px' }}>
                            {tx.redeemed > 0 && (
                              <span style={{ color: 'var(--accent-red)', display: 'block', fontWeight: 600 }}>-{tx.redeemed.toLocaleString()} Coins</span>
                            )}
                            <span style={{ color: 'var(--accent-green)', display: 'block', fontWeight: 600 }}>+{tx.earned.toLocaleString()} Coins</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
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
    </div>
  );
};
