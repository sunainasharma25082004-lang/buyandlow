import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { resolveMediaUrl } from '../config/api';
import './CartOverlay.css';

const CartOverlay = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    setAuthModalOpen
  } = useContext(CartContext);

  if (!cartOpen) return null;

  const handleCheckoutClick = () => {
    setCartOpen(false);
    if (user) {
      navigate('/checkout');
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="cart-overlay-backdrop" onClick={() => setCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            🛒 Your Cart {cartItems.length > 0 && `(${cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)})`}
          </h2>
          <button className="cart-drawer-close" onClick={() => setCartOpen(false)} aria-label="Close cart">
            &times;
          </button>
        </div>

        {/* Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-cart-icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Explore our best deals on appliances, crockery, and home essentials.</p>
              <button
                className="btn-primary shop-now-btn"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/allproducts');
                }}
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item, idx) => {
                const prod = item.product || {};
                const prodId = prod._id || prod.id;
                const color = item.color;
                const price = prod.price || 0;

                return (
                  <div key={`${prodId}-${color}-${idx}`} className="cart-item-card">
                    <img
                      src={resolveMediaUrl(prod.image) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'}
                      alt={prod.name || 'Product'}
                      className="cart-item-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';
                      }}
                    />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{prod.name}</h4>
                      {color && (
                        <div className="cart-item-meta">
                          <span className="meta-label">Color:</span>
                          <span
                            className="color-dot"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        </div>
                      )}
                      <div className="cart-item-price-qty">
                        <span className="cart-item-price">{formatINR(price)}</span>
                        
                        <div className="cart-qty-selector">
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateCartQuantity(prodId, color, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateCartQuantity(prodId, color, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(prodId, color)}
                      title="Remove item"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-value">{formatINR(getCartTotal())}</span>
            </div>
            <p className="cart-tax-shipping-note">
              Shipping & taxes calculated at checkout.
            </p>
            
            <button className="checkout-btn btn-primary" onClick={handleCheckoutClick}>
              {user ? '⚡ Proceed to Checkout' : '🔑 Sign In to Checkout'}
            </button>
            
            <button
              className="continue-shopping-btn"
              onClick={() => setCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOverlay;
