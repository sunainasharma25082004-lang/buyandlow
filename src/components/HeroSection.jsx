import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import { formatINRPlain, FREE_SHIPPING_MIN } from '../utils/currency';

const categories = [
  { label: 'Fashion', emoji: '👗', slug: 'Fashion' },
  { label: 'Electronics', emoji: '📱', slug: 'Electronics' },
  { label: 'Home & Living', emoji: '🏠', slug: 'Home' },
  { label: 'Beauty', emoji: '✨', slug: 'Beauty' },
];

const trustItems = [
  { icon: '🚚', title: 'Free Shipping', sub: `On orders over ${formatINRPlain(FREE_SHIPPING_MIN, { decimals: 0 })}` },
  { icon: '📦', title: 'Fast Delivery', sub: 'Track every order' },
  { icon: '🔄', title: 'Easy Returns', sub: '30-day policy' },
  { icon: '🔒', title: 'Secure Payment', sub: '100% protected' },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-main">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-pattern" aria-hidden="true" />

        <div className="hero-wrap">
          <div className="hero-left">
            <div className="hero-left-content">
              <span className="hero-badge">✦ Online Marketplace</span>

              <h1 className="hero-title">
                Everything You Need,
                <span className="hero-title-gold"> One Trusted Store</span>
              </h1>

              <p className="hero-subtitle">
                Browse thousands of products across every category — fashion, electronics,
                home, beauty and more. Compare, order, and get it delivered safely to your door.
              </p>

              <div className="hero-search" onClick={() => navigate('/allproducts')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <span>Search products, brands & categories...</span>
                <button
                  type="button"
                  className="hero-search-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Search
                </button>
              </div>

              <div className="hero-buttons">
                <button className="btn-primary hero-cta" onClick={() => navigate('/allproducts')}>
                  Browse All Products
                </button>
                <button className="btn-outline hero-cta-outline" onClick={() => navigate('/allproducts')}>
                  View Deals
                </button>
              </div>

              <div className="hero-tags">
                {categories.map((c) => (
                  <button
                    key={c.label}
                    className="hero-tag-pill"
                    onClick={() => navigate('/allproducts', { state: { category: c.slug } })}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card-grid">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  className="hero-cat-tile"
                  onClick={() => navigate('/allproducts', { state: { category: cat.slug } })}
                >
                  <span className="hero-cat-emoji">{cat.emoji}</span>
                  <span className="hero-cat-label">{cat.label}</span>
                  <span className="hero-cat-arrow">→</span>
                </button>
              ))}
            </div>
            <div className="hero-stat-pill">
              <strong>500+</strong> products · <strong>10k+</strong> happy shoppers
            </div>
          </div>
        </div>
      </div>

      <div className="trust-bar">
        <div className="trust-bar-inner">
          <div className="trust-items">
            {trustItems.map((item) => (
              <div className="trust-item" key={item.title}>
                <span className="trust-icon-wrap" aria-hidden="true">
                  <span className="trust-icon">{item.icon}</span>
                </span>
                <div className="trust-text">
                  <p className="trust-title">{item.title}</p>
                  <p className="trust-sub">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;