import React from 'react';
import './CustomerReviews.css';

const reviews = [
  {
    id: 1,
    name: 'Sophia Williams',
    avatar: 'SW',
    rating: 5,
    text: 'The products are absolutely stunning! The quality exceeded my expectations. The packaging was beautiful and the delivery was super fast. Will definitely order again!',
    product: 'Luxury Perfume Collection',
    date: '2 days ago',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    avatar: 'MC',
    rating: 5,
    text: 'Incredible quality products! Every item I have purchased has been top-notch. The customer service is excellent and shipping was very quick. Highly recommended!',
    product: 'Premium Leather Headphones',
    date: '1 week ago',
  },
  {
    id: 3,
    name: 'Alisha Patel',
    avatar: 'AP',
    rating: 4,
    text: 'Beautiful handcrafted items that are worth every penny. The attention to detail is remarkable. I love shopping here and the products make perfect gifts.',
    product: 'Artisan Leather Bag',
    date: '2 weeks ago',
  },
];

const StarRating = ({ rating }) => (
  <span className="review-stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
);

const CustomerReviews = () => {
  return (
    <section className="customer-reviews">
      <div className="container">
        <div className="reviews-header">
          <p className="reviews-eyebrow">✦ TESTIMONIALS</p>
          <h2 className="section-title">Customer Reviews</h2>
        </div>

        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-top">
                <StarRating rating={review.rating} />
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-text">"{review.text}"</p>
              <div className="reviewer">
                <div className="reviewer-avatar">{review.avatar}</div>
                <div>
                  <p className="reviewer-name">{review.name}</p>
                  <p className="reviewer-product">{review.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
