import express from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { products as staticProducts } from '../data/products.js';
import { protect, getJwtSecret } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { clampPagination } from '../utils/validators.js';
import { recalculateProductRating } from '../utils/reviews.js';
import { isProduction } from '../config/env.js';

const router = express.Router();

const isOnSale = (p) => p.oldPrice != null && Number(p.oldPrice) > Number(p.price);

const filterStaticProducts = (queryOptions) => {
  const { keyword, category, minPrice, maxPrice, rating, sort, sale } = queryOptions;
  const { page, limit } = clampPagination(queryOptions.page, queryOptions.limit);

  const adminAdded = (global.adminProducts || []).map((p) => ({ ...p }));
  const staticMapped = staticProducts.map((p, index) => ({
    _id: `static_id_${p.id || index}`,
    ...p,
  }));
  let list = [...adminAdded, ...staticMapped];

  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(kw) ||
      (p.description && p.description.toLowerCase().includes(kw))
    );
  }

  if (category && category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (sale === 'true') {
    list = list.filter(isOnSale);
  }

  if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
  if (rating) list = list.filter((p) => p.rating >= Number(rating));

  if (sort === 'Price: Low to High') list.sort((a, b) => a.price - b.price);
  else if (sort === 'Price: High to Low') list.sort((a, b) => b.price - a.price);
  else if (sort === 'Best Rating') list.sort((a, b) => b.rating - a.rating);
  else if (sort === 'Popular') list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0) || b.rating - a.rating);
  else if (sort === 'Newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const total = list.length;
  const skip = (page - 1) * limit;

  return {
    success: true,
    products: list.slice(skip, skip + limit),
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  };
};

router.get('/', asyncHandler(async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(filterStaticProducts(req.query));
  }

  const { keyword, category, minPrice, maxPrice, rating, sort, sale } = req.query;
  const { page, limit } = clampPagination(req.query.page, req.query.limit);
  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category && category !== 'All') query.category = category;

  if (sale === 'true') {
    query.oldPrice = { $ne: null, $gt: 0 };
    query.$expr = { $gt: ['$oldPrice', '$price'] };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (rating) query.rating = { $gte: Number(rating) };

  const sortOptions = {
    'Price: Low to High': { price: 1 },
    'Price: High to Low': { price: -1 },
    'Best Rating': { rating: -1 },
    'Popular': { reviews: -1, rating: -1 },
    'Newest': { createdAt: -1 },
  }[sort] || { createdAt: -1 };

  const skip = (page - 1) * limit;
  const [count, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query).sort(sortOptions).skip(skip).limit(limit),
  ]);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / limit) || 1,
    total: count,
  });
}));

const findProductById = async (id) => {
  if (!global.isDbConnected) {
    const adminMatch = (global.adminProducts || []).find((p) => p._id === id);
    if (adminMatch) return adminMatch;

    const idMatch = staticProducts.find(
      (p) => String(p.id) === String(id) || `static_id_${p.id}` === String(id)
    );
    if (idMatch) return { _id: `static_id_${idMatch.id}`, ...idMatch };

    const skuMatch = staticProducts.find((p) => p.sku === id);
    if (skuMatch) return { _id: `static_id_${skuMatch.id}`, ...skuMatch };

    return null;
  }

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const byId = await Product.findById(id);
    if (byId) return byId;
  }

  return Product.findOne({ sku: id });
};

router.get('/reviews/recent', asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 6), 12);

  if (!global.isDbConnected) {
    const recent = [...(global.mockReviews || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((r) => {
        const product = staticProducts.find(
          (p) => `static_id_${p.id}` === String(r.product)
        ) || (global.adminProducts || []).find((p) => String(p._id) === String(r.product));
        return {
          ...r,
          productName: product?.name || 'Product',
        };
      });
    return res.json({ success: true, reviews: recent });
  }

  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('product', 'name');

  res.json({
    success: true,
    reviews: reviews.map((r) => ({
      _id: r._id,
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      productName: r.product?.name || 'Product',
    })),
  });
}));

router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await findProductById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const productId = product._id;
  let reviews = [];
  let userReview = null;
  let canReview = false;

  if (!global.isDbConnected) {
    reviews = (global.mockReviews || [])
      .filter((r) => String(r.product) === String(productId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (req.headers.authorization?.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, getJwtSecret());
        const userId = decoded.id;

        userReview = reviews.find((r) => r.user === userId) || null;
        canReview = true;
      } catch {
        // ignore invalid token for public reviews list
      }
    }
  } else {
    reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(50);

    if (req.headers.authorization?.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findById(decoded.id).select('name');
        if (user) {
          userReview = await Review.findOne({ user: user._id, product: productId });
          canReview = true;
        }
      } catch {
        // ignore
      }
    }
  }

  const count = reviews.length;
  const averageRating = count
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : product.rating || 0;

  res.json({
    success: true,
    reviews,
    averageRating,
    totalReviews: count || product.reviews || 0,
    userReview,
    canReview,
  });
}));

router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  const product = await findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const productId = product._id;

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const existingIdx = global.mockReviews.findIndex(
      (r) => r.user === req.user._id && String(r.product) === String(productId)
    );

    const reviewData = {
      _id: existingIdx > -1 ? global.mockReviews[existingIdx]._id : `review_${Date.now()}`,
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment: String(comment || '').trim().slice(0, 500),
      userName: req.user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx > -1) {
      global.mockReviews[existingIdx] = reviewData;
    } else {
      global.mockReviews.push(reviewData);
    }

    const stats = await recalculateProductRating(productId);
    return res.status(existingIdx > -1 ? 200 : 201).json({
      success: true,
      review: reviewData,
      productRating: stats.rating,
      productReviews: stats.count,
    });
  }

  const productIdStr = String(productId);
  if (!productIdStr.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Reviews require a database product' });
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: productId },
    {
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment: String(comment || '').trim().slice(0, 500),
      userName: req.user.name,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const stats = await recalculateProductRating(productId);

  res.status(201).json({
    success: true,
    review,
    productRating: stats.rating,
    productReviews: stats.count,
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await findProductById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json(product);
}));

export default router;