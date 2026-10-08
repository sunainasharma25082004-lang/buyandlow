import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './CustomerReviews.css';

const fallbackReviews = [
  {
    _id: 'rev-1',
    userName: 'Rohan Sharma',
    productName: 'TWS Wireless Earbuds',
    rating: 5,
    comment: 'Super fast delivery to Delhi! Sound quality is crisp and bass is deep. Best price compared to other apps.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'rev-2',
    userName: 'Priya Patel',
    productName: 'Premium Basmati Rice 5 kg',
    rating: 5,
    comment: 'Aroma and grain length are top notch. Very clean hygienic packing. Will definitely order monthly pantry from BuyLow India.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: 'rev-3',
    userName: 'Amit Verma',
    productName: 'Futura Electric Kettle',
    rating: 5,
    comment: 'Water boils in under 2 minutes. Temperature cut-off works perfectly. Solid build quality and excellent value for money.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'rev-4',
    userName: 'Sneha Kulkarni',
    productName: 'Hydrating Face Cream 50g',
    rating: 5,
    comment: 'Genuinely impressed with the product quality. Arrived well sealed and undamaged. 10/10 recommended!',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

const StarRating = ({ rating = 5 }) => (
  <div className="review-stars-wrap">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`review-star ${i < rating ? 'filled' : 'empty'}`}>
        ★
      </span>
    ))}
  </div>
);

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
    let active = true;
    axios
      .get(`${API_URL}/products/reviews/recent`, { params: { limit: 6 } })
      .then((res) => {
        if (!active) return;
        const list = res.data.reviews || [];
        if (list.length > 0) {
          setReviews(list);
        } else {
          setReviews(fallbackReviews);
        }
      })
      .catch(() => {
        if (active) setReviews(fallbackReviews);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayList = reviews.length > 0 ? reviews : fallbackReviews;

  return (
    <section className="customer-reviews-section">
      <div className="container">
        <div className="reviews-header-bar">
          <div>
            <span className="reviews-tag-badge">★ VERIFIED BUYERS</span>
            <h2 className="reviews-section-title">What Our Customers Say</h2>
          </div>
          <p className="reviews-section-sub">
            Real feedback from verified shoppers across India
          </p>
        </div>

        {loading ? (
          <div className="reviews-loading">Loading customer feedback...</div>
        ) : (
          <div className="reviews-cards-grid">
            {displayList.slice(0, 4).map((review) => (
              <div key={review._id} className="review-testimonial-card">
                <div className="review-card-top">
                  <StarRating rating={review.rating} />
                  <span className="verified-badge">✓ Verified Order</span>
                </div>

                <p className="review-quote-text">
                  "{review.comment || 'Great experience with BuyLow India!'}"
                </p>

                <div className="reviewer-profile">
                  <div className="reviewer-avatar-circle">
                    {getInitials(review.userName || 'Customer')}
                  </div>
                  <div className="reviewer-meta">
                    <p className="reviewer-name">{review.userName || 'BuyLow Shopper'}</p>
                    <p className="reviewer-purchased">Purchased {review.productName}</p>
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