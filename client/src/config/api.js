const trimTrailingSlash = (value) => (value ? value.replace(/\/+$/, '') : '');

const DEFAULT_PROD_API_ORIGIN = 'https://buylowindia.com';

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
    if (window.location.hostname.includes('buylowindia.com')) {
      return window.location.origin;
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
    let uploadPath = parsed.pathname;
    if (uploadPath.startsWith('/api/uploads/')) {
      uploadPath = uploadPath.replace(/^\/api/, '');
    }
    if (!uploadPath.startsWith('/uploads/')) return url;

    // If it's already on the live domain, leave as-is
    if (parsed.host === 'buylowindia.com' || parsed.host === 'www.buylowindia.com') {
      return url;
    }

    const targetHost = API_ORIGIN ? new URL(API_ORIGIN).host : '';

    const isStaleHost =
      parsed.host.includes('buylow-api') ||
      parsed.host.includes('buyandlow-api') ||
      parsed.host.includes('admin') ||
      parsed.host.includes('store') ||
      parsed.host.includes('frontend') ||
      parsed.host.includes('localhost') ||
      parsed.host === '127.0.0.1';

    if ((isStaleHost || (targetHost && parsed.host === targetHost)) && API_ORIGIN) {
      return `${API_ORIGIN}${uploadPath}${parsed.search}`;
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

  let cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (cleanPath.startsWith('/api/uploads/')) {
    cleanPath = cleanPath.replace(/^\/api/, '');
  }
  return `${API_ORIGIN}${cleanPath}`;
};

export default API_URL;