const isProduction = process.env.NODE_ENV === 'production';

const validateEnv = () => {
  const missing = [];

  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('your_')) {
      missing.push('JWT_SECRET');
    }
    if (!process.env.MONGODB_URI) {
      missing.push('MONGODB_URI');
    }
    if (!process.env.CLIENT_URL) {
      missing.push('CLIENT_URL');
    }
    if (!process.env.API_BASE_URL) {
      missing.push('API_BASE_URL');
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (isProduction && process.env.JWT_SECRET?.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters in production');
  }
};

const normalizeOrigin = (url) => {
  let origin = String(url).trim();
  if (!origin) return '';

  if (!/^https?:\/\//i.test(origin)) {
    origin = `https://${origin}`;
  }

  return origin.replace(/\/+$/, '');
};

const DEV_DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
];

/** Dev only — Expo Metro, web preview, phone on same WiFi */
const isLocalDevOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    return false;
  } catch {
    return false;
  }
};

const getCorsOrigins = () => {
  if (process.env.CLIENT_URL) {
    const configured = process.env.CLIENT_URL
      .split(',')
      .map(normalizeOrigin)
      .filter(Boolean);

    if (!isProduction) {
      return [...new Set([...configured, ...DEV_DEFAULT_ORIGINS])];
    }
    return configured;
  }
  if (isProduction) {
    return [];
  }
  return DEV_DEFAULT_ORIGINS;
};

export { isProduction, validateEnv, getCorsOrigins, isLocalDevOrigin };