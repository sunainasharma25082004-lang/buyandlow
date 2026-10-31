import React from 'react';
import './ProductCardSkeleton.css';

const ProductCardSkeleton = () => {
  return (
    <div className="product-card-skeleton" aria-hidden="true">
      <div className="skeleton-media skeleton" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-cat skeleton" />
        <div className="skeleton-line skeleton-title skeleton" />
        <div className="skeleton-line skeleton-title-short skeleton" />
        <div className="skeleton-line skeleton-rating skeleton" />
        <div className="skeleton-row">
          <div className="skeleton-line skeleton-price skeleton" />
          <div className="skeleton-button skeleton" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
