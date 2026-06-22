import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_URL, { resolveMediaUrl } from '../config/api';
import ProductRating from './ProductRating';
import { formatINR } from '../utils/currency';
import './OrderHistory.css';

const CANCELLABLE_STATUSES = ['placed', 'confirmed', 'packed'];

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const getOrderStatus = (order) => {
  if (order.orderStatus) return order.orderStatus;
  if (order.isDelivered) return 'delivered';
  if (order.isPaid) return 'confirmed';
  return 'placed';
};

const getStepIndex = (status) => {
  if (status === 'cancelled') return -1;
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [ratedProducts, setRatedProducts] = useState({});

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/myorders`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getDeliveryMessage = (order) => {
    const status = getOrderStatus(order);

    if (status === 'delivered') {
      return order.deliveredAt
        ? `Delivered on ${formatDeliveryDate(order.deliveredAt)}`
        : 'Your order has been delivered';
    }

    if (status === 'cancelled') {
      return 'This order was cancelled';
    }

    if (order.expectedDeliveryDate) {
      const deliveryStr = formatDeliveryDate(order.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deliveryDay = new Date(order.expectedDeliveryDate);
      deliveryDay.setHours(0, 0, 0, 0);

      if (deliveryDay < today) {
        return `Expected by ${deliveryStr} — we're working to get it to you soon`;
      }
      return `Expected delivery by ${deliveryStr}`;
    }

    return 'Delivery date will be confirmed shortly by our team';
  };

  const canCancelOrder = (order) => {
    const status = getOrderStatus(order);
    return CANCELLABLE_STATUSES.includes(status);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone once shipping starts.')) {
      return;
    }

    setCancellingId(orderId);
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.order : o)));
      setSuccessMessage('Order cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="orders-loading-container">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="breadcrumb-bar">
        <div className="container">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>Home</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">My Orders</span>
          </div>
        </div>
      </div>

      <div className="container orders-body">
        {successMessage && (
          <div className="order-success-banner">
            <div className="success-icon">🎉</div>
            <div className="success-content">
              <h3>Thank You for Your Order!</h3>
              <p>{successMessage}</p>
              <p className="sub-note">We'll update your expected delivery date soon. Track progress below.</p>
            </div>
          </div>
        )}

        <h1 className="orders-page-title">Order History</h1>

        {error && <div className="orders-error-alert">⚠️ {error}</div>}

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <span className="empty-icon">🏺</span>
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet. Explore our handcrafted collection to make your first purchase!</p>
            <button className="btn-primary start-shopping-btn" onClick={() => navigate('/allproducts')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const status = getOrderStatus(order);
              const currentStep = getStepIndex(status);
              const isCancelled = status === 'cancelled';
              const isDelivered = status === 'delivered';
              const showCancel = canCancelOrder(order);

              return (
                <div key={order._id} className="order-group-card">
                  <div className="order-card-header">
                    <div className="header-col">
                      <span className="header-label">Order Placed</span>
                      <span className="header-val">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="header-col">
                      <span className="header-label">Total Amount</span>
                      <span className="header-val total-val">{formatINR(order.totalPrice)}</span>
                    </div>
                    <div className="header-col">
                      <span className="header-label">Order ID</span>
                      <span className="header-val id-val">{order._id}</span>
                    </div>
                    <div className="header-col status-col">
                      <span className={`status-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                        {order.isPaid ? '● Paid' : '● Unpaid'}
                      </span>
                      <span className={`status-badge status-${status}`}>
                        ● {STATUS_LABELS[status] || status}
                      </span>
                    </div>
                  </div>

                  <div className={`delivery-info-banner ${status === 'delivered' ? 'delivered' : ''} ${isCancelled ? 'cancelled' : ''}`}>
                    <span className="delivery-icon">{status === 'delivered' ? '✅' : isCancelled ? '❌' : '📦'}</span>
                    <div>
                      <p className="delivery-main-text">{getDeliveryMessage(order)}</p>
                      {order.deliveryNote && status !== 'delivered' && status !== 'cancelled' && (
                        <p className="delivery-note-text">Note: {order.deliveryNote}</p>
                      )}
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="order-timeline">
                      {STATUS_STEPS.map((step, idx) => (
                        <div
                          key={step.key}
                          className={`timeline-step ${idx <= currentStep ? 'completed' : ''} ${idx === currentStep ? 'active' : ''}`}
                        >
                          <div className="timeline-dot" />
                          <span className="timeline-label">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="order-card-body">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <img src={resolveMediaUrl(item.image)} alt={item.name} className="order-item-img" />
                        <div className="order-item-details">
                          <h4 className="item-name">{item.name}</h4>
                          {item.color && (
                            <div className="item-color-row">
                              <span className="color-label">Color:</span>
                              <span className="color-dot" style={{ backgroundColor: item.color }} />
                            </div>
                          )}
                          <span className="item-qty-price">
                            Qty: {item.quantity} · {formatINR(item.price)} each · Subtotal: {formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                        <div className="order-item-actions">
                          <button
                            className="btn-outline reorder-btn"
                            onClick={() => navigate(`/product/${item.product}`)}
                          >
                            View Product
                          </button>
                          {isDelivered && !ratedProducts[item.product] && (
                            <div className="rate-product-block">
                              <span className="rate-label">Rate this product:</span>
                              <ProductRating
                                productId={item.product}
                                compact
                                onRated={() => setRatedProducts((prev) => ({ ...prev, [item.product]: true }))}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="footer-detail-grid">
                      <p className="shipping-address-summary">
                        <strong>Shipping To:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                      </p>
                      <p className="shipping-phone">
                        <strong>Phone:</strong> {order.shippingAddress.phone}
                      </p>
                      {order.isPaid && order.paidAt && (
                        <p className="payment-info">
                          <strong>Paid on:</strong> {formatDate(order.paidAt)}
                        </p>
                      )}
                      {isCancelled && order.cancelledAt && (
                        <p className="cancel-info">
                          <strong>Cancelled on:</strong> {formatDate(order.cancelledAt)}
                        </p>
                      )}
                    </div>
                    {showCancel && (
                      <button
                        className="btn-cancel-order"
                        disabled={cancellingId === order._id}
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                    {['shipped', 'out_for_delivery'].includes(status) && (
                      <p className="no-cancel-note">This order can no longer be cancelled — it has been shipped.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;