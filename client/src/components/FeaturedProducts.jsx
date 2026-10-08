import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

const FeaturedProducts = ({ onLoadedProducts }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products`, { params: { limit: 12, sort: 'Popular' } })
      .then((res) => {
        if (!active) return;
        const list = res.data.products || [];
        const seen = new Set();
        const unique = list.filter((p) => {
          const id = String(p._id || p.id || '');
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setProducts(unique);
        if (onLoadedProducts) onLoadedProducts(unique);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="featured-products">
      <div className="container">
        {/* Section Header */}
        <div className="trending-header-bar">
          <h2 className="trending-title">Trending Products</h2>
          <button
            type="button"
            className="trending-view-all-btn"
            onClick={() => navigate('/allproducts?sort=Popular&title=Trending Products')}
          >
            <span>View All</span>
            <span className="view-arrow">→</span>
          </button>
        </div>

        {loading ? (
          <div className="products-loading">Loading trending products...</div>
        ) : products.length === 0 ? (
          <div className="products-empty">Products will appear here once added from the catalog.</div>
        ) : (
          <div className="trending-products-grid">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;