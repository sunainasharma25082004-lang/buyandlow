import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL, { resolveMediaUrl } from '../config/api';
import './ShopCategories.css';

const PALETTES = [
  { bg: '#E8F1FD', border: '#BFDBFE', badgeBg: '#DBEAFE', badgeColor: '#1D4ED8' },
  { bg: '#FAF4E8', border: '#FDE68A', badgeBg: '#FEF3C7', badgeColor: '#B45309' },
  { bg: '#EAF7EE', border: '#A7F3D0', badgeBg: '#D1FAE5', badgeColor: '#047857' },
  { bg: '#F8EBF9', border: '#E9D5FF', badgeBg: '#F3E8FF', badgeColor: '#7E22CE' },
  { bg: '#FDEDE8', border: '#FECDD3', badgeBg: '#FFE4E6', badgeColor: '#BE123C' },
];

const ShopCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/categories`)
      .then((res) => {
        if (!active) return;
        const list = res.data.categories || [];
        setCategories(list.filter((c) => c.isActive !== false));
      })
      .catch((err) => {
        console.warn('Could not load categories:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCategoryClick = (cat) => {
    const catName = cat.name;
    const catTitle = cat.title || cat.displayName || cat.name;
    navigate(`/allproducts?category=${encodeURIComponent(catName)}&title=${encodeURIComponent(catTitle)}`);
  };

  const displayList = categories.length > 0 ? categories : [];

  return (
    <section className="shop-categories-section">
      <div className="container">
        {/* Section Header */}
        <div className="categories-header-bar">
          <div>
            <h2 className="categories-title">Shop by Category</h2>
            <p className="categories-subtitle">Discover curated collections at guaranteed low prices</p>
          </div>
          <button
            type="button"
            className="categories-view-all-btn"
            onClick={() => navigate('/allproducts')}
          >
            <span>View All</span>
            <span className="view-arrow">→</span>
          </button>
        </div>

        {/* Category Cards Grid */}
        {loading ? (
          <div className="categories-skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cat-skeleton-card" />
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="categories-empty-state">
            <p>Categories will appear here once added from the admin panel.</p>
          </div>
        ) : (
          <div className="categories-row-grid">
            {displayList.map((cat, idx) => {
              const palette = PALETTES[idx % PALETTES.length];
              const title = cat.title || cat.displayName || cat.name;
              const subText =
                cat.subcategories && cat.subcategories.length > 0
                  ? cat.subcategories.slice(0, 2).join(', ')
                  : `${cat.productCount || 0} items`;
              const imageUrl = resolveMediaUrl(cat.image);

              return (
                <div
                  key={cat._id || cat.name}
                  className="category-pill-card"
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                  }}
                  onClick={() => handleCategoryClick(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCategoryClick(cat);
                  }}
                >
                  <div className="cat-card-top-badge">
                    <span
                      className="cat-badge-pill"
                      style={{ backgroundColor: palette.badgeBg, color: palette.badgeColor }}
                    >
                      {cat.productCount ? `${cat.productCount} Items` : 'Featured'}
                    </span>
                  </div>

                  <div className="cat-card-media">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="cat-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="cat-fallback-icon">📦</span>';
                        }}
                      />
                    ) : (
                      <span className="cat-fallback-icon">📦</span>
                    )}
                  </div>

                  <div className="cat-card-content">
                    <h3 className="cat-card-title">{title}</h3>
                    <p className="cat-card-subtitle">{subText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopCategories;