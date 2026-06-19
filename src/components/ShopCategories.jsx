import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './ShopCategories.css';

const ShopCategories = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = ['All', 'Popular', 'New', 'Sale'];

  useEffect(() => {
    axios.get(`${API_URL}/categories`, { params: { home: true } })
      .then((res) => {
        setCategories(res.data.categories || []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (cat) => {
    navigate('/allproducts', { state: { category: cat.name } });
  };

  return (
    <section className="shop-categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop Categories</h2>
          <div className="category-filters">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-btn ${active === f ? 'active' : ''}`}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="view-all-link-btn" onClick={() => navigate('/allproducts')}>View All →</button>
        </div>

        {loading ? (
          <div className="categories-loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="categories-empty">
            <p>Categories will appear here once added from the admin panel.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="category-card"
                onClick={() => handleCategoryClick(cat)}
                style={{ cursor: 'pointer' }}
              >
                <div className="cat-img-wrap">
                  <img src={cat.image} alt={cat.title || cat.name} className="cat-img" />
                  <div className="cat-overlay" />
                </div>
                <div className="cat-info">
                  <h3 className="cat-name">{cat.title || cat.name}</h3>
                  <p className="cat-count">
                    {cat.productCount > 0
                      ? `${cat.productCount} Product${cat.productCount > 1 ? 's' : ''}`
                      : 'Explore collection'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopCategories;