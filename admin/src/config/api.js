const trimTrailingSlash = (value) => (value ? value.replace(/\/+$/, '') : '');

const DEFAULT_PROD_API_ORIGIN = 'https://buyandlow-api.onrender.com';

const getApiOrigin = () => {
  if (import.meta.env.VITE_API_ORIGIN) {
    return trimTrailingSlash(import.meta.env.VITE_API_ORIGIN);
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return trimTrailingSlash(apiUrl.replace(/\/api\/?$/, ''));
  }

  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '10.0.2.2';
    if (isLocalhost) {
      return 'http://localhost:5000';
    }
  }

  return DEFAULT_PROD_API_ORIGIN;
};

const API_ORIGIN = getApiOrigin();
const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : `${API_ORIGIN}/api`);

const rewriteStaleUploadUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/uploads/')) return url;

    const targetHost = API_ORIGIN ? new URL(API_ORIGIN).host : '';
    if (targetHost && parsed.host === targetHost) return url;

    const isFrontendOrLocal =
      parsed.host.includes('admin') ||
      parsed.host.includes('store') ||
      parsed.host.includes('frontend') ||
      parsed.host.includes('localhost') ||
      parsed.host === '127.0.0.1';

    if (isFrontendOrLocal && API_ORIGIN) {
      return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
    }

    return url;
  } catch {
    return url;
  }
};

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^data:|^blob:/i.test(url)) return url;

  if (/^https?:\/\//i.test(url)) {
    return rewriteStaleUploadUrl(url);
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_ORIGIN}${cleanPath}`;
};

export default API_URL;