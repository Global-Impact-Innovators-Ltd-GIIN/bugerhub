import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, Check, MapPin, ShieldCheck, ShoppingBag, Gift
} from 'lucide-react';
import { RwandaMap } from '../components/RwandaMap';
import { useCart } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import { fetchUsers, saveUser } from '../utils/supabaseDb';
import { formatRWF } from '../utils/pricing';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/UserAccount.css';

export const UserProfile: React.FC = () => {
  const { orders, trackOrder } = useCart();
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

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'rewards' | 'history'>('profile');

  // Lucky Spin Wheel Game States
  const [spinning, setSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [winMessage, setWinMessage] = useState('');

  const wheelSegments = [
    { label: '+50 Coins', val: 50, color: 'rgba(255, 69, 0, 0.8)' },
    { label: '+150 Coins', val: 150, color: 'rgba(251, 191, 36, 0.8)' },
    { label: '+100 Coins', val: 100, color: 'rgba(34, 197, 94, 0.8)' },
    { label: '+250 Coins', val: 250, color: 'rgba(59, 130, 246, 0.8)' },
    { label: '+200 Coins', val: 200, color: 'rgba(168, 85, 247, 0.8)' },
    { label: '+300 Coins', val: 300, color: 'rgba(236, 72, 153, 0.8)' },
    { label: '+500 Coins', val: 500, color: 'rgba(20, 184, 166, 0.8)' },
    { label: '+400 Coins', val: 400, color: 'rgba(239, 68, 68, 0.8)' }
  ];

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

      const emailLower = userObj.email.toLowerCase();
      const coinsKey = `burgerhub_coins_${emailLower}`;
      const historyKey = `burgerhub_coins_history_${emailLower}`;
      setCoins(Number(localStorage.getItem(coinsKey) || '0'));
      setCoinsHistory(JSON.parse(localStorage.getItem(historyKey) || '[]'));

      // Check daily spin status
      const spinDateKey = `burgerhub_wheel_last_spin_${emailLower}`;
      const todayStr = new Date().toDateString();
      if (localStorage.getItem(spinDateKey) === todayStr) {
        setHasSpunToday(true);
      }

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
    window.location.reload();
  };

  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {}
  };

  const playWinChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {}
  };

  const triggerSlowTicks = (currentDelay: number, endLimit: number) => {
    if (currentDelay > endLimit) return;
    playTickSound();
    setTimeout(() => {
      triggerSlowTicks(currentDelay * 1.18, endLimit);
    }, currentDelay);
  };

  const handleSpinWheel = () => {
    if (spinning || hasSpunToday) return;

    setSpinning(true);
    setWinMessage('');

    // Choose a random winning segment index
    const winIdx = Math.floor(Math.random() * 8);
    const rewardSegment = wheelSegments[winIdx];

    // Compute target angle: rotate 10 times (3600 deg) + offset to align winning segment to top marker
    // Sector winIdx spans from: winIdx * 45 deg to (winIdx + 1) * 45 deg
    // Middle of sector is: winIdx * 45 + 22.5
    // Top position corresponds to rotation of 360 - middle
    const targetAngle = 3600 + (360 - (winIdx * 45) - 22.5);
    setRotationAngle(targetAngle);

    // Start synthesized slow ticks audio
    triggerSlowTicks(45, 900);

    setTimeout(() => {
      // Completed spin rotation
      setSpinning(false);
      playWinChime();

      // Update User Loyalty Coins
      const emailLower = user.email.toLowerCase();
      const coinsKey = `burgerhub_coins_${emailLower}`;
      const historyKey = `burgerhub_coins_history_${emailLower}`;
      const spinDateKey = `burgerhub_wheel_last_spin_${emailLower}`;

      const newBalance = coins + rewardSegment.val;
      const newTx = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString() + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'cashback',
        earned: rewardSegment.val,
        redeemed: 0
      };

      const updatedHistory = [newTx, ...coinsHistory];

      setCoins(newBalance);
      setCoinsHistory(updatedHistory);
      setHasSpunToday(true);
      setWinMessage(`🎉 Spectacular! You won +${rewardSegment.val} BurgerCoins!`);

      localStorage.setItem(coinsKey, String(newBalance));
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      localStorage.setItem(spinDateKey, new Date().toDateString());
    }, 4000); // 4 seconds spin duration
  };

  const handleResetSpinLimit = () => {
    // Developer tester convenience function
    const emailLower = user.email.toLowerCase();
    const spinDateKey = `burgerhub_wheel_last_spin_${emailLower}`;
    localStorage.removeItem(spinDateKey);
    setHasSpunToday(false);
    setWinMessage('');
    setRotationAngle(0);
    alert('Daily spin limit reset! You can now spin the wheel again.');
  };

  const handleTrackRider = (order: Order) => {
    trackOrder(order);
    navigate('/tracking');
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
    <div className="admin-dashboard-layout animate-fade-in">
      
      {/* Fixed Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo" style={{ background: 'var(--primary)' }}>C</div>
          <span className="admin-sidebar-brand-text">MY<span className="color-orange">LOUNGE</span></span>
        </div>

        <div className="admin-sidebar-user" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div className="admin-sidebar-avatar" style={{ background: 'rgba(255, 69, 0, 0.1)', color: 'var(--primary)' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{user.name}</span>
            <span className="admin-sidebar-user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              🏅 {userTier} Tier Member
            </span>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <button 
            className={`admin-sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ 
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
              background: activeTab === 'profile' ? 'rgba(255, 69, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'profile' ? 'var(--primary)' : 'transparent'
            }}
          >
            <User size={16} /> Personal Profile
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
            style={{ 
              color: activeTab === 'address' ? 'var(--primary)' : 'var(--text-secondary)',
              background: activeTab === 'address' ? 'rgba(255, 69, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'address' ? 'var(--primary)' : 'transparent'
            }}
          >
            <MapPin size={16} /> Pinned Address
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
            style={{ 
              color: activeTab === 'rewards' ? 'var(--primary)' : 'var(--text-secondary)',
              background: activeTab === 'rewards' ? 'rgba(255, 69, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'rewards' ? 'var(--primary)' : 'transparent'
            }}
          >
            <Gift size={16} /> Coins Loyalty rewards
          </button>
          <button 
            className={`admin-sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ 
              color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
              background: activeTab === 'history' ? 'rgba(255, 69, 0, 0.08)' : 'transparent',
              borderLeftColor: activeTab === 'history' ? 'var(--primary)' : 'transparent'
            }}
          >
            <ShoppingBag size={16} /> Purchase History ({myOrders.length})
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-sidebar-logout-btn">
            <LogOut size={16} /> Logout Lounge
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main-content">
        
        {/* Tab 1: Profile Settings Form */}
        {activeTab === 'profile' && (
          <div className="profile-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Personal Profile Settings</h3>
            
            <div className="profile-card card" style={{ background: 'var(--bg-card)', padding: '30px' }}>
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

                <div className="form-group-row mt-3">
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

                <button type="submit" className="btn btn-primary mt-4" style={{ padding: '12px 24px', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                  Save Account Updates
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Pinned Coordinates Address */}
        {activeTab === 'address' && (
          <div className="address-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Pinned Delivery Coordinates</h3>
            
            <div className="profile-card card" style={{ background: 'var(--bg-card)', padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label mb-2 block" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                  Select Map Coordinates Location Pin
                </label>
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

              <div className="form-group-row mt-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                  marginTop: '20px',
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

              <button onClick={handleUpdateProfile} className="btn btn-primary mt-4" style={{ padding: '12px 24px', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                Confirm Pin & Coordinates Address
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Rewards Lounge & Spin Wheel Game */}
        {activeTab === 'rewards' && (
          <div className="rewards-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">BurgerCoin Loyalty rewards lounge</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Balance & spin game */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="card loyalty-reward-card" style={{
                  background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.03) 0%, rgba(251, 191, 36, 0.03) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(251, 191, 36, 0.1)', paddingBottom: '14px', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🪙 Loyalty Balance Metrics
                    </h4>
                    <span className="user-badge" style={{ background: 'var(--secondary)', color: '#fff' }}>{userTier} tier</span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Balance</span>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', margin: '4px 0 0 0' }}>{coins.toLocaleString()} BurgerCoins</h2>
                    <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Equivalent to {formatRWF(coins)} cash value</p>
                  </div>

                  {userTier !== 'Platinum' && (
                    <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        <span>Next Level Tier: <strong>{nextTier}</strong></span>
                        <span>{coins} / {tierTarget} Coins</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #fbbf24)', width: `${Math.min(100, (coins / tierTarget) * 100)}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coins Transactions list */}
                <div className="card" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: 700 }}>Coins Transaction Activity Log</h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {coinsHistory.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No transactions recorded yet.</p>
                    ) : (
                      coinsHistory.map((tx: any) => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                              {tx.type === 'redeemed_and_earned' ? 'Purchase Redemption' : 'Daily Spin / Cashback'}
                            </strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{tx.date} • {tx.id}</span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '12px' }}>
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

              {/* Spin wheel visual element */}
              <div className="card" style={{ padding: '28px', textAlign: 'center', background: 'var(--bg-card)' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>🎡 Daily Lucky Spin the Wheel</h4>
                <p className="text-xs text-muted mb-4">Spin the BurgerHub wheel once per day to claim randomized coin bonuses!</p>

                {winMessage && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.25)', color: 'var(--accent-green)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '15px', fontWeight: 700, fontSize: '14px' }}>
                    {winMessage}
                  </div>
                )}

                <div style={{ position: 'relative', width: '220px', height: '220px', margin: '20px auto 25px auto' }}>
                  {/* Outer pointer pin */}
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '20px solid var(--primary)',
                    zIndex: 10
                  }}></div>

                  {/* Wheel canvas SVG */}
                  <svg 
                    viewBox="0 0 200 200" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      transform: `rotate(${rotationAngle}deg)`, 
                      transition: spinning ? 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none',
                      borderRadius: '50%',
                      boxShadow: '0 0 25px rgba(255, 69, 0, 0.25)',
                      border: '6px solid var(--border)'
                    }}
                  >
                    {wheelSegments.map((seg, idx) => {
                      // Draw pizza slices paths
                      const angle = idx * 45;
                      const radStart = (angle - 90) * Math.PI / 180;
                      const radEnd = (angle + 45 - 90) * Math.PI / 180;
                      const x1 = 100 + 100 * Math.cos(radStart);
                      const y1 = 100 + 100 * Math.sin(radStart);
                      const x2 = 100 + 100 * Math.cos(radEnd);
                      const y2 = 100 + 100 * Math.sin(radEnd);
                      
                      const pathData = `M 100,100 L ${x1},${y1} A 100,100 0 0,1 ${x2},${y2} Z`;
                      
                      // Label coordinates
                      const labelRad = (angle + 22.5 - 90) * Math.PI / 180;
                      const lx = 100 + 65 * Math.cos(labelRad);
                      const ly = 100 + 65 * Math.sin(labelRad);
                      const labelRotate = angle + 22.5;

                      return (
                        <g key={idx}>
                          <path d={pathData} fill={seg.color} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                          <text 
                            x={lx} 
                            y={ly} 
                            fill="#fff" 
                            fontSize="8" 
                            fontWeight="bold" 
                            textAnchor="middle"
                            transform={`rotate(${labelRotate}, ${lx}, ${ly})`}
                          >
                            {seg.val}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="100" cy="100" r="15" fill="#121215" stroke="#fbbf24" strokeWidth="2" />
                  </svg>

                  {/* Core shiny center button */}
                  <button 
                    onClick={handleSpinWheel}
                    disabled={spinning || hasSpunToday}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)',
                      color: '#000',
                      border: '2px solid #fff',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: (spinning || hasSpunToday) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      opacity: (spinning || hasSpunToday) ? 0.6 : 1,
                      zIndex: 8
                    }}
                  >
                    SPIN
                  </button>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={handleSpinWheel} 
                    className="btn btn-primary w-full"
                    disabled={spinning || hasSpunToday}
                    style={{ background: 'var(--primary)', borderColor: 'var(--primary)', padding: '12px' }}
                  >
                    {spinning ? '🌀 Spinning Wheel...' : hasSpunToday ? 'Next spin ready tomorrow!' : '🎁 Claim Lucky Spin'}
                  </button>
                  
                  {hasSpunToday && (
                    <div style={{ marginTop: '15px' }}>
                      <button 
                        onClick={handleResetSpinLimit}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        🔧 Reset Daily Spin Limit (Developer Test)
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Purchase History */}
        {activeTab === 'history' && (
          <div className="history-section animate-fade-in">
            <h3 className="section-title text-gradient mb-4">Your Purchase History ({myOrders.length})</h3>
            
            <div className="profile-orders-list" style={{ maxHeight: 'none' }}>
              {myOrders.length === 0 ? (
                <div className="empty-column-placeholder" style={{ padding: '80px 20px', background: 'var(--bg-card)' }}>
                  <ShoppingBag size={48} className="muted-icon" style={{ opacity: 0.3 }} />
                  <p className="mt-3">No orders found. Add burgers to your cart and place your first order!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myOrders.map(order => (
                    <div className="profile-order-card card" key={order.id} style={{ background: 'var(--bg-card)', padding: '24px' }}>
                      <div className="profile-order-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div>
                          <span className="order-id" style={{ fontSize: '15px', fontFamily: 'monospace' }}>{order.id}</span>
                          <span className="text-xs text-muted block mt-1">{order.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {order.status === 'delivering' && (
                            <button 
                              onClick={() => handleTrackRider(order)}
                              className="btn btn-primary text-xs"
                              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', borderColor: '#3b82f6' }}
                            >
                              🛰️ Track Rider Live
                            </button>
                          )}
                          <span className={`profile-order-status ${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="profile-order-items" style={{ fontSize: '14px' }}>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
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

                      <div className="profile-order-footer mt-4" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '13px' }}>
                        <span className="text-muted flex items-center gap-1">
                          <MapPin size={12} className="color-primary" /> 
                          <span className="text-truncate" style={{ maxWidth: '250px' }}>{order.details.address}</span>
                        </span>
                        <span className="profile-order-total" style={{ fontSize: '15px', fontWeight: 800 }}>
                          Total Paid:{' '}
                          {order.details.currency === 'USD'
                            ? `$${order.total.toFixed(2)}`
                            : formatRWF(order.total)
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
