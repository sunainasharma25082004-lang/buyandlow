import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import catElectronicsImg from '../assets/cat_electronics.png';
import catGroceryImg from '../assets/cat_grocery.png';
import catFashionImg from '../assets/cat_fashion.png';
import './PromoSlider.css';

const promoSlides = [
  {
    id: 'slide-tech',
    tag: '⚡ MEGA ELECTRONICS CARNIVAL',
    title: 'Smart Tech & Home Gadgets Fest',
    desc: 'Grab top-selling electronic kettles, wireless earbuds & lifestyle gadgets at direct factory pricing.',
    discount: 'UP TO 60% OFF',
    buttonText: 'Shop Tech Deals',
    link: '/allproducts?category=Electronics',
    bg: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 60%, #004085 100%)',
    image: catElectronicsImg,
  },
  {
    id: 'slide-grocery',
    tag: '🥦 PANTRY SUPER SAVERS',
    title: 'Monthly Groceries & Daily Needs',
    desc: 'Stock up your kitchen with basmati rice, lentils, spices and cleaning care with doorstep delivery.',
    discount: 'STARTING @ ₹49',
    buttonText: 'Explore Groceries',
    link: '/allproducts?category=Grocery',
    bg: 'linear-gradient(135deg, #064E3B 0%, #047857 60%, #059669 100%)',
    image: catGroceryImg,
  },
  {
    id: 'slide-fashion',
    tag: '✨ WEEKEND FASHION REFRESH',
    title: 'Casual Comfort & Trendsetter Styles',
    desc: 'Upgrade your daily wardrobe with breathable polo t-shirts, sneakers, and casual wear.',
    discount: 'BUY 2 GET EXTRA ₹150 OFF',
    buttonText: 'Discover Fashion',
    link: '/allproducts?category=Fashion',
    bg: 'linear-gradient(135deg, #831843 0%, #9F1239 60%, #BE123C 100%)',
    image: catFashionImg,
  },
];

const PromoSlider = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const total = promoSlides.length;

  const next = () => setCurrent((prev) => (prev + 1) % total);
  const prev = () => setCurrent((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % total);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [isPaused, total]);

  return (
    <section className="promo-slider-section">
      <div className="container">
        <div
          className="promo-slider-wrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="promo-slider-viewport">
            <div
              className="promo-slider-track"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {promoSlides.map((slide) => (
                <div key={slide.id} className="promo-slide-item">
                  <div className="promo-slide-card" style={{ background: slide.bg }}>
                    <div className="promo-slide-text">
                      <div className="promo-slide-badges">
                        <span className="promo-slide-tag">{slide.tag}</span>
                        <span className="promo-slide-discount">{slide.discount}</span>
                      </div>
                      <h3 className="promo-slide-title">{slide.title}</h3>
                      <p className="promo-slide-desc">{slide.desc}</p>
                      <button
                        type="button"
                        className="promo-slide-cta"
                        onClick={() => navigate(slide.link)}
                      >
                        <span>{slide.buttonText}</span>
                        <span className="cta-arrow">→</span>
                      </button>
                    </div>

                    <div className="promo-slide-media">
                      <img src={slide.image} alt={slide.title} className="promo-slide-img" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button type="button" className="promo-arrow-btn promo-arrow-prev" onClick={prev} aria-label="Previous promo">
            ‹
          </button>
          <button type="button" className="promo-arrow-btn promo-arrow-next" onClick={next} aria-label="Next promo">
            ›
          </button>

          {/* Dots */}
          <div className="promo-dots">
            {promoSlides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`promo-dot ${idx === current ? 'active' : ''}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to promo slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSlider;
