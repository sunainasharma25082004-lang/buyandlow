import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { defaultCategories } from '../data/categories.js';
import { products as staticProducts } from '../data/products.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

global.adminCategories = global.adminCategories || [...defaultCategories.map((c, i) => ({
  _id: `cat_${i + 1}`,
  ...c,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))];

const withProductCounts = async (categories) => {
  if (!global.isDbConnected) {
    const staticMapped = staticProducts.map((p, i) => ({
      _id: `static_id_${p.id || i}`,
      ...p,
    }));
    const allProducts = [...(global.adminProducts || []), ...staticMapped];
    return categories.map((cat) => ({
      ...cat,
      productCount: allProducts.filter(
        (p) => String(p.category).toLowerCase() === String(cat.name).toLowerCase()
      ).length,
    }));
  }

  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    counts.map((row) => [String(row._id).toLowerCase(), row.count])
  );

  return categories.map((cat) => ({
    ...cat,
    productCount: countMap[String(cat.name).toLowerCase()] || 0,
  }));
};

const sortCategories = (list) =>
  [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

router.get('/', asyncHandler(async (req, res) => {
  const homeOnly = req.query.home === 'true';

  if (!global.isDbConnected) {
    let list = global.adminCategories.filter((c) => c.isActive !== false);
    if (homeOnly) list = list.filter((c) => c.showOnHome !== false);
    const withCounts = await withProductCounts(sortCategories(list));
    return res.json({ success: true, categories: withCounts });
  }

  const query = { isActive: true };
  if (homeOnly) query.showOnHome = true;

  const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 }).lean();
  const withCounts = await withProductCounts(
    categories.map((c) => ({ ...c, displayName: c.title || c.name }))
  );

  res.json({ success: true, categories: withCounts });
}));

export default router;