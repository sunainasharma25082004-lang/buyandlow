import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import ProductCard from './ProductCard';
import './SummerCollection.css';

const getDiscount = (product) => {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
};

const SummerCollection = ({ excludeIds = [] }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/products`, { params: { limit: 8, sale: true, sort: 'Price: High to Low' } })
      .then((res) => {
        const list = res.data.products || [];
        const seen = new Set();
        const unique = list.filter((p) => {
          const id = String(p._id || p.id || '');
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setProducts(unique);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const availableProducts = (products || []).filter(
    (p) => !excludeIds.includes(String(p._id || p.id))
  );

  if (!loading && availableProducts.length === 0) {
    return null;
  }

  return (
    <section className="summer-collection sale-section">
      <div className="container">
        <div className="sale-section-header">
          <div>
            <p className="section-eyebrow">Limited Deals</p>
            <h2 className="section-title">Sale &amp; Discounts</h2>
            <p className="sale-section-sub">Products with special percent-off pricing</p>
          </div>
          <button
            className="btn-primary sale-view-btn"
            onClick={() => navigate('/allproducts?sale=true&title=Sale Items&desc=Products with percent-off deals')}
          >
            Shop All Sale →
          </button>
        </div>

        {loading ? (
          <div className="sale-loading">Loading sale items...</div>
        ) : availableProducts.length === 0 ? (
          <div className="sale-empty">No sale items right now. Check back soon!</div>
        ) : (
          <div className="sale-products-grid">
            {availableProducts.map((product) => (
              <div key={product._id || product.id} className="sale-card-wrap">
                {getDiscount(product) > 0 && (
                  <span className="sale-discount-tag">-{getDiscount(product)}%</span>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SummerCollection;