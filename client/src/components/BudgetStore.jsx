import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BudgetStore.css';

const priceTiers = [
  {
    id: 'under-299',
    tag: 'BUDGET DEALS',
    price: '₹299',
    label: 'Under ₹299',
    desc: 'Daily essentials, kitchen tools & decor',
    badgeBg: '#EBF8F2',
    badgeColor: '#059669',
    bg: '#FFFFFF',
    border: '#A7F3D0',
    link: '/allproducts?priceMax=299&title=Under ₹299 Budget Store',
    icon: '🪙',
  },
  {
    id: 'under-499',
    tag: 'SUPER VALUE',
    price: '₹499',
    label: 'Under ₹499',
    desc: 'T-Shirts, home organizers & audio',
    badgeBg: '#EFF6FF',
    badgeColor: '#2563EB',
    bg: '#FFFFFF',
    border: '#BFDBFE',
    link: '/allproducts?priceMax=499&title=Under ₹499 Value Deals',
    icon: '🛍️',
  },
  {
    id: 'under-999',
    tag: 'BESTSELLERS',
    price: '₹999',
    label: 'Under ₹999',
    desc: 'Smart kettles, earbuds & footwear',
    badgeBg: '#FFFBEB',
    badgeColor: '#D97706',
    bg: '#FFFFFF',
    border: '#FDE68A',
    link: '/allproducts?priceMax=999&title=Under ₹999 Popular Picks',
    icon: '⚡',
  },
  {
    id: 'under-1499',
    tag: 'PREMIUM PICKS',
    price: '₹1,499',
    label: 'Under ₹1,499',
    desc: 'Luxury appliances, electronics & sets',
    badgeBg: '#FAF5FF',
    badgeColor: '#9333EA',
    bg: '#FFFFFF',
    border: '#E9D5FF',
    link: '/allproducts?priceMax=1499&title=Under ₹1,499 Premium Deals',
    icon: '👑',
  },
];

const BudgetStore = () => {
  const navigate = useNavigate();

  return (
    <section className="budget-store-section">
      <div className="container">
        <div className="budget-header-bar">
          <div>
            <span className="budget-tag-pill">💰 BUDGET BAZAAR</span>
            <h2 className="budget-title">Shop by Price Store</h2>
          </div>
          <p className="budget-subtitle">
            Find the best deals that match your exact budget
          </p>
        </div>

        <div className="budget-grid">
          {priceTiers.map((tier) => (
            <div
              key={tier.id}
              className="budget-card"
              style={{ borderColor: tier.border }}
              onClick={() => navigate(tier.link)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(tier.link)}
            >
              <div className="budget-card-top">
                <span
                  className="budget-badge"
                  style={{ backgroundColor: tier.badgeBg, color: tier.badgeColor }}
                >
                  {tier.tag}
                </span>
                <span className="budget-icon">{tier.icon}</span>
              </div>

              <div className="budget-card-center">
                <span className="budget-starting">STARTING AT</span>
                <h3 className="budget-price-label">{tier.label}</h3>
                <p className="budget-desc">{tier.desc}</p>
              </div>

              <div className="budget-card-bottom">
                <span className="budget-cta-text">Explore Store</span>
                <span className="budget-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BudgetStore;
