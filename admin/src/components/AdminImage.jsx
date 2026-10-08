import React, { useState, useEffect, useMemo } from 'react';
import { resolveMediaUrl } from '../config/api';

const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
      '<rect width="200" height="200" fill="#20222e" rx="10"/>' +
      '<rect x="3" y="3" width="194" height="194" fill="none" stroke="rgba(212, 175, 55, 0.35)" stroke-width="2" stroke-dasharray="6,4" rx="8"/>' +
      '<circle cx="100" cy="80" r="28" fill="rgba(212, 175, 55, 0.12)"/>' +
      '<path d="M84 76h6l3-4h14l3 4h6a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H84a4 4 0 0 1-4-4V80a4 4 0 0 1 4-4zm16 23a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-3a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#d4af37"/>' +
      '<text x="100" y="130" text-anchor="middle" fill="#f5d77f" font-size="12" font-family="sans-serif" font-weight="600">No Image Preview</text>' +
      '<text x="100" y="148" text-anchor="middle" fill="#9999aa" font-size="10" font-family="sans-serif">Click to inspect or change</text>' +
    '</svg>',
  );

const getUrlVariants = (raw) => {
  if (!raw || typeof raw !== 'string') return [];
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return [raw];

  const primary = resolveMediaUrl(raw);
  const variants = primary ? [primary] : [];

  let uploadPath = '';
  if (raw.startsWith('/uploads/') || raw.startsWith('/api/uploads/')) {
    uploadPath = raw.replace(/^\/api/, '');
  } else {
    try {
      const parsed = new URL(raw);
      if (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/uploads/')) {
        uploadPath = parsed.pathname.replace(/^\/api/, '') + parsed.search;
      }
    } catch {}
  }

  if (uploadPath) {
    const alternates = [
      `/api${uploadPath}`,
      `https://buylowindia.com${uploadPath}`,
      `https://admin.buylowindia.com/api${uploadPath}`,
      uploadPath,
    ];
    alternates.forEach((alt) => {
      if (alt && !variants.includes(alt)) {
        variants.push(alt);
      }
    });
  }

  return variants;
};

const AdminImage = ({ src, images = [], alt = '', className, style, onClick }) => {
  const allCandidateUrls = useMemo(() => {
    const rawList = [];
    if (src) rawList.push(src);
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img && !rawList.includes(img)) rawList.push(img);
      });
    }

    const result = [];
    rawList.forEach((raw) => {
      const variants = getUrlVariants(raw);
      variants.forEach((v) => {
        if (v && !result.includes(v)) result.push(v);
      });
    });

    return result;
  }, [src, images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setFailed(false);
  }, [allCandidateUrls]);

  const currentResolvedUrl = allCandidateUrls[currentIndex] || '';

  const handleError = () => {
    if (currentIndex + 1 < allCandidateUrls.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setFailed(true);
  };

  const imageSrc = !failed && currentResolvedUrl ? currentResolvedUrl : FALLBACK;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onClick={onClick}
    />
  );
};

export default AdminImage;