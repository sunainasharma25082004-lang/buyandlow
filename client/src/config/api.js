const API_URL = import.meta.env.VITE_API_URL || '/api';

const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN ||
  API_URL.replace(/\/api\/?$/, '') ||
  ''
).replace(/\/$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/') && API_ORIGIN) return `${API_ORIGIN}${url}`;
  return url;
};

export default API_URL;