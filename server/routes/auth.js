import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect, getJwtSecret } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  normalizeEmail,
  validateRegisterInput,
  validateLoginInput,
} from '../utils/validators.js';
import { isProduction } from '../config/env.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/adminCredentials.js';
import { verifyGoogleCredential, isGoogleAuthEnabled } from '../utils/googleAuth.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const getMockProfileExtras = (userId) => {
  if (!global.mockUserExtras) {
    global.mockUserExtras = {};
  }
  if (!global.mockUserExtras[userId]) {
    global.mockUserExtras[userId] = {
      phone: '',
      addresses: [],
      paymentPreference: 'razorpay',
    };
  }
  return global.mockUserExtras[userId];
};

const formatAddress = (addr) => ({
  _id: addr._id,
  label: addr.label || 'Home',
  address: addr.address,
  city: addr.city,
  postalCode: addr.postalCode,
  country: addr.country || 'India',
  phone: addr.phone,
  isDefault: Boolean(addr.isDefault),
});

const buildUserPayload = (user, includeToken = false) => {
  const payload = {
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    addresses: (user.addresses || []).map(formatAddress),
    paymentPreference: user.paymentPreference || 'razorpay',
    cart: user.cart || [],
    wishlist: user.wishlist || [],
  };

  if (includeToken) {
    payload.token = generateToken(user._id);
  }

  return payload;
};

const sendUserResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json(buildUserPayload(user, true));
};

const normalizeAddresses = (addresses) => {
  if (!Array.isArray(addresses)) {
    return null;
  }

  const cleaned = addresses
    .map((item) => ({
      _id: item._id,
      label: (item.label || 'Home').trim(),
      address: (item.address || '').trim(),
      city: (item.city || '').trim(),
      postalCode: (item.postalCode || '').trim(),
      country: (item.country || 'India').trim(),
      phone: (item.phone || '').replace(/\D/g, ''),
      isDefault: Boolean(item.isDefault),
    }))
    .filter((item) => item.address && item.city && item.postalCode && item.phone.length >= 10);

  if (cleaned.length === 0) {
    return [];
  }

  const hasDefault = cleaned.some((item) => item.isDefault);
  if (!hasDefault) {
    cleaned[0].isDefault = true;
  } else {
    let defaultSet = false;
    cleaned.forEach((item) => {
      if (item.isDefault && !defaultSet) {
        defaultSet = true;
      } else {
        item.isDefault = false;
      }
    });
    if (!defaultSet) {
      cleaned[0].isDefault = true;
    }
  }

  return cleaned;
};

router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const validationError = validateRegisterInput(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const extras = getMockProfileExtras('mock_user_id_12345');
    return sendUserResponse(res, {
      _id: 'mock_user_id_12345',
      name: name.trim(),
      email,
      role: 'user',
      cart: [],
      wishlist: [],
      ...extras,
    }, 201);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = await User.create({ name: name.trim(), email, password });
  sendUserResponse(res, user, 201);
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const validationError = validateLoginInput(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  const configuredAdminEmail = normalizeEmail(ADMIN_EMAIL);

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const isAdmin = email === configuredAdminEmail && password === ADMIN_PASSWORD;
    const mockId = isAdmin ? 'mock_admin_id' : 'mock_user_id_12345';
    const extras = getMockProfileExtras(mockId);
    return sendUserResponse(res, {
      _id: mockId,
      name: isAdmin ? 'Admin' : 'Demo User',
      email,
      role: isAdmin ? 'admin' : 'user',
      cart: [],
      wishlist: [],
      ...extras,
    });
  }

  if (email === configuredAdminEmail && password === ADMIN_PASSWORD) {
    let adminUser = await User.findOne({ email: configuredAdminEmail });

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: configuredAdminEmail,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
    } else {
      let shouldSave = false;

      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        shouldSave = true;
      }

      if (!(await adminUser.matchPassword(ADMIN_PASSWORD))) {
        adminUser.password = ADMIN_PASSWORD;
        shouldSave = true;
      }

      if (shouldSave) {
        await adminUser.save();
      }
    }

    const populatedAdmin = await User.findById(adminUser._id).populate('cart.product').populate('wishlist');
    return sendUserResponse(res, populatedAdmin);
  }

  const user = await User.findOne({ email }).populate('cart.product').populate('wishlist');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  sendUserResponse(res, user);
}));

router.post('/google', authLimiter, asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential is required' });
  }

  if (!isGoogleAuthEnabled()) {
    return res.status(503).json({ success: false, message: 'Google sign-in is not configured' });
  }

  let googleUser;
  try {
    googleUser = await verifyGoogleCredential(credential);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message || 'Google sign-in failed' });
  }

  if (!googleUser.emailVerified) {
    return res.status(400).json({ success: false, message: 'Please verify your Google email first' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const extras = getMockProfileExtras('mock_google_user');
    return sendUserResponse(res, {
      _id: 'mock_google_user',
      name: googleUser.name,
      email: googleUser.email,
      role: 'user',
      cart: [],
      wishlist: [],
      ...extras,
    });
  }

  let user = await User.findOne({
    $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
  });

  if (user) {
    let shouldSave = false;

    if (!user.googleId) {
      user.googleId = googleUser.googleId;
      shouldSave = true;
    }

    if (googleUser.avatar && !user.avatar) {
      user.avatar = googleUser.avatar;
      shouldSave = true;
    }

    if (!user.name && googleUser.name) {
      user.name = googleUser.name;
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }
  } else {
    user = await User.createGoogleUser(googleUser);
  }

  const populated = await User.findById(user._id).populate('cart.product').populate('wishlist');
  sendUserResponse(res, populated);
}));

router.get('/profile', protect, asyncHandler(async (req, res) => {
  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const extras = getMockProfileExtras(req.user._id);
    return res.json(buildUserPayload({
      ...req.user,
      cart: [],
      wishlist: [],
      ...extras,
    }));
  }

  const user = await User.findById(req.user._id).populate('cart.product').populate('wishlist');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json(buildUserPayload(user));
}));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : undefined;
  const phone = typeof req.body.phone === 'string' ? req.body.phone.replace(/\D/g, '') : undefined;
  const paymentPreference = req.body.paymentPreference;

  if (name !== undefined && name.length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
  }

  if (phone !== undefined && phone.length > 0 && phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
  }

  if (paymentPreference !== undefined && !['razorpay', 'cod'].includes(paymentPreference)) {
    return res.status(400).json({ success: false, message: 'Invalid payment preference' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const extras = getMockProfileExtras(req.user._id);
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) extras.phone = phone;
    if (paymentPreference !== undefined) extras.paymentPreference = paymentPreference;
    return res.json(buildUserPayload({
      ...req.user,
      cart: [],
      wishlist: [],
      ...extras,
    }));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (paymentPreference !== undefined) user.paymentPreference = paymentPreference;
  await user.save();

  const populated = await User.findById(user._id).populate('cart.product').populate('wishlist');
  res.json(buildUserPayload(populated));
}));

router.put('/addresses', protect, asyncHandler(async (req, res) => {
  const normalized = normalizeAddresses(req.body.addresses);
  if (normalized === null) {
    return res.status(400).json({ success: false, message: 'Addresses must be an array' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const extras = getMockProfileExtras(req.user._id);
    extras.addresses = normalized.map((item, index) => ({
      ...item,
      _id: item._id || `mock_addr_${Date.now()}_${index}`,
    }));
    return res.json({
      success: true,
      addresses: extras.addresses.map(formatAddress),
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.addresses = normalized;
  await user.save();

  res.json({
    success: true,
    addresses: user.addresses.map(formatAddress),
  });
}));

router.put('/cart', protect, asyncHandler(async (req, res) => {
  const cartPayload = req.body.cart ?? req.body.cartItems;

  if (!Array.isArray(cartPayload)) {
    return res.status(400).json({ success: false, message: 'Cart must be an array' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    return res.json(cartPayload);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.cart = cartPayload;
  await user.save();
  const populated = await User.findById(user._id).populate('cart.product');
  res.json(populated.cart);
}));

router.put('/wishlist', protect, asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.wishlist)) {
    return res.status(400).json({ success: false, message: 'Wishlist must be an array' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    return res.json(req.body.wishlist);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.wishlist = req.body.wishlist
    .map((item) => {
      if (typeof item === 'object' && item !== null) {
        return item._id || item.id || item;
      }
      return item;
    })
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  await user.save();

  const populated = await User.findById(user._id).populate('wishlist');
  res.json(populated.wishlist);
}));

export default router;