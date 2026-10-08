import React from 'react';
import { useNavigate } from 'react-router-dom';

import catGroceryImg from '../assets/cat_grocery.png';
import catElectronicsImg from '../assets/cat_electronics.png';
import catFashionImg from '../assets/cat_fashion.png';
import catHomeImg from '../assets/cat_home.png';
import catBeautyImg from '../assets/cat_beauty.png';

import './ShopCategories.css';

const categoryList = [
  {
    id: 'grocery',
    name: 'Grocery',
    title: 'Grocery',
    subtitle: 'Daily Essentials',
    bg: '#EAF7EE',
    image: catGroceryImg,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    title: 'Electronics',
    subtitle: 'Mobiles, Headphones & More',
    bg: '#E8F1FD',
    image: catElectronicsImg,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    title: 'Fashion',
    subtitle: 'Men, Women & Kids',
    bg: '#FDEDE8',
    image: catFashionImg,
  },
  {
    id: 'home',
    name: 'Home',
    title: 'Home',
    subtitle: 'Furniture, Decor & More',
    bg: '#FAF4E8',
    image: catHomeImg,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    title: 'Beauty',
    subtitle: 'Skincare, Makeup & More',
    bg: '#F8EBF9',
    image: catBeautyImg,
  },
];

const ShopCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    navigate(`/allproducts?category=${encodeURIComponent(cat.name)}&title=${encodeURIComponent(cat.title)}`);
  };

  return (
    <section className="shop-categories-section">
      <div className="container">
        {/* Section Header */}
        <div className="categories-header-bar">
          <h2 className="categories-title">Shop by Category</h2>
          <button
            type="button"
            className="categories-view-all-btn"
            onClick={() => navigate('/allproducts')}
          >
            <span>View All</span>
            <span className="view-arrow">→</span>
          </button>
        </div>

        {/* 5 Pastel Category Cards Grid */}
        <div className="categories-row-grid">
          {categoryList.map((cat) => (
            <div
              key={cat.id}
              className="category-pill-card"
              style={{ backgroundColor: cat.bg }}
              onClick={() => handleCategoryClick(cat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCategoryClick(cat);
              }}
            >
              <div className="cat-card-media">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="cat-card-img"
                  loading="lazy"
                />
              </div>
              <div className="cat-card-content">
                <h3 className="cat-card-title">{cat.title}</h3>
                <p className="cat-card-subtitle">{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;