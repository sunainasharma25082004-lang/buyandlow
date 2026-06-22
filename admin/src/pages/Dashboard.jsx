import React, { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import { formatINR } from '../utils/currency';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  const cards = [
    { icon: '👥', cls: 'users', value: stats.totalUsers, label: 'Total Users' },
    { icon: '📦', cls: 'products', value: stats.totalProducts, label: 'Total Products' },
    { icon: '🛒', cls: 'orders', value: stats.totalOrders, label: 'Total Orders' },
    { icon: '💰', cls: 'revenue', value: formatINR(stats.totalRevenue), label: 'Total Revenue' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your BuyLow store</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
            <div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon revenue">✅</div>
          <div>
            <div className="stat-value">{stats.paidOrders}</div>
            <div className="stat-label">Paid Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders">⏳</div>
          <div>
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Pending Payments</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Orders</h3>
        </div>
        <div className="card-body">
          {stats.recentOrders?.length === 0 ? (
            <div className="empty-state">No orders yet</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.map((order) => (
                    <tr key={order._id}>
                      <td><code style={{ fontSize: '11px' }}>{order._id?.slice(-8)}</code></td>
                      <td>{order.user?.name || order.user?.email || '—'}</td>
                      <td><strong>{formatINR(order.totalPrice)}</strong></td>
                      <td>
                        <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;