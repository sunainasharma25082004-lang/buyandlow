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

const AdminImage = ({ src, images = [], alt = '', className, style, onClick }) => {
  const candidateUrls = useMemo(() => {
    const list = [];
    if (src) list.push(src);
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [src, images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [triedRelative, setTriedRelative] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setTriedRelative(false);
    setFailed(false);
  }, [src, images]);

  const currentRaw = candidateUrls[currentIndex];

  let resolved = FALLBACK;
  if (!failed && currentRaw) {
    if (currentRaw.startsWith('blob:') || currentRaw.startsWith('data:')) {
      resolved = currentRaw;
    } else if (triedRelative && (currentRaw.startsWith('/uploads/') || currentRaw.startsWith('/api/uploads/'))) {
      resolved = currentRaw.replace(/^\/api/, '');
    } else {
      resolved = resolveMediaUrl(currentRaw) || FALLBACK;
    }
  }

  const handleError = () => {
    if (!triedRelative && currentRaw && (currentRaw.startsWith('/uploads/') || currentRaw.startsWith('/api/uploads/'))) {
      setTriedRelative(true);
      return;
    }

    if (currentIndex + 1 < candidateUrls.length) {
      setCurrentIndex((prev) => prev + 1);
      setTriedRelative(false);
      return;
    }

    setFailed(true);
  };

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onClick={onClick}
    />
  );
};

export default AdminImage;