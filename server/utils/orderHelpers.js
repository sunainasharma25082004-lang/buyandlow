const DEFAULT_DELIVERY_DAYS = 5;

const computeExpectedDelivery = (fromDate = new Date(), days = DEFAULT_DELIVERY_DAYS) => {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  return d;
};

const CANCELLABLE_STATUSES = ['placed', 'confirmed', 'packed'];
const POST_SHIPPING_STATUSES = ['shipped', 'out_for_delivery', 'delivered'];

const getOrderStatus = (order) => {
  if (order.orderStatus) return order.orderStatus;
  if (order.isDelivered) return 'delivered';
  if (order.isPaid) return 'confirmed';
  return 'placed';
};

const canCancelOrder = (order) => {
  const status = getOrderStatus(order);

  if (status === 'cancelled') {
    return { ok: false, message: 'Order is already cancelled' };
  }

  if (POST_SHIPPING_STATUSES.includes(status)) {
    return { ok: false, message: 'Order cannot be cancelled after shipping has started' };
  }

  if (CANCELLABLE_STATUSES.includes(status)) {
    return { ok: true };
  }

  return { ok: false, message: 'This order cannot be cancelled' };
};

const applyCancellation = (order, reason = '') => {
  order.orderStatus = 'cancelled';
  order.isDelivered = false;
  order.deliveredAt = null;
  order.cancelledAt = new Date();
  order.deliveryNote = reason
    ? `Cancelled: ${String(reason).trim().slice(0, 200)}`
    : (order.deliveryNote || 'Order cancelled by customer');
};

export {
  DEFAULT_DELIVERY_DAYS,
  computeExpectedDelivery,
  CANCELLABLE_STATUSES,
  POST_SHIPPING_STATUSES,
  getOrderStatus,
  canCancelOrder,
  applyCancellation,
};