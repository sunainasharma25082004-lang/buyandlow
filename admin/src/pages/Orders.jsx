import React, { useEffect, useState } from 'react';
import { getOrders, updateOrder } from '../api';
import { formatINR } from '../utils/currency';
import './Orders.css';

const STATUS_OPTIONS = [
  { value: 'placed', label: 'Order Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusBadgeClass = (status) => {
  if (status === 'delivered') return 'badge-success';
  if (status === 'cancelled') return 'badge-danger';
  if (['shipped', 'out_for_delivery'].includes(status)) return 'badge-info';
  return 'badge-warning';
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatDateOnly = (d) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};

const formatDeliveryDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const getStatusLabel = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status)?.label || status || 'Order Placed';

const POST_SHIPPING = ['shipped', 'out_for_delivery', 'delivered'];

const getStatusOptionsForOrder = (order) => {
  const status = order.orderStatus || (order.isDelivered ? 'delivered' : 'placed');
  if (status === 'cancelled') return STATUS_OPTIONS.filter((o) => o.value === 'cancelled');
  if (POST_SHIPPING.includes(status)) {
    return STATUS_OPTIONS.filter((o) => o.value !== 'cancelled');
  }
  return STATUS_OPTIONS;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const initEdit = (order) => ({
    orderStatus: order.orderStatus || (order.isDelivered ? 'delivered' : order.isPaid ? 'confirmed' : 'placed'),
    expectedDeliveryDate: formatDateOnly(order.expectedDeliveryDate),
    deliveryNote: order.deliveryNote || '',
  });

  const toggleExpand = (order) => {
    if (expandedId === order._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(order._id);
    setEdits((prev) => ({ ...prev, [order._id]: initEdit(order) }));
  };

  const handleEditChange = (orderId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }));
  };

  const handleSave = async (orderId) => {
    const edit = edits[orderId];
    if (!edit) return;

    setUpdating(orderId);
    try {
      const payload = {
        orderStatus: edit.orderStatus,
        expectedDeliveryDate: edit.expectedDeliveryDate || null,
        deliveryNote: edit.deliveryNote,
      };
      const { data } = await updateOrder(orderId, payload);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...data } : o)));
      setEdits((prev) => ({ ...prev, [orderId]: initEdit(data) }));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleQuickUpdate = async (orderId, field, value) => {
    setUpdating(orderId);
    try {
      const { data } = await updateOrder(orderId, { [field]: value });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...data } : o)));
      if (expandedId === orderId) {
        setEdits((prev) => ({ ...prev, [orderId]: initEdit(data) }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const paidCount = orders.filter((o) => o.isPaid).length;
  const deliveredCount = orders.filter((o) => o.isDelivered || o.orderStatus === 'delivered').length;
  const totalRevenue = orders.filter((o) => o.isPaid).reduce((s, o) => s + (o.totalPrice || 0), 0);

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders & Transactions</h1>
          <p className="page-subtitle">Manage orders, set delivery dates & track shipments</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-pill"><span>Total Orders</span><strong>{orders.length}</strong></div>
        <div className="stat-pill"><span>Paid</span><strong>{paidCount}</strong></div>
        <div className="stat-pill"><span>Delivered</span><strong>{deliveredCount}</strong></div>
        <div className="stat-pill"><span>Revenue</span><strong>{formatINR(totalRevenue)}</strong></div>
      </div>

      {loading ? (
        <div className="card"><div className="card-body loading-state">Loading orders...</div></div>
      ) : orders.length === 0 ? (
        <div className="card"><div className="card-body empty-state">No orders yet</div></div>
      ) : (
        orders.map((order) => {
          const isOpen = expandedId === order._id;
          const edit = edits[order._id] || initEdit(order);
          const status = order.orderStatus || (order.isDelivered ? 'delivered' : 'placed');

          return (
            <div key={order._id} className="order-detail-card">
              <div className="order-detail-header" onClick={() => toggleExpand(order)}>
                <div className="order-main-info">
                  <div className="order-id-line">
                    Order #{order._id?.slice(-8)} · {order.user?.name || 'Guest'}
                  </div>
                  <div className="order-meta-line">
                    {formatDate(order.createdAt)} · {order.orderItems?.length || 0} items · {order.user?.email}
                    {order.expectedDeliveryDate && (
                      <> · 📦 Est. delivery: {formatDeliveryDate(order.expectedDeliveryDate)}</>
                    )}
                  </div>
                </div>
                <div className="order-badges">
                  <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className={`badge ${statusBadgeClass(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>
                <div className="order-total">{formatINR(order.totalPrice)}</div>
                <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
              </div>

              {isOpen && (
                <div className="order-detail-body" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="order-info-grid">
                      <div className="order-info-block">
                        <h4>Customer</h4>
                        <p>
                          <strong>{order.user?.name || '—'}</strong><br />
                          {order.user?.email || '—'}<br />
                          📞 {order.shippingAddress?.phone || '—'}
                        </p>
                      </div>
                      <div className="order-info-block">
                        <h4>Shipping Address</h4>
                        <p>
                          {order.shippingAddress?.address}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                          {order.shippingAddress?.country}
                        </p>
                      </div>
                      <div className="order-info-block">
                        <h4>Payment</h4>
                        <p>
                          Method: {order.paymentMethod || 'Razorpay'}<br />
                          Status: {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Pending'}<br />
                          Razorpay ID: {order.razorpayPaymentId || '—'}
                        </p>
                      </div>
                      <div className="order-info-block">
                        <h4>Order Summary</h4>
                        <div className="payment-detail-row"><span>Items</span><strong>{formatINR(order.itemsPrice)}</strong></div>
                        <div className="payment-detail-row"><span>Shipping</span><strong>{formatINR(order.shippingPrice)}</strong></div>
                        <div className="payment-detail-row"><span>Total</span><strong>{formatINR(order.totalPrice)}</strong></div>
                        <div className="payment-detail-row"><span>Order ID</span><strong style={{ fontSize: '10px' }}>{order._id}</strong></div>
                      </div>
                    </div>

                    <div className="order-items-section">
                      <h4>Items ({order.orderItems?.length || 0})</h4>
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="order-item-line">
                          {item.image && <img src={item.image} alt="" />}
                          <div className="item-text">
                            <div className="item-name">{item.name}</div>
                            <div className="item-sub">
                              Qty: {item.quantity}
                              {item.color && ` · Color: ${item.color}`}
                              {' · '}{formatINR(item.price)} each
                            </div>
                          </div>
                          <div className="item-total">{formatINR(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-admin-panel">
                    <h4>Delivery Management</h4>

                    <div className="form-group">
                      <label>Order Status</label>
                      <select
                        value={edit.orderStatus}
                        onChange={(e) => handleEditChange(order._id, 'orderStatus', e.target.value)}
                      >
                        {getStatusOptionsForOrder(order).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {POST_SHIPPING.includes(status) && (
                        <p style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                          Orders cannot be cancelled after shipping has started.
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Expected Delivery Date</label>
                      <input
                        type="date"
                        value={edit.expectedDeliveryDate}
                        min={formatDateOnly(new Date())}
                        onChange={(e) => handleEditChange(order._id, 'expectedDeliveryDate', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Message for Customer (optional)</label>
                      <textarea
                        placeholder="e.g. Your order will arrive between 10 AM – 6 PM"
                        value={edit.deliveryNote}
                        onChange={(e) => handleEditChange(order._id, 'deliveryNote', e.target.value)}
                      />
                    </div>

                    {edit.expectedDeliveryDate && (
                      <div className="delivery-preview">
                        Customer will see: <strong>Expected by {formatDeliveryDate(edit.expectedDeliveryDate)}</strong>
                        {edit.deliveryNote && <> — {edit.deliveryNote}</>}
                      </div>
                    )}

                    <div className="order-admin-actions">
                      <button
                        className="btn btn-gold btn-sm"
                        disabled={updating === order._id}
                        onClick={() => handleSave(order._id)}
                      >
                        {updating === order._id ? 'Saving...' : 'Save Delivery Details'}
                      </button>
                      {!order.isPaid && (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={updating === order._id}
                          onClick={() => handleQuickUpdate(order._id, 'isPaid', true)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Orders;