import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './CustomerReviews.css';

const StarRating = ({ rating }) => (
  <span className="review-stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
);

const formatRelativeDate = (dateStr) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/products/reviews/recent`, { params: { limit: 6 } })
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="customer-reviews">
      <div className="container">
        <div className="reviews-header">
          <p className="reviews-eyebrow">✦ TESTIMONIALS</p>
          <h2 className="section-title">Customer Reviews</h2>
        </div>

        {loading ? (
          <div className="reviews-loading-state">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty-state">No reviews yet. Be the first to share your experience!</div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-top">
                  <StarRating rating={review.rating} />
                  <span className="review-date">{formatRelativeDate(review.createdAt)}</span>
                </div>
                <p className="review-text">
                  "{review.comment || 'Great product — highly recommended!'}"
                </p>
                <div className="reviewer">
                  <div className="reviewer-avatar">{getInitials(review.userName)}</div>
                  <div>
                    <p className="reviewer-name">{review.userName}</p>
                    <p className="reviewer-product">{review.productName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;