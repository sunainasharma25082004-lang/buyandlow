import type { Order } from '../types/api';
import { getOrderStatus } from '../services/api';

export const ORDER_TRACKING_STEPS = [
  { key: 'placed', label: 'Order Placed', hint: 'Order received' },
  { key: 'confirmed', label: 'Confirmed', hint: 'Payment confirmed' },
  { key: 'packed', label: 'Packed', hint: 'Items packed' },
  { key: 'shipped', label: 'Shipped', hint: 'Left warehouse' },
  { key: 'out_for_delivery', label: 'Dispatched', hint: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', hint: 'Delivered successfully' },
] as const;

export type TrackingStepKey = (typeof ORDER_TRACKING_STEPS)[number]['key'];

const STATUS_INDEX: Record<string, number> = {
  placed: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
};

const DEFAULT_DELIVERY_DAYS = 5;

export const getActiveStepIndex = (order: Order) => {
  const status = getOrderStatus(order);
  if (status === 'cancelled') return -1;
  return STATUS_INDEX[status] ?? 0;
};

export const getExpectedDeliveryDate = (order: Order): Date => {
  if (order.expectedDeliveryDate) {
    return new Date(order.expectedDeliveryDate);
  }
  const base = new Date(order.createdAt);
  base.setDate(base.getDate() + DEFAULT_DELIVERY_DAYS);
  return base;
};

export const getDeliveryMessage = (order: Order) => {
  const status = getOrderStatus(order);

  if (status === 'cancelled') {
    return { title: 'Order Cancelled', subtitle: order.deliveryNote || 'This order was cancelled.' };
  }

  if (status === 'delivered') {
    const deliveredOn = order.deliveredAt
      ? new Date(order.deliveredAt)
      : getExpectedDeliveryDate(order);
    return {
      title: 'Delivered',
      subtitle: `Delivered on ${deliveredOn.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`,
    };
  }

  const expected = getExpectedDeliveryDate(order);
  const now = new Date();
  const diffMs = expected.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const dateStr = expected.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (daysLeft === 0) {
    return { title: 'Arriving Today', subtitle: `Expected by ${dateStr}` };
  }

  return {
    title: `Arrives in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    subtitle: `Expected delivery: ${dateStr}`,
  };
};

export const formatStatusLabel = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());