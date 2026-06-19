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

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const sendUserResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
    cart: user.cart || [],
    wishlist: user.wishlist || [],
  });
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
    return sendUserResponse(res, {
      _id: 'mock_user_id_12345',
      name: name.trim(),
      email,
      role: 'user',
      cart: [],
      wishlist: [],
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

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const isAdmin = email === 'admin@truemart.com' && password === 'admin123';
    return sendUserResponse(res, {
      _id: isAdmin ? 'mock_admin_id' : 'mock_user_id_12345',
      name: isAdmin ? 'Admin' : 'Demo User',
      email,
      role: isAdmin ? 'admin' : 'user',
      cart: [],
      wishlist: [],
    });
  }

  const user = await User.findOne({ email }).populate('cart.product').populate('wishlist');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  sendUserResponse(res, user);
}));

router.get('/profile', protect, asyncHandler(async (req, res) => {
  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    return res.json({
      success: true,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      cart: [],
      wishlist: [],
    });
  }

  const user = await User.findById(req.user._id).populate('cart.product').populate('wishlist');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    cart: user.cart,
    wishlist: user.wishlist,
  });
}));

router.put('/cart', protect, asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.cart)) {
    return res.status(400).json({ success: false, message: 'Cart must be an array' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    return res.json(req.body.cart);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.cart = req.body.cart;
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