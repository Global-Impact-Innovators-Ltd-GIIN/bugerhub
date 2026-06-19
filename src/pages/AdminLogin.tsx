import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import '../styles/pages/AdminDashboard.css';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const admins = JSON.parse(localStorage.getItem('burgerhub_admins') || '[]');
    const matchedAdmin = admins.find((a: any) => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password);

    if (matchedAdmin) {
      sessionStorage.setItem('burgerhub_active_admin', JSON.stringify({ email: matchedAdmin.email, name: matchedAdmin.name }));
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
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-icon"><Lock size={16} /></span>
              </div>
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
