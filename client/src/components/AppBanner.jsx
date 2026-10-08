import React from 'react';
import logoImg from '../assets/logo.png';
import './AppBanner.css';

const AppBanner = () => {
  return (
    <section className="app-download-section">
      <div className="container">
        <div className="app-download-card">
          <div className="app-download-left">
            <div className="app-logo-pill">
              <img src={logoImg} alt="BuyLow India App" className="app-banner-logo" />
            </div>

            <div className="app-download-info">
              <span className="app-badge-pill">📱 SHOP ON THE GO</span>
              <h3 className="app-download-title">
                Get the BuyLow India Mobile Experience
              </h3>
              <p className="app-download-desc">
                Instant deal alerts, seamless one-tap UPI checkout, and live order tracking.
                Get flat <strong>₹100 Instant Discount</strong> on your first order.
              </p>
            </div>
          </div>

          <div className="app-download-right">
            <a
              href="#app-download"
              className="btn-download-app"
              onClick={(e) => {
                e.preventDefault();
                alert('BuyLow India Android App is currently in distribution! Contact support for early APK access.');
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 0 1-.61-.92L3 21.266V2.734l.001-.001c.063-.356.248-.68.608-.919zm11.233 11.234l2.122-2.121-11.83-6.83 9.708 8.951zm0 1.899l-9.708 8.951 11.83-6.83-2.122-2.121zm2.977-2.977l3.655 2.11a1.498 1.498 0 0 1 0 2.597l-2.61 1.507-2.09-2.09 1.045-1.045 2.09-2.09 2.61 1.507a1.498 1.498 0 0 1 0 2.597l-3.655 2.11-1.045-1.045 1.045-1.045z"/>
              </svg>
              <div className="btn-download-text">
                <span className="download-small">DOWNLOAD FOR</span>
                <span className="download-big">Android APK</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppBanner;
