import React from 'react';
import { useNavigate } from 'react-router-dom';
import catGroceryImg from '../assets/cat_grocery.png';
import catElectronicsImg from '../assets/cat_electronics.png';
import catFashionImg from '../assets/cat_fashion.png';
import catHomeImg from '../assets/cat_home.png';
import catBeautyImg from '../assets/cat_beauty.png';
import './CategoryStoryBar.css';

const storyItems = [
  { id: 'all', label: 'All Store', icon: '🛍️', link: '/allproducts' },
  { id: 'grocery', label: 'Groceries', img: catGroceryImg, link: '/allproducts?category=Grocery' },
  { id: 'electronics', label: 'Electronics', img: catElectronicsImg, link: '/allproducts?category=Electronics' },
  { id: 'fashion', label: 'Fashion', img: catFashionImg, link: '/allproducts?category=Fashion' },
  { id: 'home', label: 'Home Living', img: catHomeImg, link: '/allproducts?category=Home' },
  { id: 'beauty', label: 'Beauty Care', img: catBeautyImg, link: '/allproducts?category=Beauty' },
  { id: 'deals', label: 'Flash Deals', icon: '⚡', link: '/allproducts?sale=true&title=Flash Deals' },
  { id: 'budget', label: 'Under ₹499', icon: '🏷️', link: '/allproducts?priceMax=499&title=Under ₹499 Deals' },
];

const CategoryStoryBar = () => {
  const navigate = useNavigate();

  return (
    <div className="story-bar-section">
      <div className="container">
        <div className="story-bar-scroll">
          {storyItems.map((item) => (
            <div
              key={item.id}
              className="story-item"
              onClick={() => navigate(item.link)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(item.link)}
            >
              <div className="story-ring">
                <div className="story-avatar">
                  {item.img ? (
                    <img src={item.img} alt={item.label} className="story-img" />
                  ) : (
                    <span className="story-emoji">{item.icon}</span>
                  )}
                </div>
              </div>
              <span className="story-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryStoryBar;
