import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL, { resolveMediaUrl } from '../config/api';
import { CartContext } from '../context/CartContext';
import { formatINR, formatINRPlain, FREE_SHIPPING_MIN } from '../utils/currency';
import { products as fallbackProducts } from '../data/products';
import './HeroSection.css';

const categories = [
  { label: 'Fashion', emoji: '👗', slug: 'Fashion' },
  { label: 'Electronics', emoji: '📱', slug: 'Electronics' },
  { label: 'Home & Living', emoji: '🏠', slug: 'Home' },
  { label: 'Beauty', emoji: '✨', slug: 'Beauty' },
];

const heroHighlights = [
  { icon: '🚚', label: 'Free Shipping', value: `Orders over ${formatINRPlain(FREE_SHIPPING_MIN, { decimals: 0 })}` },
  { icon: '⚡', label: 'Fast Delivery', value: 'Track every order' },
  { icon: '🔄', label: 'Easy Returns', value: '30-day policy' },
];

const trustItems = [
  { icon: '🚚', title: 'Free Shipping', sub: `On orders over ${formatINRPlain(FREE_SHIPPING_MIN, { decimals: 0 })}` },
  { icon: '📦', title: 'Fast Delivery', sub: 'Track every order' },
  { icon: '🔄', title: 'Easy Returns', sub: '30-day policy' },
  { icon: '🔒', title: 'Secure Payment', sub: '100% protected' },
];

const Stars = ({ rating = 0 }) => {
  const score = Number(rating) || 0;
  const filled = Math.floor(score);
  return (
    <span className="hero-stars" aria-label={`Rating ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`hero-star ${i < filled ? 'filled' : 'empty'}`}>
          ★
        </span>
      ))}
    </span>
  );
};

const DEFAULT_FALLBACK_IMG = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';

const HeroSection = () => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const marqueeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_URL}/products`, { params: { limit: 12, sort: 'Popular' } })
      .then((res) => {
        if (!isMounted) return;
        const list = res.data.products || [];
        if (list.length > 0) {
          setProducts(list);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(() => {
        if (isMounted) setProducts(fallbackProducts);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter((p) => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

  const activeList = filteredProducts.length > 0 ? filteredProducts : products;

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const prodId = product._id || product.id;
    addToCart(product, 1, product.colors?.[0] || '');
    setAddedId(prodId);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleScrollLeft = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-main">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-pattern" aria-hidden="true" />

        <div className="hero-container">
          {/* TOP SECTION: Auto-Sliding Marquee Showcase */}
          <div className="hero-slider-section">
            <div
              className="hero-slider-card"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Header Bar */}
              <div className="hero-slider-header">
                <div className="hero-slider-badge">
                  <span className="hero-pulse-dot" />
                  <span>TRENDING PRODUCTS (LIVE SHOWCASE)</span>
                </div>

                <div className="hero-slider-categories">
                  {['All', 'Electronics', 'Fashion', 'Beauty', 'Home'].map((cat) => (
                    <button
                      key={cat}
                      className={`hero-slider-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="hero-slider-counter">
                  <span className="current-num">{activeList.length}</span>
                  <span className="total-label"> Products</span>
                </div>
              </div>

              {/* Marquee Track Container */}
              {loading ? (
                <div className="hero-multi-skeleton">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="skeleton-card">
                      <div className="skeleton-img" />
                      <div className="skeleton-line short" />
                      <div className="skeleton-line long" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hero-marquee-container" ref={marqueeRef}>
                  <div className={`hero-marquee-track ${isPaused ? 'paused' : ''}`}>
                    {[...activeList, ...activeList].map((product, index) => {
                      const prodId = product._id || product.id;
                      const isWish = isWishlisted(prodId);
                      const discount =
                        product.oldPrice && product.price
                          ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                          : null;

                      return (
                        <div
                          key={`${prodId}-${index}`}
                          className="hero-product-card"
                          onClick={() => navigate(`/product/${prodId}`)}
                        >
                          <div className="hero-card-media">
                            <img
                              src={resolveMediaUrl(product.image) || DEFAULT_FALLBACK_IMG}
                              alt={product.name}
                              className="hero-card-img"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_FALLBACK_IMG;
                              }}
                            />

                            {product.badge && (
                              <span className={`hero-card-tag tag-${product.badge.toLowerCase()}`}>
                                {product.badge}
                              </span>
                            )}

                            {discount > 0 && (
                              <span className="hero-card-discount">-{discount}% OFF</span>
                            )}

                            <button
                              type="button"
                              className={`hero-card-wish ${isWish ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product);
                              }}
                              title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              {isWish ? '♥' : '♡'}
                            </button>

                            <div className="hero-card-overlay-hint">
                              <span>Quick View ↗</span>
                            </div>
                          </div>

                          <div className="hero-card-body">
                            <div className="hero-card-meta">
                              <span className="hero-card-cat">{product.category}</span>
                              <div className="hero-card-rating">
                                <Stars rating={product.rating} />
                                <span className="hero-rating-val">{(Number(product.rating) || 0).toFixed(1)}</span>
                              </div>
                            </div>

                            <h3 className="hero-card-title" title={product.name}>
                              {product.name}
                            </h3>

                            <div className="hero-card-price-row">
                              <div className="hero-card-prices">
                                <span className="hero-price-now">{formatINR(product.price)}</span>
                                {product.oldPrice && (
                                  <span className="hero-price-was">{formatINR(product.oldPrice)}</span>
                                )}
                              </div>
                            </div>

                            <div className="hero-card-actions">
                              <button
                                type="button"
                                className={`hero-btn-add ${addedId === prodId ? 'added' : ''}`}
                                onClick={(e) => handleAddToCart(e, product)}
                              >
                                {addedId === prodId ? 'Added! ✓' : 'Add 🛒'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Arrows for manual scrolling */}
              <button
                type="button"
                className="hero-nav-arrow prev"
                onClick={handleScrollLeft}
                aria-label="Scroll Left"
              >
                ‹
              </button>
              <button
                type="button"
                className="hero-nav-arrow next"
                onClick={handleScrollRight}
                aria-label="Scroll Right"
              >
                ›
              </button>


            </div>
          </div>

          {/* LOWER SECTION: Information Text (Styled & Fully Responsive) */}
          <div className="hero-info-section">
            <div className="hero-info-card">
              <div className="hero-info-header">
                <span className="hero-badge">✦ Premium Online Store</span>

                <h1 className="hero-title">
                  Everything You Need,
                  <span className="hero-title-gold"> One Trusted Store</span>
                </h1>

                <p className="hero-subtitle">
                  Browse thousands of products across every category — fashion, electronics,
                  home, beauty and more. Compare, order, and get it delivered safely to your door.
                </p>
              </div>

              <div className="hero-highlights">
                {heroHighlights.map((item) => (
                  <div className="hero-highlight" key={item.label}>
                    <span className="hero-highlight-icon" aria-hidden="true">{item.icon}</span>
                    <div className="hero-highlight-text">
                      <strong>{item.label}</strong>
                      <span>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hero-bottom-actions">
                <div className="hero-buttons">
                  <button className="btn-primary hero-cta" onClick={() => navigate('/allproducts')}>
                    Browse All Products 🛍️
                  </button>
                  <button className="btn-outline hero-cta-outline" onClick={() => navigate('/allproducts?sort=Popular')}>
                    View Best Deals 🔥
                  </button>
                </div>

                <div className="hero-tags">
                  {categories.map((c) => (
                    <button
                      key={c.label}
                      className={`hero-tag-pill ${activeCategory === c.slug ? 'active' : ''}`}
                      onClick={() => {
                        if (activeCategory === c.slug) {
                          setActiveCategory('All');
                        } else {
                          setActiveCategory(c.slug);
                        }
                      }}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
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