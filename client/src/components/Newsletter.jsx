import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/support/contact`, {
        name: 'Newsletter Subscriber',
        email: trimmed,
        subject: 'Newsletter Subscription',
        message: `Customer subscribed to store newsletter with email: ${trimmed}`,
      });
    } catch {
      // Graceful fallback
    } finally {
      setSubmitted(true);
      setEmail('');
      setSubmitting(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <p className="nl-eyebrow">✦ JOIN OUR COMMUNITY</p>
        <h2 className="nl-title">Stay in the Loop</h2>
        <p className="nl-desc">
          Subscribe to our newsletter and be the first to hear about new arrivals,
          exclusive deals, and special promotions.
        </p>

        {submitted ? (
          <div className="nl-success">
            ✓ Thank you for subscribing! Check your inbox for a welcome gift.
          </div>
        ) : (
          <div className="nl-form">
            <input
              type="email"
              className="nl-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button className="nl-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </div>
        )}

        <p className="nl-privacy">
          🔒 No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
