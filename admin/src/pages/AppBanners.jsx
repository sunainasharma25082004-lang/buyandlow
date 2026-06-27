import React, { useEffect, useRef, useState } from 'react';
import {
  getAppBanners,
  createAppBanner,
  updateAppBanner,
  deleteAppBanner,
  uploadImage,
} from '../api';
import AdminImage from '../components/AdminImage';
import './AppBanners.css';

const ROUTE_OPTIONS = [
  { value: '/(tabs)/categories', label: 'App — Categories tab' },
  { value: '/(tabs)/search', label: 'App — Search tab' },
  { value: '/(tabs)/orders', label: 'App — Orders tab' },
  { value: '/cart', label: 'App — Shopping Cart' },
  { value: '/wishlist', label: 'App — Wishlist' },
];

const emptyForm = {
  label: '',
  title: '',
  subtitle: '',
  image: '',
  route: '/(tabs)/categories',
  sortOrder: 0,
  isActive: true,
};

const AppBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  const fetchBanners = () => {
    setLoading(true);
    getAppBanners()
      .then((res) => {
        setBanners(res.data || []);
        setError('');
      })
      .catch(() => {
        setBanners([]);
        setError('Could not load app banners. Make sure the backend server is running.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: banners.length,
    });
    setModalError('');
    setUploadSuccess('');
    setModalOpen(true);
  };

  const openEdit = (banner) => {
    setEditingId(String(banner._id));
    setForm({
      label: banner.label || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      route: banner.route || '/(tabs)/categories',
      sortOrder: banner.sortOrder ?? 0,
      isActive: banner.isActive !== false,
    });
    setModalError('');
    setUploadSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setModalError('');
    setUploadSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please select a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image must be smaller than 5MB');
      return;
    }

    setModalError('');
    setUploadSuccess('');
    setUploading(true);

    try {
      const { data } = await uploadImage(file);
      const imagePath = data?.url || data?.fullUrl || '';
      if (!imagePath) {
        throw new Error('Upload succeeded but no image URL returned');
      }
      setForm((prev) => ({ ...prev, image: imagePath }));
      setUploadSuccess('Image uploaded! Ab "Update App Banner" dabao save karne ke liye.');
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const imageValue = form.image.trim();
    if (!imageValue) {
      setModalError('Banner image is required — paste image URL above OR upload from device');
      return;
    }

    const payload = {
      label: form.label.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image: imageValue,
      route: form.route,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateAppBanner(editingId, payload);
      } else {
        await createAppBanner(payload);
      }
      closeModal();
      fetchBanners();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete app banner "${banner.label}"?`)) return;
    setDeleting(banner._id);
    try {
      await deleteAppBanner(banner._id);
      setBanners((prev) => prev.filter((item) => item._id !== banner._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const routeLabel = (value) =>
    ROUTE_OPTIONS.find((item) => item.value === value)?.label || value;

  return (
    <div className="app-banners-page">
      <div className="page-header">
        <div>
          <div className="app-banners-title-row">
            <h1 className="page-title">App Home Banners</h1>
            <span className="app-only-badge">📱 Mobile App Only</span>
          </div>
          <p className="page-subtitle">
            Edit carousel banners on the BuyLow mobile app home screen — not the website store
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={openCreate}>
          + Add App Banner
        </button>
      </div>

      <div className="app-banners-notice">
        <span className="app-banners-notice-icon">ℹ️</span>
        <div>
          <strong>Ye banners sirf mobile app ke liye hain.</strong>
          <p>
            Changes yahan se save karoge to BuyLow app ke home screen par slider mein dikhenge.
            Website homepage par koi effect nahi hoga.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-state">Loading app banners...</div>
          ) : banners.length === 0 ? (
            <div className="empty-state">
              {error || (
                <>
                  No app banners yet.{' '}
                  <button type="button" className="link-btn" onClick={openCreate}>
                    Add your first mobile app banner
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="app-banners-grid">
              {banners.map((banner) => (
                <div key={banner._id} className={`app-banner-card ${banner.isActive ? '' : 'inactive'}`}>
                  <div className="app-banner-preview">
                    <AdminImage src={banner.image} alt={banner.label} className="app-banner-image" />
                    <div className="app-banner-overlay">
                      <span className="app-banner-chip">{banner.label}</span>
                      <h3>{banner.title?.replace(/\n/g, ' ')}</h3>
                      <p>{banner.subtitle}</p>
                    </div>
                  </div>
                  <div className="app-banner-meta">
                    <div className="app-banner-meta-row">
                      <span className="meta-label">Order</span>
                      <span>{banner.sortOrder ?? 0}</span>
                    </div>
                    <div className="app-banner-meta-row">
                      <span className="meta-label">Tap opens</span>
                      <span>{routeLabel(banner.route)}</span>
                    </div>
                    <div className="app-banner-meta-row">
                      <span className="meta-label">Status</span>
                      <span className={`status-pill ${banner.isActive ? 'active' : 'inactive'}`}>
                        {banner.isActive ? 'Live on app' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="app-banner-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(banner)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm text-danger"
                      onClick={() => handleDelete(banner)}
                      disabled={deleting === banner._id}
                    >
                      {deleting === banner._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card app-banner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingId ? 'Edit App Banner' : 'Add App Banner'}</h2>
                <p className="modal-sub">📱 Mobile app home screen carousel</p>
              </div>
              <button type="button" className="modal-close" onClick={closeModal}>×</button>
            </div>

            {modalError && <div className="error-msg">{modalError}</div>}
            {uploadSuccess && <div className="success-msg">{uploadSuccess}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Small Label *</label>
                  <input
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                    required
                    placeholder="MEGA SALE"
                  />
                  <small className="text-muted">Top tag on banner (e.g. NEW ARRIVALS)</small>
                </div>
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    name="sortOrder"
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Main Title *</label>
                <textarea
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder={'Buy More,\nPay Less!'}
                />
                <small className="text-muted">Use Enter for line break on app banner</small>
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="Quality products at unbeatable prices"
                />
              </div>

              <div className="form-group">
                <label>Shop Now button opens</label>
                <select name="route" value={form.route} onChange={handleChange}>
                  {ROUTE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="checkbox-inline">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Show on mobile app home screen
              </label>

              <div className="form-group image-upload-section">
                <label>Banner Image *</label>
                <p className="text-muted" style={{ marginBottom: 10 }}>
                  Recommended: wide image (~900×400). App par carousel mein crop hoga.
                </p>

                <label className="image-field-label">Image URL (paste link yahan)</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={(e) => {
                    handleChange(e);
                    setUploadSuccess('');
                  }}
                  placeholder="https://images.unsplash.com/...  ya  /uploads/products/..."
                />
                <small className="text-muted image-field-hint">
                  URL paste kar sakti ho — ya neeche se device se upload karo (dono kaam karte hain)
                </small>

                <div className="upload-dropzone banner-upload-zone">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="file-input-hidden"
                    id="app-banner-image-upload"
                  />
                  <label htmlFor="app-banner-image-upload" className="upload-label">
                    {uploading ? (
                      <span>Uploading image...</span>
                    ) : (
                      <>
                        <span className="upload-icon">📷</span>
                        <span>Ya yahan click karke image upload karo</span>
                        <span className="upload-hint">JPG, PNG, WEBP, GIF — max 5MB</span>
                      </>
                    )}
                  </label>
                </div>

                {form.image && (
                  <div className="image-preview-wrap banner-preview-wrap">
                    <AdminImage src={form.image} alt="Banner preview" className="banner-preview-image" />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-gold" disabled={saving || uploading}>
                  {saving ? 'Saving...' : editingId ? 'Update App Banner' : 'Add App Banner'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppBanners;