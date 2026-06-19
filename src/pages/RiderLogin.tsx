import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, Bike, Eye, EyeOff } from 'lucide-react';
import { fetchRiders } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const RiderLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Seed default riders if none exist
    const existing = localStorage.getItem('burgerhub_riders');
    if (!existing) {
      const defaultRiders = [
        { id: 'R1', name: 'Rider Jean', email: 'rider1@burgerhub.com', password: 'rider123', role: 'rider', status: 'busy', assignedOrderId: 'BH-248910' },
        { id: 'R2', name: 'Rider Claude', email: 'rider2@burgerhub.com', password: 'rider123', role: 'rider', status: 'idle' },
        { id: 'R3', name: 'Rider Diane', email: 'rider3@burgerhub.com', password: 'rider123', role: 'rider', status: 'idle' }
      ];
      localStorage.setItem('burgerhub_riders', JSON.stringify(defaultRiders));
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const riders = await fetchRiders();
    const matchedRider = riders.find((r: any) => r.email.toLowerCase() === email.toLowerCase().trim() && r.password === password);

    if (matchedRider) {
      const riderSessionData = JSON.stringify(matchedRider);

      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_rider', riderSessionData);
        sessionStorage.removeItem('burgerhub_active_rider');
      } else {
        sessionStorage.setItem('burgerhub_active_rider', riderSessionData);
        localStorage.removeItem('burgerhub_active_rider');
      }
      
      navigate('/rider/dashboard');
    } else {
      setError('Invalid rider email or password. Please use pre-configured logins.');
    }
  };

  return (
    <div className="admin-auth-page staff-auth-page animate-fade-in">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-icon-box staff-icon-box rider-box-accent">
            <Bike size={28} className="color-primary animate-float" />
          </div>
          
          <h2>RIDER COURIER PORTAL</h2>
          <p className="auth-subtitle">Log in to view assigned delivery pins, access customer contact info, and fulfill orders.</p>

          <form onSubmit={handleLogin} className="auth-form mt-4">
            {error && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Rider Email</label>
              <div className="card-input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="rider1@burgerhub.com"
                  className="form-input auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-icon"><Mail size={16} /></span>
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">Password</label>
              <div className="card-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="form-input auth-input"
                  style={{ paddingRight: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-icon"><Lock size={16} /></span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Keep me logged in checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
              <input 
                type="checkbox" 
                id="keepMeLoggedIn"
                checked={keepMeLoggedIn}
                onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="keepMeLoggedIn" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Keep me logged in
              </label>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn mt-4">
              Access Deliveries
            </button>

            <div className="demo-credentials-helper mt-4">
              <p>💡 **Rider Credentials (Sandbox):**</p>
              <p>Email: <span className="font-orange">rider1@burgerhub.com</span></p>
              <p>Pass: <span className="font-orange">rider123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
