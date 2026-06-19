import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldAlert, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { fetchAdmins, saveAdmin } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';

export const AdminSignup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify invitation code
    if (inviteCode !== 'BURGERADMIN2026') {
      setError('Invalid admin invitation code. Please use the sandbox demo code.');
      return;
    }

    const admins = await fetchAdmins();
    const emailExists = admins.some((a: any) => a.email.toLowerCase() === email.toLowerCase().trim());

    if (emailExists) {
      setError('An admin account with this email address already exists.');
      return;
    }

    const newAdmin = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    };

    await saveAdmin(newAdmin);
    
    const adminSessionData = JSON.stringify({ email: newAdmin.email, name: newAdmin.name });

    if (keepMeLoggedIn) {
      localStorage.setItem('burgerhub_active_admin', adminSessionData);
      sessionStorage.removeItem('burgerhub_active_admin');
    } else {
      sessionStorage.setItem('burgerhub_active_admin', adminSessionData);
      localStorage.removeItem('burgerhub_active_admin');
    }
    
    navigate('/admin/dashboard');
  };

  return (
    <div className="admin-auth-page animate-fade-in">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-icon-box">
            <ShieldCheck size={28} className="color-primary animate-float" />
          </div>
          
          <h2>REGISTER ADMIN</h2>
          <p className="auth-subtitle">Register a new administrative account to control restaurant logs</p>

          <form onSubmit={handleSignup} className="auth-form mt-4">
            {error && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="form-input auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="input-icon"><User size={16} /></span>
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">Email Address</label>
              <div className="card-input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="dev.admin@burgerhub.com"
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

            <div className="form-group mt-3">
              <label className="form-label">Secret Invitation Code</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  required
                  placeholder="BURGERADMIN2026"
                  className="form-input auth-input"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <span className="input-icon"><KeyRound size={16} /></span>
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
              Register & Log In
            </button>

            <div className="auth-footer-links mt-4">
              <span>Already have an admin account? </span>
              <Link to="/admin/login" className="orange-link font-semibold">Log In Here</Link>
            </div>

            <div className="demo-credentials-helper mt-4">
              <p>💡 **Demo Admin Invitation Code:**</p>
              <p>Code: <span className="font-orange">BURGERADMIN2026</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
