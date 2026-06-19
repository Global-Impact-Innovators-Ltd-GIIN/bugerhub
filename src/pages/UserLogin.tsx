import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, UserCheck, Eye, EyeOff } from 'lucide-react';
import { fetchUsers } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';

export const UserLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect path (e.g. if redirected from checkout)
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  useEffect(() => {
    // Seed default customer if none exists
    const existing = localStorage.getItem('burgerhub_users');
    if (!existing) {
      const defaultUsers = [
        {
          id: 'U1',
          name: 'John Doe',
          email: 'customer@burgerhub.com',
          password: 'customer123',
          phone: '+250 788 123 456',
          address: 'Kigali Province, Nyarugenge District (Map Pin: 1.9441° S, 30.0619° E)',
          city: 'Nyarugenge District, Rwanda',
          zipCode: '250'
        }
      ];
      localStorage.setItem('burgerhub_users', JSON.stringify(defaultUsers));
    }

    // Check active session across both local and session storage
    const activeSession = localStorage.getItem('burgerhub_active_user') || sessionStorage.getItem('burgerhub_active_user');
    if (activeSession) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = await fetchUsers();
    const matchedUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);

    if (matchedUser) {
      // Remove password for security in session storage
      const { password: _, ...sessionUser } = matchedUser;
      
      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_user', JSON.stringify(sessionUser));
        sessionStorage.removeItem('burgerhub_active_user');
      } else {
        sessionStorage.setItem('burgerhub_active_user', JSON.stringify(sessionUser));
        localStorage.removeItem('burgerhub_active_user');
      }
      
      navigate(redirectPath);
    } else {
      setError('Invalid email or password. Please use pre-configured details or sign up.');
    }
  };

  return (
    <div className="admin-auth-page animate-fade-in">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-icon-box">
            <UserCheck size={28} className="color-primary animate-float" />
          </div>
          
          <h2>CUSTOMER LOGIN</h2>
          <p className="auth-subtitle">Log in to your account for seamless purchases and order tracking</p>

          <form onSubmit={handleLogin} className="auth-form mt-4">
            {error && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="card-input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="customer@burgerhub.com"
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
              Log In
            </button>

            <div className="auth-footer-links mt-4">
              <span>Don't have an account? </span>
              <Link to={`/signup${location.search}`} className="orange-link font-semibold">Sign Up Here</Link>
            </div>

            <div className="demo-credentials-helper mt-4">
              <p>💡 **Customer Sandbox Credentials:**</p>
              <p>Email: <span className="font-orange">customer@burgerhub.com</span></p>
              <p>Pass: <span className="font-orange">customer123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
