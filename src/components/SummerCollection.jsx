import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SummerCollection.css';

const SummerCollection = () => {
  const navigate = useNavigate();

  return (
    <section className="summer-collection">
      <div className="container">
        <div className="collection-grid">
          {/* Main large banner */}
          <div className="collection-main">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"
              alt="Summer Collection"
              className="collection-img"
            />
            <div className="collection-overlay" />
            <div className="collection-content">
              <span className="col-tag">✦ New Season</span>
              <h2 className="col-title">Summer Collection</h2>
              <p className="col-sub">Fresh arrivals for the new season</p>
              <button className="btn-primary" onClick={() => navigate('/allproducts', { state: { category: 'Fashion' } })}>
                Shop Now
              </button>
            </div>
          </div>

          {/* Side banners */}
          <div className="collection-side">
            <div className="collection-sub-card green">
              <div className="sub-card-content">
                <span className="col-tag light">Special Offer</span>
                <h3 className="sub-title">Grand Home Furb</h3>
                <p className="sub-desc">Premium home furniture collection with exclusive designs</p>
                <button className="btn-outline-gold" onClick={() => navigate('/allproducts', { state: { category: 'Home' } })}>
                  Shop Now →
                </button>
              </div>
            </div>

            <div className="collection-sub-card dark">
              <div className="sub-card-content">
                <span className="col-tag">Limited</span>
                <h3 className="sub-title">Grand D Capsule</h3>
                <p className="sub-desc">Exclusive capsule collection — limited stock available</p>
                <button className="btn-outline-gold" onClick={() => navigate('/allproducts', { state: { category: 'Fashion' } })}>
                  Shop Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummerCollection;
