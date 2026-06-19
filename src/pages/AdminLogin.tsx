import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import { fetchAdmins } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Seed default admin if none exists
    const existing = localStorage.getItem('burgerhub_admins');
    if (!existing) {
      const defaultAdmins = [{ email: 'admin@burgerhub.com', password: 'admin123', name: 'Master Admin' }];
      localStorage.setItem('burgerhub_admins', JSON.stringify(defaultAdmins));
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const admins = await fetchAdmins();
    const matchedAdmin = admins.find((a: any) => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password);

    if (matchedAdmin) {
      const adminSessionData = JSON.stringify({ email: matchedAdmin.email, name: matchedAdmin.name });
      
      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_admin', adminSessionData);
        sessionStorage.removeItem('burgerhub_active_admin');
      } else {
        sessionStorage.setItem('burgerhub_active_admin', adminSessionData);
        localStorage.removeItem('burgerhub_active_admin');
      }
      
      navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password. Please use the sandbox demo credentials.');
    }
  };

  return (
    <div className="admin-auth-page animate-fade-in">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-icon-box">
            <KeyRound size={28} className="color-primary animate-float" />
          </div>
          
          <h2>ADMIN PORTAL</h2>
          <p className="auth-subtitle">Access the kitchen orders control and staff fleet managers</p>

          <form onSubmit={handleLogin} className="auth-form mt-4">
            {error && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <div className="card-input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="admin@burgerhub.com"
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
              Access Dashboard
            </button>

            <div className="auth-footer-links mt-4">
              <span>Don't have an admin account? </span>
              <Link to="/admin/signup" className="orange-link font-semibold">Sign Up Here</Link>
            </div>

            <div className="demo-credentials-helper mt-4">
              <p>💡 **Demo Sandbox Access:**</p>
              <p>User: <span className="font-orange">admin@burgerhub.com</span></p>
              <p>Pass: <span className="font-orange">admin123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
