import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProducts, getCategories, createProduct, updateProduct, uploadImage } from '../api';
import AdminImage from '../components/AdminImage';
const BADGES = ['', 'SALE', 'NEW', 'HOT'];

const emptyForm = {
  name: '',
  price: '',
  oldPrice: '',
  category: '',
  subcategory: '',
  brand: 'Truemart',
  sku: '',
  stock: 10,
  rating: 4.5,
  reviews: 0,
  image: '',
  description: '',
  badge: '',
  colors: '',
  tags: '',
};

const ProductForm = () => {
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
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [customSubcategoryMode, setCustomSubcategoryMode] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const active = (res.data || []).filter((c) => c.isActive !== false);
        setCategories(active);
        if (!isEdit && active.length > 0) {
          setForm((prev) => ({ ...prev, category: prev.category || active[0].name }));
        }
      })
      .catch(() => setError('Failed to load categories. Add categories first.'))
      .finally(() => setCategoriesLoading(false));
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    getProducts()
      .then((res) => {
        const product = res.data.find((p) => p._id === id);
        if (!product) {
          setError('Product not found');
          return;
        }
        setForm({
          name: product.name || '',
          price: product.price || '',
          oldPrice: product.oldPrice || '',
          category: product.category || 'Electronics',
          subcategory: product.subcategory || '',
          brand: product.brand || '',
          sku: product.sku || '',
          stock: product.stock ?? 10,
          rating: product.rating ?? 4.5,
          reviews: product.reviews ?? 0,
          image: product.image || '',
          description: product.description || '',
          badge: product.badge || '',
          colors: (product.colors || []).join(', '),
          tags: (product.tags || []).join(', '),
        });
        setImageMode(product.image?.includes('/uploads/') ? 'upload' : 'url');
      })
      .catch(() => setError('Failed to load product. Check that the backend server is running.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const [localPreview, setLocalPreview] = useState('');

  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    // Immediately show local preview from file
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    setError('');
    setUploading(true);

    try {
      const { data } = await uploadImage(file);
      const serverUrl = data.url || data.fullUrl;
      setForm((prev) => ({ ...prev, image: serverUrl }));
      setImageMode('upload');
    } catch (err) {
      setLocalPreview('');
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.name.trim()) {
      setError('Product name is required');
      return;
    }

    setSaving(true);

    const defaultImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
    const finalImg = form.image || defaultImg;
    const finalCat = form.category || (categories.length > 0 ? categories[0].name : 'General');

    const payload = {
      name: form.name.trim(),
      price: form.price !== '' && !isNaN(Number(form.price)) ? Math.max(0, Number(form.price)) : 0,
      oldPrice: form.oldPrice && !isNaN(Number(form.oldPrice)) ? Number(form.oldPrice) : null,
      category: finalCat,
      subcategory: form.subcategory ? form.subcategory.trim() : '',
      brand: form.brand || 'Truemart',
      sku: form.sku?.trim() || undefined,
      stock: form.stock !== '' && !isNaN(Number(form.stock)) ? Number(form.stock) : 10,
      rating: form.rating !== '' && !isNaN(Number(form.rating)) ? Number(form.rating) : 4.5,
      reviews: Number(form.reviews) || 0,
      image: finalImg,
      images: [finalImg],
      description: form.description || '',
      badge: form.badge || null,
      colors: form.colors ? form.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      keyFeatures: [],
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Session expired. Please log in again.' : null) ||
        (err.response?.status === 403 ? 'Not authorized as admin' : null) ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot reach backend server. If you are on Render, wait ~30s for the free service to wake up and try again.'
          : err.message || 'Failed to save product');
      setError(errorMsg);
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading product...</div>;

  const selectedCat = categories.find(
    (c) => String(c.name).toLowerCase() === String(form.category || '').toLowerCase()
  );
  const availableSubcategories = selectedCat?.subcategories || [];

  return (
    <div className="product-form-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">Product will appear on the store immediately</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>← Back</button>
      </div>

      <div className="card">
        {error && <div className="error-msg" style={{ margin: '16px 16px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-group">
            <label>Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Premium Wireless Headphones" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Old Price (₹)</label>
              <input name="oldPrice" type="number" step="0.01" min="0" value={form.oldPrice} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => {
                  handleChange(e);
                  setCustomSubcategoryMode(false);
                }}
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading...' : 'Select category (Optional)'}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.title || c.name}</option>
                ))}
              </select>
              {!categoriesLoading && categories.length === 0 && (
                <small className="text-muted">
                  Categories empty. Product will be saved under 'General'.
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Subcategory (Optional)</label>
              {availableSubcategories.length > 0 ? (
                <div>
                  <select
                    name="subcategory"
                    value={
                      availableSubcategories.includes(form.subcategory)
                        ? form.subcategory
                        : form.subcategory
                        ? '__custom__'
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setForm((prev) => ({ ...prev, subcategory: '' }));
                        setCustomSubcategoryMode(true);
                      } else {
                        setCustomSubcategoryMode(false);
                        setForm((prev) => ({ ...prev, subcategory: e.target.value }));
                      }
                    }}
                  >
                    <option value="">Select subcategory (Optional)</option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="__custom__">+ Enter custom subcategory...</option>
                  </select>
                  {(customSubcategoryMode || (form.subcategory && !availableSubcategories.includes(form.subcategory))) && (
                    <input
                      name="subcategory"
                      value={form.subcategory}
                      onChange={handleChange}
                      placeholder="Type custom subcategory name..."
                      style={{ marginTop: '8px' }}
                      autoFocus
                    />
                  )}
                </div>
              ) : (
                <input
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  placeholder="e.g. Mobiles, Laptops, Audio (Optional)"
                />
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="Truemart" />
            </div>
            <div className="form-group">
              <label>Badge</label>
              <select name="badge" value={form.badge} onChange={handleChange}>
                {BADGES.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} placeholder="Auto-generated if empty" />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="10" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating</label>
              <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} placeholder="4.5" />
            </div>
            <div className="form-group">
              <label>Reviews Count</label>
              <input name="reviews" type="number" min="0" value={form.reviews} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          {/* Image section */}
          <div className="form-group image-upload-section">
            <label>Product Image</label>

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
                  id="product-image-upload"
                />
                <label htmlFor="product-image-upload" className="upload-label">
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
                {form.image && imageMode === 'upload' && (
                  <p className="upload-success">✓ Image uploaded successfully</p>
                )}
              </div>
            )}

            {(localPreview || form.image) && (
              <div className="image-preview-wrap">
                <AdminImage src={localPreview || form.image} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (localPreview && localPreview.startsWith('blob:')) {
                      URL.revokeObjectURL(localPreview);
                    }
                    setLocalPreview('');
                    setForm((prev) => ({ ...prev, image: '' }));
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." rows={4} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Colors (comma separated)</label>
              <input name="colors" value={form.colors} onChange={handleChange} placeholder="#1a1a1a, #C9A84C" />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="Wireless, Premium" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-gold" disabled={saving || uploading}>
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;