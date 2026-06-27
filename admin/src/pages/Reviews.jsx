import React, { useEffect, useState } from 'react';
import { getReviews, updateReview, deleteReview } from '../api';
import AdminImage from '../components/AdminImage';
import { resolveMediaUrl } from '../config/api';

const StarDisplay = ({ rating }) => (
  <span className="star-rating">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
);

const ReviewPhotoStrip = ({ images = [], onRemove, editable = false }) => {
  if (!images?.length) {
    return <span className="text-muted">No photos</span>;
  }

  return (
    <div className="review-photo-strip">
      {images.map((src, idx) => (
        <div key={`${src}-${idx}`} className="review-photo-item">
          <a href={resolveMediaUrl(src)} target="_blank" rel="noreferrer" title="Open full image">
            <AdminImage src={src} alt={`Review photo ${idx + 1}`} className="review-photo-thumb" />
          </a>
          {editable ? (
            <button
              type="button"
              className="review-photo-remove"
              onClick={() => onRemove?.(idx)}
              title="Remove photo"
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '', userName: '', images: [] });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    getReviews()
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const openEdit = (review) => {
    setEditing(review._id);
    setForm({
      rating: review.rating,
      comment: review.comment || '',
      userName: review.userName || '',
      images: Array.isArray(review.images) ? [...review.images] : [],
    });
  };

  const removeFormImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateReview(editing, form);
      setReviews((prev) => prev.map((r) => (r._id === editing ? res.data : r)));
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete review by "${name}"? This will remove the review and all its photos.`)) return;
    setDeleting(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      if (editing === id) setEditing(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Manage customer reviews — view photos, edit or delete</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-state">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">No reviews yet. They will appear when customers rate products.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Photos</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id}>
                      {editing === r._id ? (
                        <td colSpan={7}>
                          <div className="review-edit-panel">
                            <div className="form-row" style={{ marginBottom: 12 }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Customer Name</label>
                                <input
                                  value={form.userName}
                                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Rating (1-5)</label>
                                <select
                                  value={form.rating}
                                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                                >
                                  {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>{n} stars</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Comment</label>
                              <textarea
                                rows={3}
                                value={form.comment}
                                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                              />
                            </div>

                            <div className="form-group">
                              <label>Review Photos ({form.images.length}/5)</label>
                              <ReviewPhotoStrip
                                images={form.images}
                                editable
                                onRemove={removeFormImage}
                              />
                              <p className="review-photo-hint">Click × on a photo to remove it from this review.</p>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-gold btn-sm" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td><strong>{r.userName}</strong></td>
                          <td>{r.product?.name || '—'}</td>
                          <td><StarDisplay rating={r.rating} /></td>
                          <td style={{ maxWidth: 240 }}>
                            {r.comment ? `"${r.comment}"` : <span className="text-muted">No comment</span>}
                          </td>
                          <td style={{ minWidth: 140 }}>
                            <ReviewPhotoStrip images={r.images} />
                          </td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(r._id, r.userName)}
                                disabled={deleting === r._id}
                              >
                                {deleting === r._id ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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

export default Reviews;