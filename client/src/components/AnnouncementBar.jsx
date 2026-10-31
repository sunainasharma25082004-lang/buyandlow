import React, { useState, useEffect } from 'react';
import './AnnouncementBar.css';

const announcements = [
  '🚚 Free Express Delivery on orders over ₹299 in Zirakpur • Fast doorstep delivery',
  '⚡ Lowest Price Guarantee • Direct from verified manufacturers',
  '🔒 100% Safe & Secure Online Checkout • UPI & Cards accepted',
  '🔄 Easy 7-Day Replacement & Prompt Customer Support Guarantee',
];

const AnnouncementBar = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + announcements.length) % announcements.length);
  const next = () => setCurrent((c) => (c + 1) % announcements.length);

  return (
    <div className="announcement-bar">
      <div className="container ann-container">
        <button type="button" className="ann-arrow" onClick={prev} aria-label="Previous announcement">
          ‹
        </button>
        <p className="ann-text">{announcements[current]}</p>
        <button type="button" className="ann-arrow" onClick={next} aria-label="Next announcement">
          ›
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
