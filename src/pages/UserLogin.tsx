import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, UserCheck, Eye, EyeOff } from 'lucide-react';
import { fetchUsers, fetchAdmins, fetchChefs, fetchRiders } from '../utils/supabaseDb';
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
    // Check if any role is already logged in, redirect them appropriately
    const adminSession = localStorage.getItem('burgerhub_active_admin') || sessionStorage.getItem('burgerhub_active_admin');
    if (adminSession) {
      navigate('/admin/dashboard');
      return;
    }

    const chefSession = localStorage.getItem('burgerhub_active_chef') || sessionStorage.getItem('burgerhub_active_chef');
    if (chefSession) {
      navigate('/chef/dashboard');
      return;
    }

    const riderSession = localStorage.getItem('burgerhub_active_rider') || sessionStorage.getItem('burgerhub_active_rider');
    if (riderSession) {
      navigate('/rider/dashboard');
      return;
    }

    const userSession = localStorage.getItem('burgerhub_active_user') || sessionStorage.getItem('burgerhub_active_user');
    if (userSession) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.toLowerCase().trim();

    // 1. Check Admin Credentials
    const admins = await fetchAdmins();
    const matchedAdmin = admins.find((a: any) => a.email.toLowerCase() === trimmedEmail && a.password === password);

    if (matchedAdmin) {
      const adminSessionData = JSON.stringify({ email: matchedAdmin.email, name: matchedAdmin.name });
      
      // Prevent security leaks - clear other role sessions
      localStorage.removeItem('burgerhub_active_user');
      sessionStorage.removeItem('burgerhub_active_user');
      localStorage.removeItem('burgerhub_active_chef');
      sessionStorage.removeItem('burgerhub_active_chef');
      localStorage.removeItem('burgerhub_active_rider');
      sessionStorage.removeItem('burgerhub_active_rider');

      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_admin', adminSessionData);
        sessionStorage.removeItem('burgerhub_active_admin');
      } else {
        sessionStorage.setItem('burgerhub_active_admin', adminSessionData);
        localStorage.removeItem('burgerhub_active_admin');
      }
      
      navigate('/admin/dashboard');
      window.location.reload(); // Refresh to update header state
      return;
    }

    // 2. Check Chef Credentials
    const chefs = await fetchChefs();
    const matchedChef = chefs.find((c: any) => c.email.toLowerCase() === trimmedEmail && c.password === password);

    if (matchedChef) {
      const chefSessionData = JSON.stringify(matchedChef);

      // Prevent security leaks - clear other role sessions
      localStorage.removeItem('burgerhub_active_user');
      sessionStorage.removeItem('burgerhub_active_user');
      localStorage.removeItem('burgerhub_active_admin');
      sessionStorage.removeItem('burgerhub_active_admin');
      localStorage.removeItem('burgerhub_active_rider');
      sessionStorage.removeItem('burgerhub_active_rider');

      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_chef', chefSessionData);
        sessionStorage.removeItem('burgerhub_active_chef');
      } else {
        sessionStorage.setItem('burgerhub_active_chef', chefSessionData);
        localStorage.removeItem('burgerhub_active_chef');
      }
      
      navigate('/chef/dashboard');
      window.location.reload(); // Refresh to update header state
      return;
    }

    // 3. Check Rider Credentials
    const riders = await fetchRiders();
    const matchedRider = riders.find((r: any) => r.email.toLowerCase() === trimmedEmail && r.password === password);

    if (matchedRider) {
      const riderSessionData = JSON.stringify(matchedRider);

      // Prevent security leaks - clear other role sessions
      localStorage.removeItem('burgerhub_active_user');
      sessionStorage.removeItem('burgerhub_active_user');
      localStorage.removeItem('burgerhub_active_admin');
      sessionStorage.removeItem('burgerhub_active_admin');
      localStorage.removeItem('burgerhub_active_chef');
      sessionStorage.removeItem('burgerhub_active_chef');

      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_rider', riderSessionData);
        sessionStorage.removeItem('burgerhub_active_rider');
      } else {
        sessionStorage.setItem('burgerhub_active_rider', riderSessionData);
        localStorage.removeItem('burgerhub_active_rider');
      }
      
      navigate('/rider/dashboard');
      window.location.reload(); // Refresh to update header state
      return;
    }

    // 4. Check Customer/User Credentials
    const users = await fetchUsers();
    const matchedUser = users.find((u: any) => u.email.toLowerCase() === trimmedEmail && u.password === password);

    if (matchedUser) {
      const { password: _, ...sessionUser } = matchedUser;

      // Prevent security leaks - clear administrative sessions
      localStorage.removeItem('burgerhub_active_admin');
      sessionStorage.removeItem('burgerhub_active_admin');
      localStorage.removeItem('burgerhub_active_chef');
      sessionStorage.removeItem('burgerhub_active_chef');
      localStorage.removeItem('burgerhub_active_rider');
      sessionStorage.removeItem('burgerhub_active_rider');

      if (keepMeLoggedIn) {
        localStorage.setItem('burgerhub_active_user', JSON.stringify(sessionUser));
        sessionStorage.removeItem('burgerhub_active_user');
      } else {
        sessionStorage.setItem('burgerhub_active_user', JSON.stringify(sessionUser));
        localStorage.removeItem('burgerhub_active_user');
      }
      
      navigate(redirectPath);
      window.location.reload(); // Refresh to update header state
      return;
    }

    setError('Invalid email or password. Please use correct credentials to access your specific portal.');
  };

  return (
    <div className="admin-auth-page animate-fade-in">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-icon-box">
            <UserCheck size={28} className="color-primary animate-float" />
          </div>
          
          <h2>BURGERHUB SIGN IN</h2>
          <p className="auth-subtitle">Use your credentials to sign in and access your portal dashboard</p>

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
                  placeholder="customer@burgerhub.com, admin@burgerhub.com..."
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
              Sign In
            </button>

            <div className="auth-footer-links mt-4">
              <span>Don't have a customer account? </span>
              <Link to={`/signup${location.search}`} className="orange-link font-semibold">Sign Up Here</Link>
            </div>

            <div className="demo-credentials-helper mt-4" style={{ textAlign: 'left', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontWeight: 700, marginBottom: '6px' }}>💡 Demo Sandbox logins:</p>
              <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <li><strong>Admin</strong>: admin@burgerhub.com (admin123)</li>
                <li><strong>Chef</strong>: chef1@burgerhub.com (chef123)</li>
                <li><strong>Rider</strong>: rider1@burgerhub.com (rider123)</li>
                <li><strong>Customer</strong>: customer@burgerhub.com (customer123)</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
