import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL, { resolveMediaUrl } from '../config/api';
import './CategoryStoryBar.css';

const CategoryStoryBar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/categories`)
      .then((res) => {
        if (!active) return;
        const list = res.data.categories || [];
        setCategories(list.filter((c) => c.isActive !== false));
      })
      .catch((err) => {
        console.warn('Could not fetch categories for story bar:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="story-bar-section">
      <div className="container">
        <div className="story-bar-scroll">
          {/* All Store fixed quick-link */}
          <div
            className="story-item"
            onClick={() => navigate('/allproducts')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/allproducts')}
            title="Browse full catalog"
          >
            <div className="story-ring story-ring-all">
              <div className="story-avatar">
                <span className="story-emoji">🛍️</span>
              </div>
            </div>
            <span className="story-label">All Store</span>
          </div>

          {/* Dynamic Categories from Catalog */}
          {categories.map((cat, idx) => {
            const label = cat.title || cat.displayName || cat.name;
            const link = `/allproducts?category=${encodeURIComponent(cat.name)}&title=${encodeURIComponent(label)}`;
            const imageUrl = resolveMediaUrl(cat.image);
            const ringColors = [
              'linear-gradient(135deg, #10B981, #059669)',
              'linear-gradient(135deg, #2563EB, #1D4ED8)',
              'linear-gradient(135deg, #F59E0B, #D97706)',
              'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              'linear-gradient(135deg, #EC4899, #BE185D)',
            ];
            const ringBg = ringColors[idx % ringColors.length];

            return (
              <div
                key={cat._id || cat.name}
                className="story-item"
                onClick={() => navigate(link)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(link)}
                title={`${label} (${cat.productCount || 0} items)`}
              >
                <div className="story-ring" style={{ background: ringBg }}>
                  <div className="story-avatar">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={label}
                        className="story-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="story-emoji">📦</span>';
                        }}
                      />
                    ) : (
                      <span className="story-emoji">📦</span>
                    )}
                  </div>
                </div>
                <span className="story-label">{label}</span>
              </div>
            );
          })}

          {/* Flash Deals Quick Story */}
          <div
            className="story-item"
            onClick={() => navigate('/allproducts?sale=true&title=Flash Deals')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/allproducts?sale=true&title=Flash Deals')}
            title="Today's Flash Deals"
          >
            <div className="story-ring story-ring-deals" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
              <div className="story-avatar">
                <span className="story-emoji">⚡</span>
              </div>
            </div>
            <span className="story-label">Flash Deals</span>
          </div>

          {/* Budget Quick Story */}
          <div
            className="story-item"
            onClick={() => navigate('/allproducts?maxPrice=499&title=Under ₹499 Deals')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/allproducts?maxPrice=499&title=Under ₹499 Deals')}
            title="Deals under ₹499"
          >
            <div className="story-ring story-ring-budget" style={{ background: 'linear-gradient(135deg, #D97706, #B45309)' }}>
              <div className="story-avatar">
                <span className="story-emoji">🏷️</span>
              </div>
            </div>
            <span className="story-label">Under ₹499</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryStoryBar;
