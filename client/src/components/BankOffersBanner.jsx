import React from 'react';
import './BankOffersBanner.css';

const offers = [
  {
    icon: '💳',
    bank: 'BANK OFFER',
    title: 'Instant 10% Off',
    sub: 'On HDFC & SBI Cards over ₹999',
  },
  {
    icon: '📱',
    bank: 'UPI SPECIAL',
    title: 'Flat ₹50 Cashback',
    sub: 'On PhonePe, GPay & Paytm',
  },
  {
    icon: '📦',
    bank: 'ZERO RISK',
    title: 'Pay on Delivery',
    sub: 'Cash on Delivery Available',
  },
  {
    icon: '⚡',
    bank: 'FLEXIBLE EMI',
    title: 'No Cost EMI',
    sub: 'From ₹499/mo on Credit Cards',
  },
];

const BankOffersBanner = () => {
  return (
    <div className="bank-offers-section">
      <div className="container">
        <div className="bank-offers-card">
          <div className="bank-offers-grid">
            {offers.map((offer) => (
              <div key={offer.title} className="bank-offer-item">
                <span className="bank-offer-emoji">{offer.icon}</span>
                <div className="bank-offer-text">
                  <span className="bank-offer-tag">{offer.bank}</span>
                  <strong className="bank-offer-title">{offer.title}</strong>
                  <span className="bank-offer-sub">{offer.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankOffersBanner;
