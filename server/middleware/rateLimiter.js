import rateLimit from 'express-rate-limit';

/**
 * General API Limiter
 * - Generous window & limit for standard high-traffic e-commerce operations.
 * - Exempts Admin routes and authenticated requests so admins can edit/create products,
 *   upload images, and manage banners without ever getting blocked.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 5,000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never throttle OPTIONS pre-flight
    if (req.method === 'OPTIONS') return true;

    // Never throttle Admin panel actions or authenticated users
    if (req.originalUrl?.includes('/admin') || req.path?.includes('/admin')) return true;
    if (Boolean(req.headers.authorization)) return true;

    // Never throttle local development loops
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) return true;

    return false;
  },
  message: { success: false, message: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased from 20 to 100 to prevent lockout during multi-tab / testing
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5000, // 5,000 uploads
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.method === 'OPTIONS') return true;
    if (Boolean(req.headers.authorization)) return true;
    if (req.originalUrl?.includes('/admin') || req.path?.includes('/admin')) return true;
    return false;
  },
  message: { success: false, message: 'Upload limit reached, try again later' },
});