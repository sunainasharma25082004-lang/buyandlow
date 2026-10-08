import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import ProductCard from './ProductCard';
import { products as fallbackProducts } from '../data/products';
import './NewArrivals.css';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products`, { params: { sort: 'Newest', limit: 8 } })
      .then((res) => {
        if (!active) return;
        const list = res.data.products || [];
        if (list.length > 0) {
          setProducts(list);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(() => {
        if (active) setProducts(fallbackProducts);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const items = products.length > 0 ? products.slice(0, 6) : fallbackProducts.slice(0, 6);

  return (
    <section className="new-arrivals-section">
      <div className="container">
        {/* Header Bar */}
        <div className="arrivals-header-bar">
          <div className="arrivals-title-wrap">
            <span className="arrivals-sparkle-icon">✨</span>
            <h2 className="arrivals-title">New Arrivals</h2>
            <span className="arrivals-pill-tag">Just In</span>
          </div>

          <button
            type="button"
            className="arrivals-view-all-btn"
            onClick={() => navigate('/allproducts?sort=Newest&title=New Arrivals')}
          >
            <span>View All New</span>
            <span className="view-arrow">→</span>
          </button>
        </div>

        {/* 6-column Grid */}
        {loading ? (
          <div className="arrivals-loading">Loading new arrivals...</div>
        ) : (
          <div className="arrivals-products-grid">
            {items.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;