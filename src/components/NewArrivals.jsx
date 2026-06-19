import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import './NewArrivals.css';

const arrivals = [
  {
    id: 1,
    name: 'Fine Linen Handkerchief',
    desc: '100% linen, hand-embroidered edges',
    price: 24.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1611601777661-e0f6aadbd8a6?w=200&q=80',
    category: 'Fashion',
  },
  {
    id: 2,
    name: 'Artisan Chocolate Tins Box',
    desc: 'Premium Belgian chocolate assortment',
    price: 38.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=200&q=80',
    category: 'Food',
  },
  {
    id: 11,
    name: 'Artisan Wooden Furniture Set',
    desc: 'Solid walnut, hand-finished natural oil',
    price: 299.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80',
    category: 'Home',
  },
  {
    id: 7,
    name: 'Luxury Scented Candle Set',
    desc: 'Hand-poured 100% natural soy wax candle',
    price: 18.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1602528495591-93b83c5be1ae?w=200&q=80',
    category: 'Home',
  },
];

const StarRating = ({ rating }) => (
  <span className="stars">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
);

const NewArrivals = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  return (
    <section className="new-arrivals">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <p className="arrivals-subtitle">Don't miss the new way for this label with all-new arrivals and limited items.</p>
        </div>
        <button className="btn-dark arrivals-btn" onClick={() => navigate('/allproducts')}>New Arrivals</button>

        <div className="arrivals-list">
          {arrivals.map((item) => (
            <div 
              key={item.id} 
              className="arrival-item"
              onClick={() => navigate(`/product/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="arrival-img-wrap">
                <img src={item.image} alt={item.name} className="arrival-img" />
              </div>
              <div className="arrival-info">
                <h3 className="arrival-name">{item.name}</h3>
                <p className="arrival-desc">{item.desc}</p>
                <div className="arrival-rating">
                  <StarRating rating={item.rating} />
                  <span className="rating-count">({item.rating})</span>
                </div>
              </div>
              <div className="arrival-price" onClick={(e) => e.stopPropagation()}>
                <span className="price-current">{formatINR(item.price)}</span>
                <button 
                  className="add-btn"
                  onClick={() => addToCart(item, 1, '')}
                  title="Add to Cart"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
