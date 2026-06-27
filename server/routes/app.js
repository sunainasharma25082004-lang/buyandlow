import express from 'express';
import AppBanner from '../models/AppBanner.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isProduction } from '../config/env.js';
import {
  DEFAULT_APP_BANNERS,
  formatBanner,
} from '../data/appBanners.js';

const router = express.Router();

const getMockBanners = () => {
  if (!global.mockAppBanners) {
    global.mockAppBanners = DEFAULT_APP_BANNERS.map((item, index) => ({
      ...item,
      _id: `mock_banner_${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
  return global.mockAppBanners;
};

const seedBannersIfEmpty = async () => {
  const count = await AppBanner.countDocuments();
  if (count > 0) return;

  await AppBanner.insertMany(DEFAULT_APP_BANNERS);
};

router.get('/banners', asyncHandler(async (_req, res) => {
  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const banners = getMockBanners()
      .filter((item) => item.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(formatBanner);
    return res.json({ success: true, banners });
  }

  await seedBannersIfEmpty();

  const banners = await AppBanner.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 });

  res.json({
    success: true,
    banners: banners.map(formatBanner),
  });
}));

export default router;