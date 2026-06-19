import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ChefHat, Eye, EyeOff } from 'lucide-react';
import { fetchChefs } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const ChefLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Seed default chefs if none exist
    const existing = localStorage.getItem('burgerhub_chefs');
    if (!existing) {
      const defaultChefs = [
        { id: 'C1', name: 'Chef Kwizera', email: 'chef1@burgerhub.com', password: 'chef123', role: 'chef', status: 'idle' },
        { id: 'C2', name: 'Chef Mutoni', email: 'chef2@burgerhub.com', password: 'chef123', role: 'chef', status: 'busy', assignedOrderId: 'BH-582910' },
        { id: 'C3', name: 'Chef Gakire', email: 'chef3@burgerhub.com', password: 'chef123', role: 'chef', status: 'idle' }
      ];
      localStorage.setItem('burgerhub_chefs', JSON.stringify(defaultChefs));
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const chefs = await fetchChefs();
    const matchedChef = chefs.find((c: any) => c.email.toLowerCase() === email.toLowerCase().trim() && c.password === password);

    if (matchedChef) {
      const chefSessionData = JSON.stringify(matchedChef);

      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_chef', chefSessionData);
        sessionStorage.removeItem('burgerhub_active_chef');
      } else {
        sessionStorage.setItem('burgerhub_active_chef', chefSessionData);
        localStorage.removeItem('burgerhub_active_chef');
      }
      
      navigate('/chef/dashboard');
    } else {
      setError('Invalid chef email or password. Please use pre-configured logins.');
    }
  };

  return (
    <div className="admin-auth-page staff-auth-page animate-fade-in">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-icon-box staff-icon-box chef-box-accent">
            <ChefHat size={28} className="color-primary animate-float" />
          </div>
          
          <h2>KITCHEN CHEF PORTAL</h2>
          <p className="auth-subtitle">Log in to view active order queues, prepare burgers, and notify riders.</p>

          <form onSubmit={handleLogin} className="auth-form mt-4">
            {error && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Chef Email</label>
              <div className="card-input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="chef1@burgerhub.com"
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
              Enter Kitchen
            </button>

            <div className="demo-credentials-helper mt-4">
              <p>💡 **Chef Credentials (Sandbox):**</p>
              <p>Email: <span className="font-orange">chef1@burgerhub.com</span></p>
              <p>Pass: <span className="font-orange">chef123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
