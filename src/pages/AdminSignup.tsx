import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldAlert, KeyRound, ShieldCheck } from 'lucide-react';
import '../styles/pages/AdminDashboard.css';

export const AdminSignup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect
    const activeSession = localStorage.getItem('burgerhub_active_admin');
    if (activeSession) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify invitation code
    if (inviteCode !== 'BURGERADMIN2026') {
      setError('Invalid admin invitation code. Please use the sandbox demo code.');
      return;
    }

    const admins = JSON.parse(localStorage.getItem('burgerhub_admins') || '[]');
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

    admins.push(newAdmin);
    localStorage.setItem('burgerhub_admins', JSON.stringify(admins));
    localStorage.setItem('burgerhub_active_admin', JSON.stringify({ email: newAdmin.email, name: newAdmin.name }));
    
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
