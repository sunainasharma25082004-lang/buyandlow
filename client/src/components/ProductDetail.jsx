import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import API_URL, { resolveMediaUrl } from '../config/api';
import ProductRating from './ProductRating';
import { formatINR, formatINRPlain, FREE_SHIPPING_MIN } from '../utils/currency';
import "./ProductDetail.css";

const StarRating = ({ rating = 0, size = 14 }) => (
  <span className="stars" style={{ fontSize: size }}>
    {"★".repeat(Math.floor(rating))}
    {"☆".repeat(5 - Math.floor(rating))}
  </span>
);

const badgeClass = (b) =>
  ({ SALE: "badge-sale", NEW: "badge-new", HOT: "badge-hot" }[b] || "");

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, setAuthModalOpen } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeColor, setActiveColor] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [cartAdded, setCartAdded] = useState(false);

  // Fetch product from MERN Backend
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products/${id}/reviews`);
        setReviewsData(res.data);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id, user]);

  const handleReviewSubmitted = (data) => {
    setReviewsData((prev) => ({
      ...prev,
      userReview: data.review,
      canReview: true,
      averageRating: data.productRating,
      totalReviews: data.productReviews,
      reviews: prev?.userReview
        ? prev.reviews.map((r) => (r._id === data.review._id ? data.review : r))
        : [data.review, ...(prev?.reviews || [])],
    }));
    setProduct((prev) => prev ? { ...prev, rating: data.productRating, reviews: data.productReviews } : prev);
  };

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-wrap pd-error-container">
        <h2>⚠️ {error || 'Product not found'}</h2>
        <button className="btn-dark back-btn" onClick={() => navigate('/allproducts')}>
          Back to Shop
        </button>
      </div>
    );
  }

  const images = (
    product.images?.length > 0
      ? product.images
      : [product.image || '/placeholder.png']
  ).map(resolveMediaUrl);

  const discount =
    product.oldPrice && product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : null;

  const isWish = isWishlisted(product._id || product.id);

  const handleAddCart = () => {
    const color = product.colors?.length > 0 ? product.colors[activeColor] : '';
    addToCart(product, qty, color);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const color = product.colors?.length > 0 ? product.colors[activeColor] : '';
    addToCart(product, qty, color);
    navigate('/checkout');
  };

  return (
    <div className="pd-page">
      {/* Breadcrumbs */}
      <div className="breadcrumb-bar">
        <div className="pd-wrap">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>Home</span>
            <span className="bc-sep">›</span>
            <span className="bc-link" onClick={() => navigate('/allproducts')}>Shop</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="pd-wrap pd-body">
        <div className="pd-top">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="pd-main-img"
              />

              {product.badge && (
                <span className={`product-badge ${badgeClass(product.badge)}`}>
                  {product.badge}
                </span>
              )}

              {discount && (
                <span className="discount-badge">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="pd-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${
                    activeImg === i ? "active" : ""
                  }`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`thumb-${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="pd-info">
            <div className="pd-brand-row">
              <span className="pd-brand">
                {product.brand || "Artisanal"}
              </span>

              {product.badge && (
                <span className={`pd-badge ${badgeClass(product.badge)}`}>
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-rating-row">
              <button
                type="button"
                className="pd-rating-link"
                onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                aria-label="View product reviews"
              >
                <StarRating rating={reviewsData?.averageRating || product.rating || 0} size={16} />
                <span className="pd-rating-num">
                  {reviewsData?.averageRating || product.rating || 0}
                </span>
                <span className="pd-rating-count">
                  ({reviewsData?.totalReviews ?? product.reviews ?? 0} reviews)
                </span>
              </button>
              <span className="pd-in-stock">In Stock</span>
            </div>

            <div className="pd-price-row">
              <span className="pd-price-current">
                {formatINR(product.price || 0)}
              </span>

              {product.oldPrice && (
                <>
                  <span className="pd-price-old">
                    {formatINR(product.oldPrice)}
                  </span>

                  <span className="pd-price-save">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="pd-short-desc">
              {product.description
                ? product.description.split("\n")[0]
                : "No description available"}
            </p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="pd-option-row">
                <span className="pd-option-label">Color:</span>

                <div className="pd-colors">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      className={`pd-color-btn ${
                        activeColor === i ? "active" : ""
                      }`}
                      style={{ background: color }}
                      onClick={() => setActiveColor(i)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pd-option-row">
              <span className="pd-option-label">Quantity:</span>

              <div className="pd-qty">
                <button
                  className="qty-btn"
                  onClick={() =>
                    setQty((q) => Math.max(1, q - 1))
                  }
                >
                  -
                </button>

                <span className="qty-val">{qty}</span>

                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="pd-actions">
              <button
                className={`btn-add-cart ${
                  cartAdded ? "added" : ""
                }`}
                onClick={handleAddCart}
              >
                {cartAdded
                  ? "✓ Added to Cart!"
                  : "🛒 Add to Cart"}
              </button>

              <button className="btn-buy-now" onClick={handleBuyNow}>
                ⚡ Buy Now
              </button>

              <button
                className={`btn-wishlist ${
                  isWish ? "active" : ""
                }`}
                onClick={() => toggleWishlist(product)}
              >
                {isWish ? "♥" : "♡"}
              </button>
            </div>

            <div className="pd-meta">
              <p>
                <span>SKU:</span> {product.sku || "N/A"}
              </p>

              <p>
                <span>Category:</span> {product.category || "N/A"}
              </p>

              <p>
                <span>Tags:</span> {product.tags?.join(", ") || "N/A"}
              </p>
            </div>
          </div>

          {/* Sidebar Guarantee Card */}
          <aside className="pd-sidebar">
            <div className="pd-sidebar-card">
              <h4 className="pd-sidebar-title">buylowindia Promise</h4>
              <ul className="pd-sidebar-list">
                <li>✨ 100% Genuine Handcrafted Crafts</li>
                <li>🚚 Free Shipping on Orders above {formatINRPlain(FREE_SHIPPING_MIN, { decimals: 0 })}</li>
                <li>🔒 Safe Payments via Razorpay</li>
                <li>📦 Safe Breakage-free Wood Packing</li>
              </ul>
            </div>
            <div className="pd-sidebar-card green-card">
              <p className="green-card-text">Support local artisans with every purchase you make.</p>
              <button className="green-card-btn" onClick={() => navigate('/allproducts')}>Explore Collection</button>
            </div>
          </aside>
        </div>

        {/* Always-visible review section */}
        <section className="pd-reviews-panel" id="product-reviews">
          <div className="pd-reviews-panel-head">
            <div>
              <h3 className="pd-reviews-panel-title">Customer Reviews</h3>
              <p className="pd-reviews-panel-sub">
                {reviewsData?.totalReviews ?? product.reviews ?? 0} reviews · average{' '}
                {reviewsData?.averageRating || product.rating || 0} stars
              </p>
            </div>
            {!user && (
              <button
                type="button"
                className="btn-primary pd-reviews-signin-btn"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In to Review
              </button>
            )}
          </div>

          {reviewsLoading ? (
            <p className="reviews-loading">Loading reviews...</p>
          ) : (
            <>
              {user ? (
                <div className="review-form-section">
                  <h4>{reviewsData?.userReview ? 'Update Your Review' : 'Write a Review'}</h4>
                  <p className="review-eligible-note">Share your experience with this product.</p>
                  <ProductRating
                    productId={product._id || product.id}
                    existingReview={reviewsData?.userReview}
                    onRated={handleReviewSubmitted}
                  />
                </div>
              ) : (
                <div className="review-signin-prompt">
                  <p className="review-not-eligible">Sign in to rate and review this product.</p>
                </div>
              )}

              <div className="reviews-list">
                {reviewsData?.reviews?.length ? (
                  reviewsData.reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-item-top">
                        <StarRating rating={review.rating} size={14} />
                        <span className="review-author">{review.userName}</span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="review-comment-text">"{review.comment}"</p>}
                    </div>
                  ))
                ) : (
                  <p className="no-reviews">No reviews yet. Be the first to rate this product!</p>
                )}
              </div>
            </>
          )}
        </section>

        {/* Tabs Section */}
        <div className="pd-tabs-section">
          <div className="pd-tabs">
            <button 
              className={`pd-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`pd-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Specifications & Features
            </button>
            <button 
              className={`pd-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews {reviewsData?.totalReviews ? `(${reviewsData.totalReviews})` : ''}
            </button>
          </div>

          <div className="pd-tab-content">
            {activeTab === "description" && (
              <div className="tab-desc">
                {(product.description || "No description available")
                  .split("\n\n")
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            )}

            {activeTab === "features" && (
              <div className="tab-features">
                {product.keyFeatures?.length ? (
                  product.keyFeatures.map((f, i) => (
                    <div key={i} className="feature-card">
                      <span className="feature-icon">{f.icon}</span>
                      <div>
                        <h4 className="feature-title">{f.title}</h4>
                        <p className="feature-desc">{f.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="tab-reviews">
                <div className="reviews-summary">
                  <div className="reviews-avg">
                    <span className="avg-number">{reviewsData?.averageRating || product.rating || 0}</span>
                    <StarRating rating={reviewsData?.averageRating || product.rating || 0} size={18} />
                    <span className="avg-count">{reviewsData?.totalReviews || product.reviews || 0} reviews</span>
                  </div>
                </div>

                {reviewsLoading ? (
                  <p className="reviews-loading">Loading reviews...</p>
                ) : (
                  <>
                    {user ? (
                      <div className="review-form-section">
                        <h4>{reviewsData?.userReview ? 'Update Your Review' : 'Write a Review'}</h4>
                        <p className="review-eligible-note">Share your experience with this product.</p>
                        <ProductRating
                          productId={product._id || product.id}
                          existingReview={reviewsData?.userReview}
                          onRated={handleReviewSubmitted}
                        />
                      </div>
                    ) : (
                      <div className="review-signin-prompt">
                        <p className="review-not-eligible">Sign in to rate and review this product.</p>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => setAuthModalOpen(true)}
                        >
                          Sign In to Review
                        </button>
                      </div>
                    )}

                    <div className="reviews-list">
                      {reviewsData?.reviews?.length ? (
                        reviewsData.reviews.map((review) => (
                          <div key={review._id} className="review-item">
                            <div className="review-item-top">
                              <StarRating rating={review.rating} size={14} />
                              <span className="review-author">{review.userName}</span>
                              <span className="review-date">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && <p className="review-comment-text">"{review.comment}"</p>}
                          </div>
                        ))
                      ) : (
                        <p className="no-reviews">No reviews yet. Be the first to rate this product!</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;