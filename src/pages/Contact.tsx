import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Clock, AlertCircle, MapPin, Navigation, Star } from 'lucide-react';
import '../styles/pages/Contact.css';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [reportIssueSubmitted, setReportIssueSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      const messages = JSON.parse(localStorage.getItem('burgerhub_contact_messages') || '[]');
      messages.push({ ...formData, date: new Date().toLocaleString() });
      localStorage.setItem('burgerhub_contact_messages', JSON.stringify(messages));
      
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const handleReportIssue = () => {
    // Simulate reporting an issue
    setReportIssueSubmitted(true);
    setTimeout(() => setReportIssueSubmitted(false), 5000);
  };

  return (
    <div className="contact-page animate-fade-in">
      {/* Page Header */}
      <section className="contact-header container text-center">
        <div className="contact-icon-box animate-float">
          <MessageSquare size={26} />
        </div>
        <h1>LET'S <span className="orange-text">CONNECT</span></h1>
        <p className="contact-subtitle">
          We'd love to hear from you. Whether you have a question about our menu, need assistance, or just want to give feedback.
        </p>
      </section>

      {/* Grid Container */}
      <section className="contact-content container">
        <div className="contact-layout-grid">
          
          {/* Left Column - Sidebar info cards */}
          <div className="contact-sidebar">
            {/* Call Us Card */}
            <div className="contact-info-card card">
              <div className="info-icon-wrapper call-icon-bg">
                <Phone size={20} />
              </div>
              <div className="info-details">
                <span className="info-title">Call Us</span>
                <span className="info-sub">Mon-Fri from 8am to 5pm</span>
                <a href="tel:5551234567" className="info-main-link">(555) 123-4567</a>
              </div>
            </div>

            {/* Email Us Card */}
            <div className="contact-info-card card">
              <div className="info-icon-wrapper email-icon-bg">
                <Mail size={20} />
              </div>
              <div className="info-details">
                <span className="info-title">Email Us</span>
                <span className="info-sub">For general inquiries</span>
                <a href="mailto:hello@burgerhub.com" className="info-main-link">hello@burgerhub.com</a>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="contact-info-card card">
              <div className="info-icon-wrapper hours-icon-bg">
                <Clock size={20} />
              </div>
              <div className="info-details hours-details">
                <span className="info-title">Opening Hours</span>
                <span className="info-sub">Come visit us</span>
                <div className="hours-row">
                  <span>Monday - Friday</span>
                  <span>7AM - 11PM</span>
                </div>
                <div className="hours-row">
                  <span>Saturday - Sunday</span>
                  <span>8AM - 11PM</span>
                </div>
              </div>
            </div>

            {/* Order Issues Card */}
            <div className="order-issues-card card">
              <div className="issues-header">
                <AlertCircle size={20} className="issues-icon" />
                <h4>Order Issues?</h4>
              </div>
              <p>Experiencing problems with your order? We're here to help immediately.</p>
              <button onClick={handleReportIssue} className="btn btn-secondary report-issue-btn">
                REPORT AN ISSUE
              </button>
              {reportIssueSubmitted && (
                <p className="report-success animate-fade-in">Support ticket generated! A representative will contact you shortly.</p>
              )}
            </div>
          </div>

          {/* Right Column - Locations and Form */}
          <div className="contact-main">
            {/* Locations Section */}
            <div className="locations-section">
              <div className="section-title-row">
                <MapPin size={18} className="color-primary" />
                <h3>Our Locations</h3>
              </div>

              <div className="locations-grid">
                {/* Location 1 */}
                <div className="location-card card">
                  <div className="location-header">
                    <div>
                      <h4>Downtown Flagship</h4>
                      <div className="location-rating">
                        <Star size={12} fill="currentColor" />
                        <span>4.9 <span className="reviews-count">(1243)</span></span>
                      </div>
                    </div>
                    <button className="nav-compass-btn" aria-label="Navigate to Downtown Flagship">
                      <Navigation size={14} />
                    </button>
                  </div>
                  <p className="location-address">123 Burger Street, Downtown</p>
                  <p className="location-phone">(555) 123-4567</p>
                  <div className="location-tags">
                    <span>Dine-In</span>
                    <span>Takeout</span>
                    <span>Delivery</span>
                    <span>Parking</span>
                  </div>
                </div>

                {/* Location 2 */}
                <div className="location-card card">
                  <div className="location-header">
                    <div>
                      <h4>Northside Location</h4>
                      <div className="location-rating">
                        <Star size={12} fill="currentColor" />
                        <span>4.8 <span className="reviews-count">(892)</span></span>
                      </div>
                    </div>
                    <button className="nav-compass-btn" aria-label="Navigate to Northside Location">
                      <Navigation size={14} />
                    </button>
                  </div>
                  <p className="location-address">456 Food Avenue, North District</p>
                  <p className="location-phone">(555) 987-6543</p>
                  <div className="location-tags">
                    <span>Dine-In</span>
                    <span>Drive-Thru</span>
                    <span>Takeout</span>
                  </div>
                </div>

                {/* Location 3 */}
                <div className="location-card card">
                  <div className="location-header">
                    <div>
                      <h4>Westgate Mall</h4>
                      <div className="location-rating">
                        <Star size={12} fill="currentColor" />
                        <span>4.7 <span className="reviews-count">(567)</span></span>
                      </div>
                    </div>
                    <button className="nav-compass-btn" aria-label="Navigate to Westgate Mall">
                      <Navigation size={14} />
                    </button>
                  </div>
                  <p className="location-address">Westgate Shopping Center, Food Court</p>
                  <p className="location-phone">(555) 456-7890</p>
                  <div className="location-tags">
                    <span>Food Court</span>
                    <span>Takeout</span>
                    <span>Seating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="message-form-section">
              <h3>Send us a Message</h3>
              <form onSubmit={handleFormSubmit} className="message-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    placeholder="How can we help you?" 
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    placeholder="Write your message here..." 
                    className="form-input message-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary submit-msg-btn">
                  Send Message
                </button>
              </form>
              {submitted && (
                <p className="submit-success-text animate-fade-in">Message sent successfully! We will get back to you within 24 hours.</p>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
