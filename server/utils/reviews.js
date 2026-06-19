import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

global.mockReviews = global.mockReviews || [];

const userHasDeliveredProduct = async (userId, productId) => {
  if (!global.isDbConnected) {
    return (global.mockOrders || []).some((order) => {
      const delivered = order.isDelivered || order.orderStatus === 'delivered';
      if (!delivered || order.user !== userId) return false;
      return order.orderItems?.some(
        (item) => String(item.product) === String(productId)
      );
    });
  }

  const count = await Order.countDocuments({
    user: userId,
    $or: [{ isDelivered: true }, { orderStatus: 'delivered' }],
    'orderItems.product': productId,
  });

  return count > 0;
};

const recalculateProductRating = async (productId) => {
  if (!global.isDbConnected) {
    const productReviews = global.mockReviews.filter(
      (r) => String(r.product) === String(productId)
    );
    const count = productReviews.length;
    const avg = count
      ? productReviews.reduce((s, r) => s + r.rating, 0) / count
      : 0;

    const rating = Math.round(avg * 10) / 10;

    const adminIdx = (global.adminProducts || []).findIndex(
      (p) => String(p._id) === String(productId)
    );
    if (adminIdx > -1) {
      global.adminProducts[adminIdx].rating = rating || global.adminProducts[adminIdx].rating;
      global.adminProducts[adminIdx].reviews = count;
    }

    return { rating, count };
  }

  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const rating = Math.round((stats[0]?.avg || 0) * 10) / 10;
  const count = stats[0]?.count || 0;

  await Product.findByIdAndUpdate(productId, { rating, reviews: count });
  return { rating, count };
};

export {
  userHasDeliveredProduct,
  recalculateProductRating,
};