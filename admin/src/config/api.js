const trimTrailingSlash = (value) => (value ? value.replace(/\/+$/, '') : '');

const DEFAULT_PROD_API_ORIGIN = 'https://buylowindia.com';
const MAIN_STORE_ORIGIN = 'https://buylowindia.com';

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
    const isUpload = uploadPath.startsWith('/uploads/') || uploadPath.startsWith('/api/uploads/');
    if (!isUpload) return url;

    const uploadRelative = uploadPath.replace(/^\/api/, '');

    // Already on the main store domain: buylowindia.com serves /uploads/ directly
    if (parsed.host === 'buylowindia.com' || parsed.host === 'www.buylowindia.com') {
      return url;
    }

    // On admin domain, Nginx static SPA handles /uploads/ as index.html (text/html).
    // Express backend serves uploads through /api/uploads/.
    if (parsed.host.includes('admin')) {
      if (typeof window !== 'undefined' && window.location.hostname.includes('admin')) {
        return `/api${uploadRelative}${parsed.search}`;
      }
      return `${API_ORIGIN || 'https://admin.buylowindia.com'}/api${uploadRelative}${parsed.search}`;
    }

    // Localhost or stale hosts (e.g. old Render deployments)
    const isStaleHost =
      parsed.host.includes('buylow-api') ||
      parsed.host.includes('buyandlow-api') ||
      parsed.host.includes('store') ||
      parsed.host.includes('frontend') ||
      parsed.host.includes('localhost') ||
      parsed.host === '127.0.0.1';

    if (isStaleHost) {
      if (typeof window !== 'undefined' && window.location.hostname.includes('admin')) {
        return `/api${uploadRelative}${parsed.search}`;
      }
      return `${MAIN_STORE_ORIGIN}${uploadRelative}${parsed.search}`;
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

  if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/api/uploads/')) {
    const uploadRelative = cleanPath.replace(/^\/api/, '');

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // On admin domain (admin.buylowindia.com), use /api/uploads/ so Nginx proxies to Express backend
      if (hostname.includes('admin')) {
        return `/api${uploadRelative}`;
      }
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return uploadRelative;
      }
    }

    if (API_ORIGIN && API_ORIGIN.includes('admin')) {
      return `${API_ORIGIN}/api${uploadRelative}`;
    }

    const base = API_ORIGIN || MAIN_STORE_ORIGIN;
    return `${base}${uploadRelative}`;
  }

  return `${API_ORIGIN}${cleanPath}`;
};

export default API_URL;