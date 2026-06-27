import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateShippingAddress, validateOrderItems } from '../utils/validators.js';
import { isProduction } from '../config/env.js';
import {
  canCancelOrder,
  applyCancellation,
  getOrderStatus,
  computeExpectedDelivery,
} from '../utils/orderHelpers.js';

const router = express.Router();

global.mockOrders = global.mockOrders || [];

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes('your_') || key_secret.includes('your_')) {
    if (!isProduction) {
      console.warn('Razorpay keys not configured — simulated payment mode active');
    }
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

const isSimulatedPayment = () => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return !secret || secret.includes('your_');
};

// GET /myorders — must stay before any /:id routes
router.get('/myorders', protect, asyncHandler(async (req, res) => {
  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
    const userOrders = global.mockOrders
      .filter((o) => o.user === req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(userOrders);
  }

  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, itemsPrice, shippingPrice, totalPrice, paymentMethod } = req.body;
  const resolvedPaymentMethod = paymentMethod || 'Razorpay';
  const isCod = resolvedPaymentMethod.toLowerCase().includes('cod') ||
    resolvedPaymentMethod.toLowerCase().includes('cash');

  const itemsError = validateOrderItems(orderItems);
  if (itemsError) {
    return res.status(400).json({ success: false, message: itemsError });
  }

  const addressError = validateShippingAddress(shippingAddress);
  if (addressError) {
    return res.status(400).json({ success: false, message: addressError });
  }

  if (totalPrice == null || Number(totalPrice) <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid order total' });
  }

  const razorpay = isCod ? null : getRazorpayInstance();
  let razorpayOrderId;

  if (isCod) {
    razorpayOrderId = undefined;
  } else if (razorpay) {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(Number(totalPrice) * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    razorpayOrderId = rzpOrder.id;
  } else {
    razorpayOrderId = `sim_rzp_order_${Date.now()}`;
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const createdAt = new Date().toISOString();
    const mockOrder = {
      _id: `mock_order_${Date.now()}`,
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: resolvedPaymentMethod,
      razorpayOrderId,
      itemsPrice,
      shippingPrice,
      totalPrice: Number(totalPrice),
      isPaid: isCod,
      paidAt: isCod ? createdAt : undefined,
      isDelivered: false,
      orderStatus: isCod ? 'confirmed' : 'placed',
      expectedDeliveryDate: computeExpectedDelivery(new Date(createdAt)).toISOString(),
      deliveryNote: '',
      createdAt,
    };

    global.mockOrders.push(mockOrder);

    return res.status(201).json({
      success: true,
      order: mockOrder,
      razorpayOrderId,
      amount: Math.round(Number(totalPrice) * 100),
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID || 'simulated_key_id',
      simulated: !razorpay,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: resolvedPaymentMethod,
    itemsPrice: Number(itemsPrice),
    shippingPrice: Number(shippingPrice),
    totalPrice: Number(totalPrice),
    razorpayOrderId,
    isPaid: isCod,
    paidAt: isCod ? new Date() : undefined,
    orderStatus: isCod ? 'confirmed' : 'placed',
    expectedDeliveryDate: computeExpectedDelivery(),
  });

  res.status(201).json({
    success: true,
    order,
    razorpayOrderId,
    amount: Math.round(Number(totalPrice) * 100),
    currency: 'INR',
    key_id: process.env.RAZORPAY_KEY_ID || '',
    simulated: !razorpay,
  });
}));

router.post('/verify', protect, asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, simulated } = req.body;

  if (!razorpayOrderId) {
    return res.status(400).json({ success: false, message: 'razorpayOrderId is required' });
  }

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const orderIndex = global.mockOrders.findIndex(
      (o) => o.razorpayOrderId === razorpayOrderId && o.user === req.user._id
    );

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (global.mockOrders[orderIndex].isPaid) {
      return res.json({ success: true, message: 'Order already paid', order: global.mockOrders[orderIndex] });
    }

    global.mockOrders[orderIndex].isPaid = true;
    global.mockOrders[orderIndex].paidAt = new Date().toISOString();
    global.mockOrders[orderIndex].orderStatus = 'confirmed';
    if (!global.mockOrders[orderIndex].expectedDeliveryDate) {
      global.mockOrders[orderIndex].expectedDeliveryDate = computeExpectedDelivery(
        new Date(global.mockOrders[orderIndex].paidAt),
      ).toISOString();
    }
    global.mockOrders[orderIndex].razorpayPaymentId = razorpayPaymentId || `sim_pay_${Date.now()}`;
    global.mockOrders[orderIndex].razorpaySignature = razorpaySignature || `sim_sig_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Payment completed successfully',
      order: global.mockOrders[orderIndex],
    });
  }

  const order = await Order.findOne({ razorpayOrderId });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to verify this order' });
  }

  if (order.isPaid) {
    return res.json({ success: true, message: 'Order already paid', order });
  }

  const useSimulation = simulated || isSimulatedPayment();

  if (!useSimulation) {
    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment details missing' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'confirmed';
  if (!order.expectedDeliveryDate) {
    order.expectedDeliveryDate = computeExpectedDelivery(order.paidAt);
  }
  order.razorpayPaymentId = razorpayPaymentId || `sim_pay_${Date.now()}`;
  order.razorpaySignature = razorpaySignature || `sim_sig_${Date.now()}`;
  await order.save();

  await User.findByIdAndUpdate(req.user._id, { cart: [] });

  res.json({ success: true, message: 'Payment verified successfully', order });
}));

router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!global.isDbConnected) {
    if (isProduction) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const idx = global.mockOrders.findIndex(
      (o) => o._id === req.params.id && o.user === req.user._id
    );
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const check = canCancelOrder(global.mockOrders[idx]);
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.message });
    }

    applyCancellation(global.mockOrders[idx], reason);
    return res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: global.mockOrders[idx],
    });
  }

  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const check = canCancelOrder(order);
  if (!check.ok) {
    return res.status(400).json({ success: false, message: check.message });
  }

  applyCancellation(order, reason);
  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
}));

export { getOrderStatus };
export default router;