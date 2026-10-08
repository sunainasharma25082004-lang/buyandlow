import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import ProductCard from './ProductCard';
import { products as fallbackProducts } from '../data/products';
import './FlashDeals.css';

const FlashDeals = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live countdown timer (simulating 8 hours 45 mins countdown)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products`, { params: { limit: 12, sale: true } })
      .then((res) => {
        if (!active) return;
        const list = res.data.products || [];
        if (list.length > 0) {
          setProducts(list);
        } else {
          setProducts(fallbackProducts.filter((p) => p.oldPrice));
        }
      })
      .catch(() => {
        if (active) setProducts(fallbackProducts.filter((p) => p.oldPrice));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatDigit = (n) => String(n).padStart(2, '0');

  const dealProducts = products.length > 0 ? products.slice(0, 6) : fallbackProducts.slice(0, 6);

  return (
    <section className="flash-deals-section">
      <div className="container">
        {/* Header Bar */}
        <div className="flash-deals-header">
          <div className="flash-deals-title-wrap">
            <span className="flash-icon-zap">⚡</span>
            <h2 className="flash-deals-title">Today's Flash Deals</h2>
            <div className="flash-timer-badge">
              <span className="timer-label">Ends in</span>
              <span className="timer-box">{formatDigit(timeLeft.hours)}h</span>
              <span className="timer-colon">:</span>
              <span className="timer-box">{formatDigit(timeLeft.minutes)}m</span>
              <span className="timer-colon">:</span>
              <span className="timer-box">{formatDigit(timeLeft.seconds)}s</span>
            </div>
          </div>

          <button
            type="button"
            className="flash-view-all-btn"
            onClick={() => navigate('/allproducts?sale=true&title=Flash Deals')}
          >
            <span>View All Deals</span>
            <span className="view-arrow">→</span>
          </button>
        </div>

        {/* Deals Products Grid */}
        {loading ? (
          <div className="flash-loading">Loading flash deals...</div>
        ) : (
          <div className="flash-products-grid">
            {dealProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashDeals;
