import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, Bike } from 'lucide-react';
import '../styles/pages/AdminDashboard.css';
import '../styles/pages/StaffPortals.css';

export const RiderLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    // Check active session
    const activeSession = localStorage.getItem('burgerhub_active_rider');
    if (activeSession) {
      navigate('/rider/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const riders = JSON.parse(localStorage.getItem('burgerhub_riders') || '[]');
    const matchedRider = riders.find((r: any) => r.email.toLowerCase() === email.toLowerCase().trim() && r.password === password);

    if (matchedRider) {
      localStorage.setItem('burgerhub_active_rider', JSON.stringify(matchedRider));
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
