const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getApiOrigin = () => {
  if (import.meta.env.VITE_API_ORIGIN) {
    return trimTrailingSlash(import.meta.env.VITE_API_ORIGIN);
  }

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  if (/^https?:\/\//i.test(apiUrl)) {
    return trimTrailingSlash(apiUrl.replace(/\/api\/?$/, ''));
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_ORIGIN = getApiOrigin();

const rewriteLocalhostUrl = (url) => {
  const match = url.match(/^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/.*)?$/i);
  if (!match) return url;
  const path = match[3] || '';
  return `${API_ORIGIN}${path}`;
};

const rewriteStaleUploadUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/uploads/')) return url;

    const currentHost = API_ORIGIN ? new URL(API_ORIGIN).host : '';
    if (currentHost && parsed.host === currentHost) return url;

    return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^data:|^blob:/i.test(url)) return url;

  if (/^https?:\/\//i.test(url)) {
    return rewriteStaleUploadUrl(rewriteLocalhostUrl(url));
  }

  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
};

export default API_URL;