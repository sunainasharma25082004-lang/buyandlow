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
  }

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (isProduction && process.env.JWT_SECRET?.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters in production');
  }

  if (isProduction && !process.env.CLIENT_URL) {
    console.warn('⚠️  CLIENT_URL not set — all origins allowed. Set comma-separated frontend URLs for production.');
  }
};

const getCorsOrigins = () => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean);
  }
  if (isProduction) {
    return [];
  }
  return ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
};

export { isProduction, validateEnv, getCorsOrigins };