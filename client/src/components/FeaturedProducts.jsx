import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [tabs, setTabs] = useState(['All']);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/categories`)
      .then((res) => {
        const names = (res.data.categories || []).map((c) => c.name);
        if (names.length) setTabs(['All', ...names.slice(0, 4)]);
      })
      .catch(() => {});

    axios
      .get(`${API_URL}/products`, { params: { limit: 8, sort: 'Popular' } })
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'All'
    ? products
    : products.filter((p) => p.category === activeTab);

  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Most Loved</p>
            <h2 className="section-title">Popular Products</h2>
          </div>
          <div className="product-tabs">
            {tabs.map((t) => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <button
            className="view-all-link-btn"
            onClick={() => navigate('/allproducts?sort=Popular&title=Popular Products')}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="products-loading">Loading popular products...</div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">No products yet.</div>
        ) : (
          <div className="products-grid">
            {filtered.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}

        <div className="view-all-center">
          <button
            className="btn-dark view-all-btn"
            onClick={() => navigate('/allproducts?sort=Popular&title=Popular Products')}
          >
            View Popular Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;