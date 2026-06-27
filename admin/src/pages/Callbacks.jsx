import React, { useEffect, useMemo, useState } from 'react';
import { getCallbacks, updateCallback, deleteCallback } from '../api';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import './Callbacks.css';

const STATUS_LABELS = {
  pending: 'Pending',
  contacted: 'Contacted',
  resolved: 'Resolved',
};

const statusBadgeClass = (status) => {
  if (status === 'resolved') return 'badge-success';
  if (status === 'contacted') return 'badge-info';
  return 'badge-warning';
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TYPE_LABELS = {
  callback: 'Call Back',
  chat: 'Chat Support',
};

const matchesCallbackSearch = (item, query) => {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return (
    String(item._id || '').toLowerCase().includes(term)
    || (item.name || '').toLowerCase().includes(term)
    || (item.email || '').toLowerCase().includes(term)
    || (item.phone || '').toLowerCase().includes(term)
    || (item.preferredTime || '').toLowerCase().includes(term)
    || (item.note || '').toLowerCase().includes(term)
    || (item.chatSummary || '').toLowerCase().includes(term)
    || (item.requestType || '').toLowerCase().includes(term)
    || (item.status || '').toLowerCase().includes(term)
  );
};

const Callbacks = () => {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchCallbacks = (silent = false) => {
    if (!silent) setLoading(true);
    getCallbacks()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCallbacks(data);
      })
      .catch((err) => {
        console.error('Failed to load support requests', err);
        if (!silent) setCallbacks([]);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchCallbacks();
    const interval = setInterval(() => fetchCallbacks(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredCallbacks = useMemo(
    () => callbacks.filter((c) => {
      const type = c.requestType || 'callback';
      if (typeFilter !== 'all' && type !== typeFilter) return false;
      return matchesCallbackSearch(c, search);
    }),
    [callbacks, search, typeFilter],
  );

  const {
    page,
    setPage,
    totalPages,
    paginatedItems: paginatedCallbacks,
    totalItems: filteredCount,
    rangeStart,
    rangeEnd,
  } = usePagination(filteredCallbacks, 20, search);

  const pendingCount = callbacks.filter((c) => c.status === 'pending').length;
  const contactedCount = callbacks.filter((c) => c.status === 'contacted').length;
  const chatCount = callbacks.filter((c) => c.requestType === 'chat').length;
  const callCount = callbacks.filter((c) => (c.requestType || 'callback') === 'callback').length;

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { data } = await updateCallback(id, { status });
      setCallbacks((prev) => prev.map((c) => (c._id === id ? data : c)));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete callback request from "${name}"?`)) return;
    setUpdating(id);
    try {
      await deleteCallback(id);
      setCallbacks((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="callbacks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Requests</h1>
          <p className="page-subtitle">
            {callbacks.length} requests — customers who want to chat or call you
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={() => fetchCallbacks()}>
          Refresh
        </button>
      </div>

      <div className="callbacks-stats">
        <div className="stat-pill"><span>Total</span><strong>{callbacks.length}</strong></div>
        <div className="stat-pill"><span>Pending</span><strong>{pendingCount}</strong></div>
        <div className="stat-pill"><span>Contacted</span><strong>{contactedCount}</strong></div>
        <div className="stat-pill"><span>Chat</span><strong>{chatCount}</strong></div>
        <div className="stat-pill"><span>Call Back</span><strong>{callCount}</strong></div>
      </div>

      {!loading && callbacks.length > 0 ? (
        <div className="search-toolbar" style={{ marginBottom: 10 }}>
          <button
            type="button"
            className={`btn btn-sm ${typeFilter === 'all' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm ${typeFilter === 'chat' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setTypeFilter('chat')}
          >
            Chat
          </button>
          <button
            type="button"
            className={`btn btn-sm ${typeFilter === 'callback' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setTypeFilter('callback')}
          >
            Call Back
          </button>
        </div>
      ) : null}

      {!loading && callbacks.length > 0 ? (
        <div className="search-toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search callback requests"
          />
          {search ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearch('')}>
              Clear
            </button>
          ) : null}
          {search ? (
            <span className="search-count">
              {filteredCallbacks.length} of {callbacks.length}
            </span>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="card"><div className="card-body loading-state">Loading callback requests...</div></div>
      ) : callbacks.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state">
            No support requests yet. They appear when customers use Chat or Call Me Back in the mobile app.
          </div>
        </div>
      ) : filteredCallbacks.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state">
            No requests match &quot;{search}&quot;.
          </div>
        </div>
      ) : (
        <>
          {paginatedCallbacks.map((item) => {
            const isChat = item.requestType === 'chat';
            return (
            <div key={item._id} className="callback-card">
              <div className="callback-card-header">
                <div>
                  <h3>
                    {isChat ? '💬' : '📞'} {item.name}
                    {isChat ? ' — chat support request' : ' — wants a callback'}
                  </h3>
                  <p>Requested {formatDate(item.createdAt)} · ID: {item._id}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span className={`badge ${isChat ? 'badge-info' : 'badge-gold'}`}>
                    {TYPE_LABELS[item.requestType] || TYPE_LABELS.callback}
                  </span>
                  <span className={`badge ${statusBadgeClass(item.status)}`}>
                    {STATUS_LABELS[item.status] || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="callback-card-body">
                <div className="callback-info-block">
                  <h4>Customer Name</h4>
                  <p><strong>{item.name}</strong></p>
                </div>
                <div className="callback-info-block">
                  <h4>Email</h4>
                  <p>
                    {item.email ? (
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    ) : (
                      <span className="text-muted">Not provided</span>
                    )}
                  </p>
                </div>
                <div className="callback-info-block">
                  <h4>Phone</h4>
                  <p>
                    {item.phone ? (
                      <a href={`tel:+91${item.phone}`}>+91 {item.phone}</a>
                    ) : (
                      <span className="text-muted">Not provided</span>
                    )}
                  </p>
                </div>
                {!isChat ? (
                  <div className="callback-info-block">
                    <h4>Preferred Time</h4>
                    <p>{item.preferredTime || 'Any time'}</p>
                  </div>
                ) : null}
                {item.user?.email ? (
                  <div className="callback-info-block">
                    <h4>Account Email</h4>
                    <p>{item.user.email}</p>
                  </div>
                ) : null}
                {item.chatSummary ? (
                  <div className="callback-note">
                    <h4 style={{ marginBottom: 6, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Chat Conversation
                    </h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{item.chatSummary}</p>
                  </div>
                ) : null}
                {item.note ? (
                  <div className="callback-note">
                    <h4 style={{ marginBottom: 6, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {isChat ? 'Issue Note' : 'Customer Note'}
                    </h4>
                    <p>{item.note}</p>
                  </div>
                ) : null}
              </div>

              <div className="callback-actions">
                {item.phone ? (
                  <a href={`tel:+91${item.phone}`} className="btn btn-gold btn-sm">
                    Call Now
                  </a>
                ) : null}
                {item.status !== 'contacted' ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={updating === item._id}
                    onClick={() => handleStatus(item._id, 'contacted')}
                  >
                    Mark Contacted
                  </button>
                ) : null}
                {item.status !== 'resolved' ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={updating === item._id}
                    onClick={() => handleStatus(item._id, 'resolved')}
                  >
                    Mark Resolved
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={updating === item._id}
                  onClick={() => handleDelete(item._id, item.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
          })}

          <div className="card">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalItems={filteredCount}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Callbacks;