import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, uploadImage } from '../api';
import { resolveMediaUrl } from '../config/api';

const emptyForm = {
  name: '',
  title: '',
  image: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  showOnHome: true,
};

const CategoryForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getCategories().then((res) => {
      const category = res.data.find((c) => c._id === id);
      if (!category) {
        setError('Category not found');
        setLoading(false);
        return;
      }
      setForm({
        name: category.name || '',
        title: category.title || '',
        image: category.image || '',
        description: category.description || '',
        sortOrder: category.sortOrder ?? 0,
        isActive: category.isActive !== false,
        showOnHome: category.showOnHome !== false,
      });
      setImageMode(category.image?.includes('/uploads/') ? 'upload' : 'url');
      setLoading(false);
    });
  }, [id, isEdit]);

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
      setError('Please select a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const { data } = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: data.url }));
      setImageMode('upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.image) {
      setError('Category image is required — add a URL or upload from your device');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      title: form.title.trim() || form.name.trim(),
      image: form.image,
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
      showOnHome: form.showOnHome,
    };

    try {
      if (isEdit) {
        await updateCategory(id, payload);
      } else {
        await createCategory(payload);
      }
      navigate('/categories');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading category...</div>;

  return (
    <div className="product-form-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Category' : 'Add New Category'}</h1>
          <p className="page-subtitle">Categories appear on the store homepage and product filters</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/categories')}>← Back</button>
      </div>

      <div className="card">
        {error && <div className="error-msg" style={{ margin: '16px 16px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Category Name (for products) *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Electronics"
              />
              <small className="text-muted">Used when assigning products to this category</small>
            </div>
            <div className="form-group">
              <label>Display Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Electronics & Gadgets"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Short description for this category"
            />
          </div>

          <div className="form-row">
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
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Active (visible on store)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="showOnHome" checked={form.showOnHome} onChange={handleChange} />
                Show on homepage categories section
              </label>
            </div>
          </div>

          <div className="form-group image-upload-section">
            <label>Category Image *</label>

            <div className="image-mode-tabs">
              <button
                type="button"
                className={`mode-tab ${imageMode === 'url' ? 'active' : ''}`}
                onClick={() => setImageMode('url')}
              >
                🔗 Image URL
              </button>
              <button
                type="button"
                className={`mode-tab ${imageMode === 'upload' ? 'active' : ''}`}
                onClick={() => setImageMode('upload')}
              >
                📁 Upload from Device
              </button>
            </div>

            {imageMode === 'url' ? (
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
              />
            ) : (
              <div className="upload-dropzone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="file-input-hidden"
                  id="category-image-upload"
                />
                <label htmlFor="category-image-upload" className="upload-label">
                  {uploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <span className="upload-icon">📷</span>
                      <span>Click to choose image from your computer</span>
                      <span className="upload-hint">JPG, PNG, WEBP, GIF — max 5MB</span>
                    </>
                  )}
                </label>
              </div>
            )}

            {form.image && (
              <div className="image-preview-wrap">
                <img src={resolveMediaUrl(form.image)} alt="Preview" className="image-preview" />
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

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-gold" disabled={saving || uploading}>
              {saving ? 'Saving...' : isEdit ? 'Update Category' : 'Add Category'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/categories')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;