import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { defaultCategories } from '../data/categories.js';
import { products as staticProducts } from '../data/products.js';
import asyncHandler from '../utils/asyncHandler.js';
import { normalizeCategoryAliases } from '../utils/validators.js';

const router = express.Router();

global.adminCategories = global.adminCategories || [...defaultCategories.map((c, i) => ({
  _id: `cat_${i + 1}`,
  ...c,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))];

const escapeRegex = (string) =>
  string ? String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

const withProductCounts = async (categories) => {
  if (!global.isDbConnected) {
    const deletedSet = global.deletedProductIds || new Set();
    const staticMapped = staticProducts
      .filter((p, i) => {
        const id1 = `static_id_${p.id || i}`;
        const id2 = String(p.id || '');
        const id3 = String(p._id || '');
        return !deletedSet.has(id1) && !deletedSet.has(id2) && !deletedSet.has(id3);
      })
      .map((p, i) => ({
        _id: p.id ? String(p.id) : (p._id ? String(p._id) : `static_id_${i}`),
        ...p,
      }));
    const allProducts = [...(global.adminProducts || []).filter((p) => !deletedSet.has(String(p._id))), ...staticMapped]
      .filter((p) => p.isActive !== false);

    return categories.map((cat) => {
      const aliases = normalizeCategoryAliases(cat.name || cat.title || '').map((a) => a.toLowerCase());
      const catId = String(cat._id || '');
      const catName = String(cat.name || '').toLowerCase();
      const count = allProducts.filter((p) => {
        const pCat = p.category ? String(p.category).trim().toLowerCase() : '';
        const pCatId = p.categoryId ? String(p.categoryId).trim() : '';
        if (catId && (pCatId === catId || pCat === catId.toLowerCase())) return true;
        if (aliases.includes(pCat)) return true;
        if (catName && pCat === catName) return true;
        return false;
      }).length;
      return {
        ...cat,
        productCount: count,
      };
    });
  }

  // Count products for each active category in MongoDB matching either categoryId or category name/aliases
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const aliases = normalizeCategoryAliases(cat.name || cat.title || '');
      const catId = String(cat._id || '');
      const orClauses = [
        { category: { $in: aliases.map((a) => new RegExp(`^${escapeRegex(a)}$`, 'i')) } },
      ];
      if (catId) {
        orClauses.push({ categoryId: catId });
        orClauses.push({ category: catId });
      }
      if (cat.name) {
        orClauses.push({ category: new RegExp(`^${escapeRegex(cat.name)}$`, 'i') });
      }

      const count = await Product.countDocuments({
        isActive: { $ne: false },
        $or: orClauses,
      });

      return {
        ...cat,
        productCount: count,
      };
    })
  );

  return categoriesWithCounts;
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
    categories.map((c) => ({
      ...c,
      displayName: c.title || c.name,
      subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
    }))
  );

  res.json({ success: true, categories: withCounts });
}));

export default router;