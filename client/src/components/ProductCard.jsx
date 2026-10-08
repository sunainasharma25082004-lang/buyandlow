import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { resolveMediaUrl } from '../config/api';
import './ProductCard.css';

const CardStars = ({ rating = 0 }) => {
  const score = Number(rating) || 4.5;
  const filled = Math.floor(score);

  return (
    <div className="pc-stars-wrap">
      <span className="pc-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`pc-star ${i < filled ? 'filled' : 'empty'}`}>
            ★
          </span>
        ))}
      </span>
      <span className="pc-rating-num">{score.toFixed(1)}</span>
    </div>
  );
};

const ProductCard = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  const prodId = product._id || product.id;
  const isWish = isWishlisted(prodId);
  const rating = Number(product.rating) || 4.5;
  const discount =
    product.oldPrice && product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const goToProduct = () => navigate(`/product/${prodId}`);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (added) return;
    addToCart(product, 1, product.colors?.[0] || '');
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article
      className={`product-card ${className}`.trim()}
      onClick={goToProduct}
    >
      {/* Top Media: Image, Wishlist Button, Discount Badge */}
      <div className="product-card-media">
        <img
          src={resolveMediaUrl(product.image) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
          }}
        />

        {discount > 0 && (
          <span className="product-card-discount">-{discount}%</span>
        )}

        <button
          type="button"
          className={`product-card-wish ${isWish ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWish ? '♥' : '♡'}
        </button>
      </div>

      {/* Body: Category, Name, Rating, Price, Red Add-to-Cart Button */}
      <div className="product-card-body">
        <p className="product-card-cat">
          {product.category || 'General'}
        </p>

        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-rating">
          <CardStars rating={rating} />
        </div>

        <div className="product-card-price">
          <span className="product-card-price-now">{formatINR(product.price)}</span>
          {product.oldPrice && (
            <span className="product-card-price-was">{formatINR(product.oldPrice)}</span>
          )}
        </div>

        <button
          type="button"
          className={`pc-add-cart-btn ${added ? 'added' : ''}`}
          onClick={handleAddToCart}
        >
          {added ? (
            <span>✓ Added</span>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;