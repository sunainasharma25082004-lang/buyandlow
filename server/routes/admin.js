import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { recalculateProductRating } from '../utils/reviews.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { products as staticProducts } from '../data/products.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isProduction } from '../config/env.js';
import { canCancelOrder, applyCancellation, getOrderStatus } from '../utils/orderHelpers.js';

const router = express.Router();

global.adminProducts = global.adminProducts || [];

const sortCategories = (list) =>
  [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

const normalizeCategoryBody = (body) => ({
  name: body.name?.trim(),
  title: body.title?.trim() || body.name?.trim(),
  image: body.image,
  description: body.description?.trim() || '',
  sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 0,
  isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  showOnHome: body.showOnHome !== undefined ? Boolean(body.showOnHome) : true,
});

const findOfflineCategory = (id) =>
  (global.adminCategories || []).find((c) => c._id === id);

const categoryInUse = async (name, excludeId = null) => {
  if (!global.isDbConnected) {
    const allProducts = getAllProductsOffline();
    return allProducts.some(
      (p) => String(p.category).toLowerCase() === String(name).toLowerCase()
    );
  }

  const query = { category: new RegExp(`^${name}$`, 'i') };
  if (excludeId) {
    const cat = await Category.findById(excludeId);
    if (cat && cat.name.toLowerCase() === name.toLowerCase()) return false;
  }
  const count = await Product.countDocuments(query);
  return count > 0;
};

const MOCK_USERS = [
  {
    _id: 'mock_user_id_12345',
    name: 'Demo User',
    email: 'demo@truemart.com',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock_admin_id',
    name: 'Admin',
    email: 'admin@buylow.store',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

global.mockUsers = global.mockUsers || MOCK_USERS;

const requireDbOrOffline = (res) => {
  if (!global.isDbConnected && isProduction) {
    res.status(503).json({ success: false, message: 'Database unavailable' });
    return false;
  }
  return true;
};

const VALID_STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const applyOrderUpdates = (order, body) => {
  const { isPaid, isDelivered, orderStatus, expectedDeliveryDate, deliveryNote } = body;

  if (isPaid !== undefined) {
    order.isPaid = isPaid;
    order.paidAt = isPaid ? (order.paidAt || new Date()) : null;
    if (isPaid && order.orderStatus === 'placed') {
      order.orderStatus = 'confirmed';
    }
  }

  if (orderStatus !== undefined) {
    if (!VALID_STATUSES.includes(orderStatus)) {
      return 'Invalid order status';
    }

    if (orderStatus === 'cancelled') {
      const check = canCancelOrder(order);
      if (!check.ok) return check.message;
      applyCancellation(order, body.cancelReason);
      return null;
    }

    const currentStatus = getOrderStatus(order);
    if (currentStatus === 'cancelled') {
      return 'Cancelled orders cannot be updated';
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = order.deliveredAt || new Date();
    }
  }

  if (isDelivered !== undefined) {
    order.isDelivered = isDelivered;
    order.deliveredAt = isDelivered ? (order.deliveredAt || new Date()) : null;
    if (isDelivered) order.orderStatus = 'delivered';
  }

  if (expectedDeliveryDate !== undefined) {
    order.expectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;
  }

  if (deliveryNote !== undefined) {
    order.deliveryNote = String(deliveryNote).trim().slice(0, 500);
  }

  return null;
};

const getAllProductsOffline = () => {
  const staticMapped = staticProducts.map((p, i) => ({
    _id: `static_id_${p.id || i}`,
    ...p,
  }));
  return [...(global.adminProducts || []), ...staticMapped];
};

router.get('/dashboard', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    const allProducts = getAllProductsOffline();
    const allOrders = global.mockOrders || [];
    const paidOrders = allOrders.filter((o) => o.isPaid);
    const revenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return res.json({
      success: true,
      totalUsers: global.mockUsers.length,
      totalProducts: allProducts.length,
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      pendingOrders: allOrders.length - paidOrders.length,
      totalRevenue: revenue,
      recentOrders: allOrders.slice(-5).reverse(),
    });
  }

  const [totalUsers, totalProducts, totalOrders, paidOrders, orders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ isPaid: true }),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.json({
    success: true,
    totalUsers,
    totalProducts,
    totalOrders,
    paidOrders,
    pendingOrders: totalOrders - paidOrders,
    totalRevenue: revenueResult[0]?.total || 0,
    recentOrders: orders,
  });
}));

router.get('/users', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    return res.json(global.mockUsers);
  }

  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
}));

router.get('/orders', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    const orders = (global.mockOrders || []).map((o) => {
      const user = global.mockUsers.find((u) => u._id === o.user);
      return { ...o, user: user ? { name: user.name, email: user.email } : null };
    });
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(orders);
  }

  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
}));

router.put('/orders/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    const idx = (global.mockOrders || []).findIndex((o) => o._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });

    const err = applyOrderUpdates(global.mockOrders[idx], req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    global.mockOrders[idx].updatedAt = new Date().toISOString();
    return res.json(global.mockOrders[idx]);
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const err = applyOrderUpdates(order, req.body);
  if (err) return res.status(400).json({ success: false, message: err });

  const updated = await order.save();
  res.json(updated);
}));

router.get('/products', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    return res.json(getAllProductsOffline());
  }

  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
}));

router.post('/products', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  const {
    name, price, oldPrice, rating, reviews, image, images,
    badge, category, brand, sku, stock, colors, description, keyFeatures, tags,
  } = req.body;

  if (!name || price == null || !image || !category) {
    return res.status(400).json({ success: false, message: 'Name, price, image and category are required' });
  }

  if (global.isDbConnected) {
    const categoryExists = await Category.findOne({
      name: new RegExp(`^${String(category).trim()}$`, 'i'),
      isActive: true,
    });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Please create the category in Admin → Categories first.',
      });
    }
  } else {
    const categoryExists = (global.adminCategories || []).some(
      (c) => c.name.toLowerCase() === String(category).trim().toLowerCase() && c.isActive !== false
    );
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Please create the category in Admin → Categories first.',
      });
    }
  }

  const productData = {
    name: name.trim(),
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    rating: rating ? Number(rating) : 4.5,
    reviews: reviews ? Number(reviews) : 0,
    image,
    images: images?.length ? images : [image],
    badge: badge || null,
    category,
    brand: brand || 'Truemart',
    sku: sku || `TRD-${category.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`,
    stock: stock !== undefined ? Number(stock) : 10,
    colors: colors || [],
    description: description || '',
    keyFeatures: keyFeatures || [],
    tags: tags || [],
  };

  if (!global.isDbConnected) {
    const newProduct = {
      _id: `admin_prod_${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    global.adminProducts.unshift(newProduct);
    return res.status(201).json(newProduct);
  }

  const product = await Product.create(productData);
  res.status(201).json(product);
}));

router.put('/products/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    const staticIdx = staticProducts.findIndex(
      (p) => `static_id_${p.id}` === req.params.id || String(p.id) === req.params.id
    );
    if (staticIdx > -1) {
      return res.status(400).json({ success: false, message: 'Cannot edit seeded static products in offline mode' });
    }

    const idx = global.adminProducts.findIndex((p) => p._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    global.adminProducts[idx] = {
      ...global.adminProducts[idx],
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : global.adminProducts[idx].price,
      oldPrice: req.body.oldPrice !== undefined ? (req.body.oldPrice ? Number(req.body.oldPrice) : null) : global.adminProducts[idx].oldPrice,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : global.adminProducts[idx].stock,
      updatedAt: new Date().toISOString(),
    };
    return res.json(global.adminProducts[idx]);
  }

  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const fields = [
    'name', 'price', 'oldPrice', 'rating', 'reviews', 'image', 'images',
    'badge', 'category', 'brand', 'sku', 'stock', 'colors', 'description', 'keyFeatures', 'tags',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  product = await product.save();
  res.json(product);
}));

router.get('/categories', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    return res.json(sortCategories(global.adminCategories || []));
  }

  const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
  res.json(categories);
}));

router.post('/categories', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  const data = normalizeCategoryBody(req.body);
  if (!data.name || !data.image) {
    return res.status(400).json({ success: false, message: 'Name and image are required' });
  }

  if (!global.isDbConnected) {
    const exists = (global.adminCategories || []).some(
      (c) => c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCategory = {
      _id: `cat_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    global.adminCategories.unshift(newCategory);
    return res.status(201).json(newCategory);
  }

  const existing = await Category.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Category already exists' });
  }

  const category = await Category.create(data);
  res.status(201).json(category);
}));

router.put('/categories/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  const data = normalizeCategoryBody(req.body);
  if (!data.name || !data.image) {
    return res.status(400).json({ success: false, message: 'Name and image are required' });
  }

  if (!global.isDbConnected) {
    const idx = (global.adminCategories || []).findIndex((c) => c._id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const duplicate = (global.adminCategories || []).some(
      (c, i) => i !== idx && c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Category name already in use' });
    }

    global.adminCategories[idx] = {
      ...global.adminCategories[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return res.json(global.adminCategories[idx]);
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const duplicate = await Category.findOne({
    _id: { $ne: req.params.id },
    name: new RegExp(`^${data.name}$`, 'i'),
  });
  if (duplicate) {
    return res.status(400).json({ success: false, message: 'Category name already in use' });
  }

  Object.assign(category, data);
  const updated = await category.save();
  res.json(updated);
}));

router.delete('/categories/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    const category = findOfflineCategory(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const inUse = await categoryInUse(category.name);
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that has products. Reassign products first.',
      });
    }

    global.adminCategories = global.adminCategories.filter((c) => c._id !== req.params.id);
    return res.json({ success: true, message: 'Category removed' });
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const inUse = await Product.countDocuments({
    category: new RegExp(`^${category.name}$`, 'i'),
  });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category that has products. Reassign products first.',
    });
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category removed' });
}));

router.get('/reviews', protect, admin, asyncHandler(async (req, res) => {
  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const reviews = [...(global.mockReviews || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.json(reviews);
  }

  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .populate('product', 'name image')
    .populate('user', 'name email');

  res.json(reviews);
}));

router.put('/reviews/:id', protect, admin, asyncHandler(async (req, res) => {
  const { rating, comment, userName, images } = req.body;

  if (rating != null && (rating < 1 || rating > 5)) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  const normalizeImages = (value, fallback = []) => {
    if (value === undefined) return fallback;
    if (!Array.isArray(value)) return fallback;
    return value.filter((u) => typeof u === 'string' && u.trim()).slice(0, 5);
  };

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const idx = global.mockReviews.findIndex((r) => r._id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    global.mockReviews[idx] = {
      ...global.mockReviews[idx],
      rating: rating != null ? Number(rating) : global.mockReviews[idx].rating,
      comment: comment !== undefined ? String(comment).trim().slice(0, 500) : global.mockReviews[idx].comment,
      userName: userName?.trim() || global.mockReviews[idx].userName,
      images: normalizeImages(images, global.mockReviews[idx].images || []),
      updatedAt: new Date().toISOString(),
    };
    await recalculateProductRating(global.mockReviews[idx].product);
    return res.json(global.mockReviews[idx]);
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (rating != null) review.rating = Number(rating);
  if (comment !== undefined) review.comment = String(comment).trim().slice(0, 500);
  if (userName?.trim()) review.userName = userName.trim();
  if (images !== undefined) review.images = normalizeImages(images);

  await review.save();
  await recalculateProductRating(review.product);

  const populated = await Review.findById(review._id)
    .populate('product', 'name image')
    .populate('user', 'name email');

  res.json(populated);
}));

router.delete('/reviews/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const idx = global.mockReviews.findIndex((r) => r._id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const productId = global.mockReviews[idx].product;
    global.mockReviews.splice(idx, 1);
    await recalculateProductRating(productId);
    return res.json({ success: true, message: 'Review deleted' });
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  res.json({ success: true, message: 'Review deleted' });
}));

router.delete('/products/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!requireDbOrOffline(res)) return;

  if (!global.isDbConnected) {
    const idx = global.adminProducts.findIndex((p) => p._id === req.params.id);
    if (idx === -1) {
      return res.status(400).json({ success: false, message: 'Can only delete admin-added products in offline mode' });
    }
    global.adminProducts.splice(idx, 1);
    return res.json({ success: true, message: 'Product removed' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
}));

export default router;