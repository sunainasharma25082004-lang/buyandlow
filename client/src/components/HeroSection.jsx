import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroProductsImg from '../assets/hero_products_composition.png';
import catElectronicsImg from '../assets/cat_electronics.png';
import catGroceryImg from '../assets/cat_grocery.png';
import catFashionImg from '../assets/cat_fashion.png';
import catHomeImg from '../assets/cat_home.png';
import './HeroSection.css';

const slides = [
  {
    id: 'fresh-collections',
    badge: '★ SPECIAL OFFER',
    titleFresh: 'Fresh',
    titleHighlight: 'Collections',
    subtitle: 'Top brands • Great prices • Everything for your home',
    ctaText: 'Shop Now',
    ctaLink: '/allproducts',
    bgGradient: 'linear-gradient(135deg, #0266D6 0%, #0159C7 45%, #086FDF 100%)',
    image: heroProductsImg,
    imageAlt: 'Quality Products For a Better Tomorrow',
    trustBadges: [
      { icon: '🚚', title: 'Free Shipping', sub: 'Orders over ₹299' },
      { icon: '🛡️', title: 'Secure Payments', sub: '100% safe & secure' },
      { icon: '🔄', title: 'Easy Returns', sub: 'Hassle free shopping' },
    ],
  },
  {
    id: 'electronics-fest',
    badge: '⚡ UP TO 60% OFF',
    titleFresh: 'Smart',
    titleHighlight: 'Electronics',
    subtitle: 'Kettles, Earbuds, Massagers & Appliances at Factory Direct Prices',
    ctaText: 'Explore Electronics',
    ctaLink: '/allproducts?category=Electronics',
    bgGradient: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 50%, #004085 100%)',
    image: catElectronicsImg,
    imageAlt: 'Electronics Fest Deals',
    trustBadges: [
      { icon: '⚡', title: 'Superfast Dispatch', sub: 'Ships in 24 Hours' },
      { icon: '🔋', title: '1-Year Warranty', sub: 'Genuine Products' },
      { icon: '⭐', title: 'Top Rated Audio', sub: '4.8★ Avg Customer Score' },
    ],
  },
  {
    id: 'grocery-super-saver',
    badge: '🥦 DAILY SAVER BASKET',
    titleFresh: 'Essential',
    titleHighlight: 'Groceries',
    subtitle: 'Kitchen staples, pantry favorites & daily care delivered to your door',
    ctaText: 'Shop Grocery Deals',
    ctaLink: '/allproducts?category=Grocery',
    bgGradient: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%)',
    image: catGroceryImg,
    imageAlt: 'Fresh Groceries and Essentials',
    trustBadges: [
      { icon: '🌿', title: '100% Fresh & Pure', sub: 'Hygienic Packing' },
      { icon: '💰', title: 'Lowest Price in India', sub: 'Direct Mill Sourced' },
      { icon: '📦', title: 'Safe Doorstep Delivery', sub: 'Zero Hassle' },
    ],
  },
  {
    id: 'fashion-lifestyle',
    badge: '✨ NEW SEASON STYLES',
    titleFresh: 'Trending',
    titleHighlight: 'Fashion',
    subtitle: 'Comfortable polo tees, footwear & casual daily wear for everyone',
    ctaText: 'Discover Fashion',
    ctaLink: '/allproducts?category=Fashion',
    bgGradient: 'linear-gradient(135deg, #831843 0%, #9F1239 50%, #BE123C 100%)',
    image: catFashionImg,
    imageAlt: 'Fashion & Lifestyle Trends',
    trustBadges: [
      { icon: '👕', title: 'Premium Comfort', sub: 'Breathable Fabrics' },
      { icon: '👟', title: 'Latest Trends', sub: 'Men, Women & Kids' },
      { icon: '🏷️', title: 'Extra ₹100 Off', sub: 'On Prepaid Orders' },
    ],
  },
  {
    id: 'home-kitchen-carnival',
    badge: '🏡 HOME MAKEOVER SALE',
    titleFresh: 'Modern',
    titleHighlight: 'Living & Decor',
    subtitle: 'Organizer boxes, cookware & home decor to elevate your living spaces',
    ctaText: 'Explore Home & Living',
    ctaLink: '/allproducts?category=Home',
    bgGradient: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
    image: catHomeImg,
    imageAlt: 'Home & Kitchen Makeover',
    trustBadges: [
      { icon: '🪴', title: 'Premium Aesthetic', sub: 'Modern Minimalist' },
      { icon: '🍳', title: 'Kitchenware Essentials', sub: 'High Durability' },
      { icon: '📦', title: 'Fragile Care Packing', sub: 'Zero Breakage Guarantee' },
    ],
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
  };

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  return (
    <section className="hero-section">
      <div className="container">
        <div
          className="hero-slider-wrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Overflow viewport */}
          <div className="hero-slider-viewport">
            {/* Sliding Track */}
            <div
              className="hero-slider-track"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="hero-slide-pane">
                  <div
                    className="hero-banner-card"
                    style={{ background: slide.bgGradient }}
                  >
                    {/* Left Column */}
                    <div className="hero-banner-left">
                      <span className="hero-banner-badge">{slide.badge}</span>

                      <h1 className="hero-banner-title">
                        <span className="hero-title-fresh">{slide.titleFresh}</span>{' '}
                        <span className="hero-title-collections">{slide.titleHighlight}</span>
                      </h1>

                      <p className="hero-banner-subtitle">
                        {slide.subtitle}
                      </p>

                      <button
                        type="button"
                        className="hero-btn-shop"
                        onClick={() => navigate(slide.ctaLink)}
                      >
                        <span>{slide.ctaText}</span>
                        <span className="hero-btn-arrow">→</span>
                      </button>

                      <div className="hero-trust-list">
                        {slide.trustBadges.map((feat) => (
                          <div key={feat.title} className="hero-trust-item">
                            <span className="hero-trust-icon-emoji">{feat.icon}</span>
                            <div className="hero-trust-info">
                              <span className="hero-trust-title">{feat.title}</span>
                              <span className="hero-trust-sub">{feat.sub}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="hero-banner-right">
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        className="hero-banner-composition-img"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            className="hero-arrow-btn hero-arrow-prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-arrow-btn hero-arrow-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>

          {/* Slide Indicator Dots */}
          <div className="hero-dots-container">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;