import React from 'react';
import { useNavigate } from 'react-router-dom';
import catElectronicsImg from '../assets/cat_electronics.png';
import catGroceryImg from '../assets/cat_grocery.png';
import catFashionImg from '../assets/cat_fashion.png';
import './PromoBanners.css';

const promos = [
  {
    id: 'promo-electronics',
    tag: '⚡ UP TO 60% OFF',
    title: 'Smart Electronics & Home Gadgets',
    subtitle: 'Electric kettles, wireless audio & appliances at factory prices.',
    cta: 'Shop Electronics',
    link: '/allproducts?category=Electronics',
    bg: 'linear-gradient(135deg, #0F172A 0%, #1E3E62 100%)',
    image: catElectronicsImg,
  },
  {
    id: 'promo-grocery',
    tag: '🥦 STARTING @ ₹49',
    title: 'Daily Essentials & Pantry Care',
    subtitle: 'Premium rice, spices & household care delivered safely.',
    cta: 'Explore Grocery',
    link: '/allproducts?category=Grocery',
    bg: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
    image: catGroceryImg,
  },
  {
    id: 'promo-fashion',
    tag: '✨ NEW SEASON',
    title: 'Casual Comfort & Daily Fashion',
    subtitle: 'Classic polo shirts, footwear & trending fashion wear.',
    cta: 'Discover Styles',
    link: '/allproducts?category=Fashion',
    bg: 'linear-gradient(135deg, #831843 0%, #9F1239 100%)',
    image: catFashionImg,
  },
];

const PromoBanners = () => {
  const navigate = useNavigate();

  return (
    <section className="promo-banners-section">
      <div className="container">
        <div className="promo-banners-grid">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="promo-card"
              style={{ background: promo.bg }}
              onClick={() => navigate(promo.link)}
            >
              <div className="promo-content">
                <span className="promo-tag">{promo.tag}</span>
                <h3 className="promo-title">{promo.title}</h3>
                <p className="promo-subtitle">{promo.subtitle}</p>
                <button
                  type="button"
                  className="promo-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(promo.link);
                  }}
                >
                  <span>{promo.cta}</span>
                  <span className="promo-arrow">→</span>
                </button>
              </div>
              <div className="promo-img-wrap">
                <img src={promo.image} alt={promo.title} className="promo-img" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
