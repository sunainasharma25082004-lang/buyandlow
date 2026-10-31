import React from 'react';
import './ProductDetailSkeleton.css';

const ProductDetailSkeleton = () => {
  return (
    <div className="pd-skeleton-page" aria-hidden="true">
      <div className="container">
        {/* Breadcrumb Skeleton */}
        <div className="pd-skel-breadcrumb">
          <div className="pd-skel-line pd-skel-bc-item skeleton" />
          <div className="pd-skel-line pd-skel-bc-item skeleton" style={{ width: '80px' }} />
          <div className="pd-skel-line pd-skel-bc-item skeleton" style={{ width: '120px' }} />
        </div>

        {/* Dual Column Layout */}
        <div className="pd-skel-grid">
          {/* Gallery Skeleton */}
          <div className="pd-skel-gallery">
            <div className="pd-skel-main-img skeleton" />
            <div className="pd-skel-thumbs">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pd-skel-thumb skeleton" />
              ))}
            </div>
          </div>

          {/* Info Details Skeleton */}
          <div className="pd-skel-info">
            <div className="pd-skel-line pd-skel-badge skeleton" />
            <div className="pd-skel-line pd-skel-title skeleton" />
            <div className="pd-skel-line pd-skel-title-2 skeleton" />
            <div className="pd-skel-line pd-skel-rating skeleton" />
            <div className="pd-skel-line pd-skel-price skeleton" />

            <div className="pd-skel-box skeleton" style={{ height: '70px', borderRadius: '12px' }} />

            <div className="pd-skel-actions">
              <div className="pd-skel-btn skeleton" />
              <div className="pd-skel-btn skeleton" />
            </div>

            <div className="pd-skel-trust-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="pd-skel-trust-item skeleton" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
