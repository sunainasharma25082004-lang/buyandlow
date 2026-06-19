import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setSubmitted(true);
      setEmail('');
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
            <button className="nl-btn" onClick={handleSubmit}>Subscribe Now</button>
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
