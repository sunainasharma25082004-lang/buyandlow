import React, { useState, useEffect, useMemo } from 'react';
import { resolveMediaUrl } from '../config/api';

const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
      '<rect width="120" height="120" fill="#16161d" rx="8"/>' +
      '<path d="M42 45h6l3-4h18l3 4h6a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4V49a4 4 0 0 1 4-4zm18 30a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm0-4a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#d4af37" opacity="0.6"/>' +
      '<text x="60" y="93" text-anchor="middle" fill="#888" font-size="10" font-family="sans-serif" font-weight="500">Image</text>' +
    '</svg>',
  );

const AdminImage = ({ src, images = [], alt = '', className, style }) => {
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
    if (triedRelative && currentRaw.startsWith('/uploads/')) {
      resolved = currentRaw;
    } else {
      resolved = resolveMediaUrl(currentRaw) || FALLBACK;
    }
  }

  const handleError = () => {
    if (!triedRelative && currentRaw && currentRaw.startsWith('/uploads/')) {
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
    />
  );
};

export default AdminImage;