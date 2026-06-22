import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './ProductRating.css';

const ProductRating = ({ productId, onRated, compact = false, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
    setSubmitted(false);
    setError('');
  }, [existingReview?._id, existingReview?.rating, existingReview?.comment, productId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (rating < 1) {
      setError('Please select a star rating');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/products/${productId}/reviews`, { rating, comment });
      setSubmitted(true);
      onRated?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && compact) {
    return (
      <div className="product-rating compact done">
        <span className="rating-stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
        <span className="rating-done-text">Rated</span>
      </div>
    );
  }

  return (
    <form className={`product-rating ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <div className="rating-stars-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>

      {!compact && (
        <textarea
          className="rating-comment"
          placeholder="Share your experience with this product (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      )}

      {error && <p className="rating-error">{error}</p>}

      <button type="submit" className="btn-primary rating-submit" disabled={submitting}>
        {submitting ? 'Submitting...' : existingReview || submitted ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  );
};

export default ProductRating;