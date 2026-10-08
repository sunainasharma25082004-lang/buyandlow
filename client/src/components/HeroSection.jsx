import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroProductsImg from '../assets/hero_products_composition.png';
import './HeroSection.css';

const trustFeatures = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Free Shipping',
    sub: 'Orders over ₹299',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure Payments',
    sub: '100% safe & secure',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
    title: 'Easy Returns',
    sub: 'Hassle free shopping',
  },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-banner-card">
          {/* Left Column: Heading, Subtitle, CTA Button, Trust Row */}
          <div className="hero-banner-left">
            <h1 className="hero-banner-title">
              <span className="hero-title-fresh">Fresh</span>{' '}
              <span className="hero-title-collections">Collections</span>
            </h1>

            <p className="hero-banner-subtitle">
              Top brands • Great prices • Everything for your home
            </p>

            <button
              type="button"
              className="hero-btn-shop"
              onClick={() => navigate('/allproducts')}
            >
              <span>Shop Now</span>
              <span className="hero-btn-arrow">→</span>
            </button>

            <div className="hero-trust-list">
              {trustFeatures.map((feat) => (
                <div key={feat.title} className="hero-trust-item">
                  <div className="hero-trust-icon">{feat.icon}</div>
                  <div className="hero-trust-info">
                    <span className="hero-trust-title">{feat.title}</span>
                    <span className="hero-trust-sub">{feat.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Composition with Products & Script */}
          <div className="hero-banner-right">
            <img
              src={heroProductsImg}
              alt="Quality Products For a Better Tomorrow"
              className="hero-banner-composition-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;