import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { resolveMediaUrl } from '../config/api';
import './Wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart, removeFromWishlist } = useContext(CartContext);

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div className="container">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>Home</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">My Favourites</span>
          </div>
          <h1 className="wishlist-title">My Favourites</h1>
          <p className="wishlist-desc">
            {wishlist.length > 0
              ? `${wishlist.length} saved item${wishlist.length > 1 ? 's' : ''} you love`
              : 'Save products you love by clicking the heart icon'}
          </p>
        </div>
      </div>

      <div className="container wishlist-body">
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <span className="empty-heart">♡</span>
            <h2>No favourites yet</h2>
            <p>Tap the heart on any product to add it here.</p>
            <button className="btn-primary" onClick={() => navigate('/allproducts')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => {
              const prodId = product._id || product.id || product;
              return (
                <div key={prodId} className="wishlist-card">
                  <button
                    className="wishlist-remove"
                    onClick={() => removeFromWishlist(prodId)}
                    title="Remove from favourites"
                  >
                    ✕
                  </button>
                  <div
                    className="wishlist-img-wrap"
                    onClick={() => navigate(`/product/${prodId}`)}
                  >
                    <img src={resolveMediaUrl(product.image)} alt={product.name || 'Product'} />
                    {product.badge && (
                      <span className={`wl-badge badge-${product.badge.toLowerCase()}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="wishlist-info">
                    <h3 onClick={() => navigate(`/product/${prodId}`)}>{product.name}</h3>
                    <p className="wl-category">{product.category}</p>
                    <div className="wl-price-row">
                      <span className="wl-price">{formatINR(product.price)}</span>
                      {product.oldPrice && (
                        <span className="wl-old-price">{formatINR(product.oldPrice)}</span>
                      )}
                    </div>
                    <div className="wl-actions">
                      <button
                        type="button"
                        className="btn-primary wl-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1, '');
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        className="btn-outline wl-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${prodId}`);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;