import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Store, Lock, ShieldAlert, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { CheckoutDetails } from '../context/CartContext';
import { RwandaMap } from '../components/RwandaMap';
import '../styles/pages/Checkout.css';

export const Checkout: React.FC = () => {
  const { cart, cartSubtotal, placeOrder } = useCart();
  const navigate = useNavigate();

  // Exchange rate const (1 USD = 1300 RWF)
  const EXCHANGE_RATE = 1300;

  // Currency State
  const [currency, setCurrency] = useState<'USD' | 'RWF'>('USD');

  // Form State
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash' | 'momo'>('stripe');

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // MoMo Form State
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [momoPhone, setMomoPhone] = useState('');
  const [momoName, setMomoName] = useState('');

  // Payment Status State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showSmsNotification, setShowSmsNotification] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);

  // MoMo Credentials State
  const [momoUuid, setMomoUuid] = useState(() => {
    return localStorage.getItem('burgerhub_momo_uuid') || '74d32656-1546-4a38-9145-97c4696f64bf';
  });
  const [momoApiKey, setMomoApiKey] = useState(() => {
    return localStorage.getItem('burgerhub_momo_apikey') || 'f8617b7ad1494d1e873161ce555f8966';
  });

  useEffect(() => {
    localStorage.setItem('burgerhub_momo_uuid', momoUuid);
  }, [momoUuid]);

  useEffect(() => {
    localStorage.setItem('burgerhub_momo_apikey', momoApiKey);
  }, [momoApiKey]);

  // Helper: Format amount with selected currency symbol
  const formatAmount = (usdAmount: number) => {
    if (currency === 'RWF') {
      const rwfAmount = Math.round(usdAmount * EXCHANGE_RATE);
      return `${rwfAmount.toLocaleString()} RWF`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  // Callback for Rwanda map location pinning
  const handleLocationSelected = (fullAddr: string, selectedDistrict: string, _coordsStr: string) => {
    setAddress(fullAddr);
    setCity(`${selectedDistrict} District, Rwanda`);
    setZipCode('250');
  };

  // Helper: Format card number with spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\s?/g, '');
    if (isNaN(Number(rawVal))) return;
    
    let formattedVal = '';
    for (let i = 0; i < rawVal.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedVal += ' ';
      }
      formattedVal += rawVal[i];
    }
    setCardNumber(formattedVal.substring(0, 19));
  };

  // Helper: Format expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\//g, '');
    if (isNaN(Number(raw))) return;
    
    if (raw.length > 2) {
      setExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`.substring(0, 5));
    } else {
      setExpiry(raw);
    }
  };

  const getCardBrand = (num: string) => {
    const cleanNum = num.replace(/\s/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
    if (/^3[47]/.test(cleanNum)) return 'Amex';
    return 'Card';
  };

  const handleQuickFill = () => {
    setName('John Doe');
    setEmail('john.doe@example.com');
    setPhone('+250 788 123 456');
    
    // Simulate pinning Kigali on the map
    setAddress('Kigali Province, Nyarugenge District (Map Pin: 1.9441° S, 30.0619° E)');
    setCity('Nyarugenge District, Rwanda');
    setZipCode('250');
    
    // Fill Stripe card details
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    setCardName('JOHN DOE');
    
    // Fill MoMo details
    setMomoPhone('0788 123 456');
    setMomoName('JOHN DOE');

    // Fill MoMo credentials
    setMomoUuid('74d32656-1546-4a38-9145-97c4696f64bf');
    setMomoApiKey('f8617b7ad1494d1e873161ce555f8966');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    // Basic Validations
    if (!name || !email || !phone) {
      setPaymentError('Please fill in your contact information.');
      return;
    }
    if (deliveryMethod === 'delivery' && (!address || !city || !zipCode)) {
      setPaymentError('Please select your delivery coordinates using the map.');
      
      // Scroll to interactive map and highlight it
      const mapEl = document.querySelector('.rwanda-map-container');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mapEl.classList.add('highlight-map-error');
        setTimeout(() => {
          mapEl.classList.remove('highlight-map-error');
        }, 3000);
      }
      return;
    }

    if (paymentMethod === 'stripe') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        setPaymentError('Invalid Card Number. Please enter a 16-digit card.');
        return;
      }
      if (expiry.length < 5) {
        setPaymentError('Invalid Expiration Date. Format MM/YY.');
        return;
      }
      if (cvc.length < 3) {
        setPaymentError('Invalid CVC. Enter 3 or 4 digits.');
        return;
      }
      if (!cardName) {
        setPaymentError('Cardholder Name is required.');
        return;
      }

      // Simulate Payment Processing Flow
      setIsProcessing(true);
      setProcessingStep('Connecting to Stripe secure gateway...');
      setOtpError('');

      setTimeout(() => {
        setProcessingStep('Validating card credentials...');
        
        setTimeout(() => {
          // Decline simulation
          if (cleanCard.startsWith('40000002') || cleanCard.startsWith('4002')) {
            setIsProcessing(false);
            setPaymentError('Payment Declined: Insufficient funds. Please use a different card.');
            return;
          }

          setProcessingStep('Requesting dual OTP secure authorizations...');
          setTimeout(() => {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setExpectedOtp(generatedOtp);
            setIsProcessing(false);
            setShowOtpModal(true);

            // Trigger simulated notifications
            setTimeout(() => {
              setShowSmsNotification(true);
              setTimeout(() => setShowSmsNotification(false), 7000);
            }, 1000);

            setTimeout(() => {
              setShowEmailNotification(true);
              setTimeout(() => setShowEmailNotification(false), 7000);
            }, 2500);
          }, 1500);

        }, 1500);
      }, 1500);

    } else if (paymentMethod === 'momo') {
      const cleanPhone = momoPhone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 9) {
        setPaymentError('Invalid MoMo Phone Number. Must contain at least 9 digits.');
        return;
      }
      if (!momoName) {
        setPaymentError('MoMo Account Owner Name is required.');
        return;
      }

      // Simulate MoMo Push Prompt Flow
      setIsProcessing(true);
      setProcessingStep(`Initializing connection to MTN MoMo gateway for API User UUID: ${momoUuid.slice(0, 8)}...`);
      setOtpError('');

      setTimeout(() => {
        setProcessingStep(`Authenticating transaction payload with Key: ••••••••${momoApiKey.slice(-6)}...`);
        
        setTimeout(() => {
          setProcessingStep(`Dispatching USSD Push request to player phone (+250 ${cleanPhone.slice(-9)})...`);
          setTimeout(() => {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setExpectedOtp(generatedOtp);
            setIsProcessing(false);
            setShowOtpModal(true);

            // Trigger simulated notifications
            setTimeout(() => {
              setShowSmsNotification(true);
              setTimeout(() => setShowSmsNotification(false), 7000);
            }, 1000);

            setTimeout(() => {
              setShowEmailNotification(true);
              setTimeout(() => setShowEmailNotification(false), 7000);
            }, 2500);
          }, 1500);
        }, 1500);
      }, 1500);

    } else {
      // Cash payment
      const details: CheckoutDetails = {
        name,
        email,
        phone,
        address: deliveryMethod === 'delivery' ? address : 'Store Pickup',
        city: deliveryMethod === 'delivery' ? city : 'Store Location',
        zipCode: deliveryMethod === 'delivery' ? zipCode : 'N/A',
        deliveryMethod,
        paymentMethod: 'cash',
        currency
      };
      
      placeOrder(details);
      navigate('/tracking');
    }
  };

  const handleResendOtp = () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(generatedOtp);
    setOtpError('');
    setOtpCode('');

    setShowSmsNotification(false);
    setShowEmailNotification(false);

    setTimeout(() => {
      setShowSmsNotification(true);
      setTimeout(() => setShowSmsNotification(false), 7000);
    }, 800);

    setTimeout(() => {
      setShowEmailNotification(true);
      setTimeout(() => setShowEmailNotification(false), 7000);
    }, 2200);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    if (otpCode !== expectedOtp) {
      setOtpError('Incorrect verification code. Please check your simulated SMS or email notifications.');
      return;
    }

    setOtpError('');
    setShowOtpModal(false);
    setIsProcessing(true);
    setProcessingStep('Verifying OTP authorization token...');

    setTimeout(() => {
      setProcessingStep('Finalizing order dispatch...');
      
      setTimeout(() => {
        const details: CheckoutDetails = {
          name,
          email,
          phone,
          address: deliveryMethod === 'delivery' ? address : 'Store Pickup',
          city: deliveryMethod === 'delivery' ? city : 'Store Location',
          zipCode: deliveryMethod === 'delivery' ? zipCode : 'N/A',
          deliveryMethod,
          paymentMethod,
          momoProvider: paymentMethod === 'momo' ? momoProvider : undefined,
          momoPhone: paymentMethod === 'momo' ? momoPhone : undefined,
          cardNumberMuted: paymentMethod === 'stripe' ? `•••• •••• •••• ${cardNumber.slice(-4)}` : undefined,
          currency
        };

        placeOrder(details);
        setIsProcessing(false);
        navigate('/tracking');
      }, 1500);
    }, 1500);
  };

  const subtotal = cartSubtotal;
  const tax = subtotal * 0.08;
  const deliveryFee = deliveryMethod === 'delivery' ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  const cardBrand = getCardBrand(cardNumber);

  return (
    <div className="checkout-page animate-fade-in">
      <div className="container">
        <div className="checkout-header-row">
          <h1>CHECKOUT</h1>
          <button
            type="button"
            onClick={handleQuickFill}
            className="btn btn-secondary quick-fill-btn"
          >
            ⚡ Quick Fill Test Details
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="checkout-layout">
          {/* Left Side: Form Details */}
          <div className="checkout-form">
            
            {/* Currency Switcher */}
            <div className="checkout-section card">
              <h3>Select Billing Currency</h3>
              <div className="method-toggles">
                <button
                  type="button"
                  className={`method-toggle-btn ${currency === 'USD' ? 'active' : ''}`}
                  onClick={() => setCurrency('USD')}
                >
                  <span>USD ($)</span>
                </button>
                <button
                  type="button"
                  className={`method-toggle-btn ${currency === 'RWF' ? 'active' : ''}`}
                  onClick={() => setCurrency('RWF')}
                >
                  <span>RWF (Rwandan Francs)</span>
                </button>
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="checkout-section card">
              <h3>Delivery Method</h3>
              <div className="method-toggles">
                <button
                  type="button"
                  className={`method-toggle-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('delivery')}
                >
                  <Truck size={18} />
                  <span>Home Delivery</span>
                </button>
                <button
                  type="button"
                  className={`method-toggle-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  <Store size={18} />
                  <span>Store Pickup</span>
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="checkout-section card">
              <h3>Contact Information</h3>
              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+250 780 000 000"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group mt-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Address Details & Map (Conditional) */}
            {deliveryMethod === 'delivery' && (
              <div className="checkout-section card animate-fade-in">
                <h3>Delivery Address</h3>
                
                {/* Interactive Map Component */}
                <RwandaMap onLocationSelected={handleLocationSelected} />

                <div className="form-group mt-3">
                  <label className="form-label">Pinned Address Details</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Click on the map above to select your location"
                    className="form-input read-only-input"
                    value={address}
                  />
                </div>
                
                <div className="form-group-row mt-3">
                  <div className="form-group">
                    <label className="form-label">District / City</label>
                    <input
                      type="text"
                      required
                      readOnly
                      placeholder="District Name"
                      className="form-input read-only-input"
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
                      value={zipCode}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method selection */}
            <div className="checkout-section card">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <button
                  type="button"
                  className={`payment-option-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <CreditCard size={18} />
                  <span>Credit Card</span>
                </button>
                <button
                  type="button"
                  className={`payment-option-btn ${paymentMethod === 'momo' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('momo')}
                >
                  <Phone size={18} />
                  <span>MoMo (Mobile Money)</span>
                </button>
                <button
                  type="button"
                  className={`payment-option-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Store size={18} />
                  <span>{deliveryMethod === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter'}</span>
                </button>
              </div>

              {/* Stripe Credit Card Form */}
              {paymentMethod === 'stripe' && (
                <div className="stripe-elements-simulator animate-fade-in">
                  <div className="simulator-badge">
                    <Lock size={12} /> Stripe Elements Secure Input
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <div className="card-input-wrapper">
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        className="form-input card-num-input"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                      />
                      <span className="card-brand-tag">{cardBrand}</span>
                    </div>
                  </div>

                  <div className="form-group-row mt-3">
                    <div className="form-group">
                      <label className="form-label">Expiration Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="form-input"
                        value={expiry}
                        onChange={handleExpiryChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVC / CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        className="form-input"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label">Name on Card</label>
                    <input
                      type="text"
                      placeholder="JOHN DOE"
                      className="form-input uppercase-input"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="testing-card-info">
                    <p>💡 **Sandbox Testing Info:**</p>
                    <ul>
                      <li>Standard success: Use card starting with **4242** (Visa Test).</li>
                      <li>Simulate decline: Use card starting with **4002** or **4000 0002**.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* MoMo (Mobile Money) Form */}
              {paymentMethod === 'momo' && (
                <div className="stripe-elements-simulator animate-fade-in">
                  <div className="simulator-badge momo-badge">
                    <Lock size={12} /> Mobile Money Secure Channel
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Operator</label>
                    <div className="momo-provider-toggles">
                      <button
                        type="button"
                        className={`provider-toggle-btn mtn-provider ${momoProvider === 'mtn' ? 'active' : ''}`}
                        onClick={() => setMomoProvider('mtn')}
                      >
                        <span className="momo-provider-color mtn-color-dot"></span>
                        <span>MTN MoMo</span>
                      </button>
                      <button
                        type="button"
                        className={`provider-toggle-btn airtel-provider ${momoProvider === 'airtel' ? 'active' : ''}`}
                        onClick={() => setMomoProvider('airtel')}
                      >
                        <span className="momo-provider-color airtel-color-dot"></span>
                        <span>Airtel Money</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label">MoMo Phone Number</label>
                    <input
                      type="tel"
                      placeholder="0788 000 000"
                      className="form-input"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label">Account Name</label>
                    <input
                      type="text"
                      placeholder="OWNER NAME"
                      className="form-input uppercase-input"
                      value={momoName}
                      onChange={(e) => setMomoName(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="testing-card-info">
                    <p>💡 **Sandbox Testing Info:**</p>
                    <ul>
                      <li>MTN prefixes: Starts with **078** or **079**.</li>
                      <li>Airtel prefixes: Starts with **072** or **073**.</li>
                    </ul>
                  </div>

                  <div className="momo-api-credentials-section mt-4 pt-3 border-t">
                    <h5 className="font-semibold text-sm mb-3 text-orange">MTN MoMo Gateway Credentials</h5>
                    <div className="form-group">
                      <label className="form-label text-xs">API User UUID</label>
                      <input
                        type="text"
                        placeholder="74d32656-1546-4a38-9145-97c4696f64bf"
                        className="form-input text-xs font-mono"
                        value={momoUuid}
                        onChange={(e) => setMomoUuid(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group mt-3">
                      <label className="form-label text-xs">API Subscription Key (API Key)</label>
                      <input
                        type="password"
                        placeholder="f8617b7ad1494d1e873161ce555f8966"
                        className="form-input text-xs font-mono"
                        value={momoApiKey}
                        onChange={(e) => setMomoApiKey(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {paymentError && (
              <div className="payment-error-box animate-fade-in">
                <ShieldAlert size={18} />
                <span>{paymentError}</span>
              </div>
            )}
          </div>

          {/* Right Side: Order Summary Card */}
          <div className="order-summary-sidebar">
            <div className="order-summary-card card">
              <h3>Order Summary</h3>
              
              <div className="summary-items-list">
                {cart.map(item => (
                  <div className="summary-item" key={item.id}>
                    <div className="summary-item-left">
                      <span className="summary-qty">{item.quantity}x</span>
                      <div>
                        <span className="summary-name">{item.name}</span>
                        {(item.customizations.bun || item.customizations.doneness || item.customizations.extras.length > 0) && (
                          <div className="summary-item-customizations">
                            {item.customizations.bun && <span>Bun: {item.customizations.bun}</span>}
                            {item.customizations.doneness && <span>Doneness: {item.customizations.doneness}</span>}
                            {item.customizations.extras.length > 0 && (
                              <span>Add: {item.customizations.extras.map(e => e.name).join(', ')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="summary-item-price">{formatAmount(item.totalPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Sales Tax (8%)</span>
                  <span>{formatAmount(tax)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee > 0 ? formatAmount(deliveryFee) : 'FREE'}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row grand-total-row">
                  <span>Grand Total</span>
                  <span className="grand-total-price">{formatAmount(total)}</span>
                </div>
              </div>

              {paymentError && (
                <div className="payment-error-box animate-fade-in mb-3">
                  <ShieldAlert size={18} />
                  <span>{paymentError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary place-order-btn mt-4"
                disabled={isProcessing}
              >
                PLACE ORDER • {formatAmount(total)}
              </button>

              <div className="secure-checkout-footer mt-3">
                <Lock size={12} />
                <span>Secured SSL Checkout Gateway</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Full-Screen Payment Processing Overlay */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-container card">
            <div className="spinner"></div>
            <h4>Secure Transaction Processing</h4>
            <p className="processing-step-text">{processingStep}</p>
            <p className="loading-warning">Please do not refresh or close this browser window.</p>
          </div>
        </div>
      )}

      {/* Mock 3D Secure SMS Verification Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <form className="otp-modal-container card animate-fade-in" onSubmit={handleOtpSubmit}>
            <div className="otp-header">
              <div className="otp-shield-box"><Lock size={22} /></div>
              <h3>3D Secure Authentication</h3>
              <p>A verification code has been simulated and sent in real-time to both your registered email and mobile device:</p>
            </div>
            
            <div className="otp-body">
              <div className="otp-destination-box">
                <p>📧 Email: <span className="font-orange">{email}</span></p>
                <p>📱 Phone: <span className="font-orange">{momoPhone || phone}</span></p>
              </div>
              <p className="mock-amount-display">Amount: <span>{formatAmount(total)}</span></p>
              
              {otpError && (
                <div className="payment-error-box animate-fade-in mb-4">
                  <ShieldAlert size={18} />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label text-center">Enter One-Time Verification Code</label>
                <input 
                  type="text" 
                  placeholder="123456" 
                  className="form-input text-center otp-input"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="otp-tips">
                <p>💡 Enter the 6-digit code received via simulated SMS or email notification above.</p>
                <button type="button" onClick={handleResendOtp} className="btn-link mt-2">
                  Didn't receive code? Resend simulated alerts
                </button>
              </div>
            </div>

            <div className="otp-footer">
              <button 
                type="button" 
                className="btn btn-secondary cancel-otp-btn" 
                onClick={() => {
                  setShowOtpModal(false);
                  setPaymentError('Payment failed: 3D Secure verification cancelled.');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary submit-otp-btn">
                Authorize Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mock SMS Notification Banner */}
      {showSmsNotification && (
        <div className="mock-notification mock-sms-banner">
          <div className="notification-header">
            <span className="icon">💬</span>
            <span className="app-name">MESSAGES</span>
            <span className="time">now</span>
          </div>
          <div className="notification-body">
            <strong>BurgerHub:</strong> Your secure OTP code is <span className="highlight-code">{expectedOtp}</span>. It is valid for 10 minutes.
          </div>
        </div>
      )}

      {/* Mock Email Notification Banner */}
      {showEmailNotification && (
        <div className="mock-notification mock-email-banner">
          <div className="notification-header">
            <span className="icon">✉️</span>
            <span className="app-name">GMAIL</span>
            <span className="time">now</span>
          </div>
          <div className="notification-body">
            <strong>BurgerHub Security:</strong> 3D Secure Code [<span className="highlight-code">{expectedOtp}</span>] is requested for {formatAmount(total)}.
          </div>
        </div>
      )}
    </div>
  );
};
