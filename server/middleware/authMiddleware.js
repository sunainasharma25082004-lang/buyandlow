import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isProduction } from '../config/env.js';

const getJwtSecret = () => {
  if (isProduction) {
    return process.env.JWT_SECRET;
  }
  return process.env.JWT_SECRET || 'dev_fallback_jwt_secret';
};

const MOCK_USERS = {
  mock_user_id_12345: { _id: 'mock_user_id_12345', name: 'Demo User', email: 'demo@truemart.com', role: 'user' },
  mock_admin_id: { _id: 'mock_admin_id', name: 'Admin', email: 'admin@truemart.com', role: 'admin' },
};

const protect = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    if (!global.isDbConnected) {
      if (isProduction) {
        return res.status(503).json({ success: false, message: 'Database unavailable' });
      }
      req.user = MOCK_USERS[decoded.id] || MOCK_USERS.mock_user_id_12345;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
};

export { protect, admin, getJwtSecret };