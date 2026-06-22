import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL, { resolveMediaUrl } from '../config/api';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import './NewArrivals.css';

const StarRating = ({ rating }) => (
  <span className="stars">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
);

const NewArrivals = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/products`, { params: { sort: 'Newest', limit: 6 } })
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="new-arrivals">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <p className="arrivals-subtitle">Freshly added products — latest uploads from our store.</p>
        </div>
        <button
          className="btn-dark arrivals-btn"
          onClick={() => navigate('/allproducts?sort=Newest&title=New Arrivals')}
        >
          View All New
        </button>

        {loading ? (
          <div className="arrivals-loading">Loading latest products...</div>
        ) : products.length === 0 ? (
          <div className="arrivals-empty">No new products yet. Check back soon!</div>
        ) : (
          <div className="arrivals-list">
            {products.map((item) => {
              const prodId = item._id || item.id;
              const desc = typeof item.description === 'string'
                ? item.description.slice(0, 80) + (item.description.length > 80 ? '…' : '')
                : '';

              return (
                <div
                  key={prodId}
                  className="arrival-item"
                  onClick={() => navigate(`/product/${prodId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="arrival-img-wrap">
                    <img src={resolveMediaUrl(item.image)} alt={item.name} className="arrival-img" />
                    {item.badge && <span className="arrival-badge">{item.badge}</span>}
                  </div>
                  <div className="arrival-info">
                    <h3 className="arrival-name">{item.name}</h3>
                    <p className="arrival-desc">{desc}</p>
                    <div className="arrival-rating">
                      <StarRating rating={item.rating || 0} />
                      <span className="rating-count">({item.reviews || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="arrival-price" onClick={(e) => e.stopPropagation()}>
                    <div className="arrival-price-col">
                      <span className="price-current">{formatINR(item.price)}</span>
                      {item.oldPrice && (
                        <span className="price-old">{formatINR(item.oldPrice)}</span>
                      )}
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => addToCart(item, 1, '')}
                      title="Add to Cart"
                    >
                      +
                    </button>
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

export default NewArrivals;