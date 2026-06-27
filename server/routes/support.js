import express from 'express';
import jwt from 'jsonwebtoken';
import CallbackRequest from '../models/CallbackRequest.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getJwtSecret } from '../middleware/authMiddleware.js';
import { isProduction } from '../config/env.js';

const router = express.Router();

global.mockCallbacks = global.mockCallbacks || [];

const MOCK_USERS = {
  mock_user_id_12345: { _id: 'mock_user_id_12345', name: 'Demo User', email: 'demo@truemart.com' },
};

const attachUserIfToken = async (req) => {
  if (!req.headers.authorization?.startsWith('Bearer')) return null;

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    if (!global.isDbConnected) {
      if (isProduction) return null;
      return MOCK_USERS[decoded.id] || null;
    }

    return User.findById(decoded.id).select('name email');
  } catch {
    return null;
  }
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

const saveSupportRequest = async (payload, authUser) => {
  const data = {
    ...payload,
    user: authUser?._id || null,
  };

  if (!global.isDbConnected) {
    if (isProduction) {
      throw Object.assign(new Error('Database unavailable'), { status: 503 });
    }
    const entry = {
      _id: `mock_support_${Date.now()}`,
      ...data,
      user: authUser || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    global.mockCallbacks.unshift(entry);
    return entry;
  }

  const request = await CallbackRequest.create(data);
  return CallbackRequest.findById(request._id).populate('user', 'name email');
};

router.post('/callback', asyncHandler(async (req, res) => {
  const { name, email, phone, preferredTime, note, chatSummary } = req.body;
  const trimmedName = name?.trim();
  const normalizedPhone = normalizePhone(phone);

  if (!trimmedName) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (normalizedPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' });
  }

  const authUser = await attachUserIfToken(req);
  const request = await saveSupportRequest({
    requestType: 'callback',
    name: trimmedName,
    email: (email?.trim() || authUser?.email || '').toLowerCase(),
    phone: normalizedPhone,
    preferredTime: preferredTime?.trim() || '',
    note: note?.trim().slice(0, 500) || '',
    chatSummary: chatSummary?.trim().slice(0, 3000) || '',
    status: 'pending',
    source: req.body.source === 'chat' ? 'mobile_app_chat' : 'mobile_app',
  }, authUser);

  res.status(201).json({ success: true, request });
}));

router.post('/chat', asyncHandler(async (req, res) => {
  const { name, email, phone, note, chatSummary } = req.body;
  const authUser = await attachUserIfToken(req);
  const trimmedName = name?.trim() || authUser?.name?.trim() || 'Guest Customer';

  const summary = chatSummary?.trim().slice(0, 3000) || note?.trim().slice(0, 3000) || '';
  if (!summary) {
    return res.status(400).json({ success: false, message: 'Chat summary is required' });
  }

  const normalizedPhone = normalizePhone(phone);
  const request = await saveSupportRequest({
    requestType: 'chat',
    name: trimmedName,
    email: (email?.trim() || authUser?.email || '').toLowerCase(),
    phone: normalizedPhone.length >= 10 ? normalizedPhone : '',
    preferredTime: '',
    note: note?.trim().slice(0, 500) || 'Chat support — team manager requested',
    chatSummary: summary,
    status: 'pending',
    source: 'mobile_app_chat',
  }, authUser);

  res.status(201).json({ success: true, request });
}));

export default router;