import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, UserCheck } from 'lucide-react';
import { fetchUsers } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';

export const UserLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect path (e.g. if redirected from checkout)
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/profile';

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

    // Check active session
    const activeSession = localStorage.getItem('burgerhub_active_user');
    if (activeSession) {
      navigate('/profile');
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
      localStorage.setItem('burgerhub_active_user', JSON.stringify(sessionUser));
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
