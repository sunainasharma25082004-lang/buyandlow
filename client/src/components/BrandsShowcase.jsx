import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandsShowcase.css';

const brands = [
  { name: 'Samsung', category: 'Electronics', discount: 'Up to 40% Off' },
  { name: 'Philips', category: 'Appliances', discount: 'Up to 50% Off' },
  { name: 'Boat', category: 'Audio', discount: 'Up to 60% Off' },
  { name: 'Prestige', category: 'Kitchenware', discount: 'Up to 45% Off' },
  { name: 'Futura', category: 'Smart Kettles', discount: 'Up to 35% Off' },
  { name: 'Frendz', category: 'Appliances', discount: 'Factory Direct' },
  { name: 'Puma', category: 'Footwear', discount: 'Up to 50% Off' },
  { name: 'Lakme', category: 'Beauty', discount: 'Up to 30% Off' },
];

const BrandsShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="brands-showcase-section">
      <div className="container">
        <div className="brands-header-bar">
          <div>
            <span className="brands-tag">🏷️ TOP BRANDS IN FOCUS</span>
            <h2 className="brands-title">Shop by Top Brands</h2>
          </div>
          <button
            type="button"
            className="brands-view-btn"
            onClick={() => navigate('/allproducts')}
          >
            <span>Explore All Brands</span>
            <span className="brands-arrow">→</span>
          </button>
        </div>

        <div className="brands-grid">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="brand-card"
              onClick={() => navigate(`/allproducts?keyword=${encodeURIComponent(brand.name)}&title=${encodeURIComponent(brand.name)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/allproducts?keyword=${encodeURIComponent(brand.name)}`)}
            >
              <div className="brand-logo-text">{brand.name}</div>
              <span className="brand-cat">{brand.category}</span>
              <span className="brand-discount-badge">{brand.discount}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsShowcase;
