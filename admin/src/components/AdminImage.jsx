import React, { useState } from 'react';
import { resolveMediaUrl } from '../config/api';

const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
      '<rect width="120" height="120" fill="#E3F2FD"/>' +
      '<text x="60" y="66" text-anchor="middle" fill="#1565C0" font-size="12" font-family="sans-serif">No Image</text>' +
    '</svg>',
  );

const AdminImage = ({ src, alt = '', className, style }) => {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? FALLBACK : resolveMediaUrl(src) || FALLBACK;

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
};

export default AdminImage;