import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import './ProductCard.css';

const badgeClass = (badge) =>
  ({ SALE: 'badge-sale', NEW: 'badge-new', HOT: 'badge-hot' }[badge] || '');

const CardStars = ({ rating = 0 }) => {
  const score = Number(rating) || 0;
  const filled = Math.floor(score);
  const hasHalf = score - filled >= 0.25 && filled < 5;

  return (
    <span className="pc-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const index = i + 1;
        let state = 'empty';
        if (index <= filled) state = 'filled';
        else if (index === filled + 1 && hasHalf) state = 'half';

        return (
          <span key={index} className={`pc-star pc-star--${state}`}>
            ★
          </span>
        );
      })}
    </span>
  );
};

const ProductCard = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useContext(CartContext);

  const prodId = product._id || product.id;
  const isWish = isWishlisted(prodId);
  const rating = Number(product.rating) || 0;
  const reviews = product.reviews || 0;
  const discount =
    product.oldPrice && product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const goToProduct = () => navigate(`/product/${prodId}`);

  return (
    <article
      className={`product-card ${className}`.trim()}
      onClick={goToProduct}
    >
      <div className="product-card-media">
        <img src={product.image} alt={product.name} className="product-card-img" loading="lazy" />

        {product.badge && (
          <span className={`product-card-badge ${badgeClass(product.badge)}`}>
            {product.badge}
          </span>
        )}

        {discount > 0 && (
          <span className="product-card-discount">-{discount}%</span>
        )}

        <button
          type="button"
          className={`product-card-wish ${isWish ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isWish ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isWish ? '♥' : '♡'}
        </button>

        <div className="product-card-actions">
          <button
            type="button"
            className="product-card-action"
            onClick={(e) => {
              e.stopPropagation();
              goToProduct();
            }}
          >
            Quick View
          </button>
          <button
            type="button"
            className="product-card-action product-card-action--gold"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, product.colors?.[0] || '');
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <p className="product-card-cat">{product.category}</p>
        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-bottom">
          <div className="product-card-rating">
            <div className="product-card-rating-main">
              <CardStars rating={rating} />
              <span className="product-card-rating-num">{rating.toFixed(1)}</span>
            </div>
            <span className="product-card-reviews">
              {reviews} {reviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="product-card-price">
            <span className="product-card-price-now">{formatINR(product.price)}</span>
            {product.oldPrice && (
              <span className="product-card-price-was">{formatINR(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;