import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { RwandaMap } from '../components/RwandaMap';
import { fetchUsers, saveUser } from '../utils/supabaseDb';
import '../styles/pages/AdminDashboard.css';

export const UserSignup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect path (e.g. if redirected from checkout)
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/profile';

  useEffect(() => {
    // If already logged in, redirect
    const activeSession = localStorage.getItem('burgerhub_active_user');
    if (activeSession) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleLocationSelected = (fullAddr: string, selectedDistrict: string, _coordsStr: string) => {
    setAddress(fullAddr);
    setCity(`${selectedDistrict} District, Rwanda`);
    setZipCode('250');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address || !city) {
      setError('Please pin your delivery address using the interactive map.');
      return;
    }

    const users = await fetchUsers();
    const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (emailExists) {
      setError('A customer account with this email address already exists.');
      return;
    }

    const newUser = {
      id: 'U' + Math.floor(100 + Math.random() * 900),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: phone.trim(),
      address: address,
      city: city,
      zipCode: zipCode || '250'
    };

    await saveUser(newUser);

    // Auto-login (save without password)
    const { password: _, ...sessionUser } = newUser;
    localStorage.setItem('burgerhub_active_user', JSON.stringify(sessionUser));
    
    navigate(redirectPath);
  };

  return (
    <div className="admin-auth-page animate-fade-in" style={{ padding: '80px 20px' }}>
      <div className="container" style={{ maxWidth: '650px', width: '100%' }}>
        <div className="auth-card card" style={{ padding: '40px 30px', textAlign: 'left' }}>
          <div className="auth-icon-box" style={{ margin: '0 auto 20px auto' }}>
            <ShieldCheck size={28} className="color-primary animate-float" />
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>CREATE CUSTOMER ACCOUNT</h2>
          <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '24px' }}>
            Sign up to save details and make purchases seamlessly
          </p>

          <form onSubmit={handleSignup} className="auth-form">
            {error && (
              <div className="payment-error-box mb-4 animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="card-input-wrapper">
                  <input
                    type="tel"
                    required
                    placeholder="+250 788 123 456"
                    className="form-input auth-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="input-icon"><Phone size={16} /></span>
                </div>
              </div>
            </div>

            <div className="form-group-row mt-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="card-input-wrapper">
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="form-input auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="input-icon"><Mail size={16} /></span>
                </div>
              </div>

              <div className="form-group">
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
            </div>

            {/* Address Details & Map */}
            <div className="checkout-section mt-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', color: 'var(--secondary)' }}>
                Set Default Delivery Location
              </h3>
              
              {/* Pinned map location */}
              <div style={{ marginBottom: '15px' }}>
                <RwandaMap onLocationSelected={handleLocationSelected} />
              </div>

              <div className="form-group">
                <label className="form-label">Pinned Address Details</label>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Click on the interactive map above to select your address coordinates"
                  className="form-input read-only-input"
                  style={{ background: 'rgba(255, 255, 255, 0.01)', color: 'var(--text-secondary)', borderColor: 'rgba(255, 255, 255, 0.04)' }}
                  value={address}
                />
              </div>
              
              <div className="form-group-row mt-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">District / City</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="District Name"
                    className="form-input read-only-input"
                    style={{ background: 'rgba(255, 255, 255, 0.01)', color: 'var(--text-secondary)', borderColor: 'rgba(255, 255, 255, 0.04)' }}
                    value={city}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    required
                    readOnly
                    className="form-input read-only-input"
                    style={{ background: 'rgba(255, 255, 255, 0.01)', color: 'var(--text-secondary)', borderColor: 'rgba(255, 255, 255, 0.04)' }}
                    value={zipCode}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn mt-4">
              Register Account
            </button>

            <div className="auth-footer-links mt-4" style={{ textAlign: 'center' }}>
              <span>Already have an account? </span>
              <Link to={`/login${location.search}`} className="orange-link font-semibold">Log In Here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
