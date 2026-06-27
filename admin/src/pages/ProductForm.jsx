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
      setError('Product image is required — add a URL or upload from your device');
      return;
    }

    if (!form.category) {
      setError('Please select a category. Create one in Categories if none exist.');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      category: form.category,
      brand: form.brand,
      sku: form.sku || undefined,
      stock: Number(form.stock),
      rating: Number(form.rating),
      reviews: Number(form.reviews),
      image: form.image,
      images: [form.image],
      description: form.description,
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
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading product...</div>;

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
              <label>Price (₹) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Old Price (₹)</label>
              <input name="oldPrice" type="number" step="0.01" min="0" value={form.oldPrice} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required disabled={categoriesLoading}>
                <option value="">{categoriesLoading ? 'Loading...' : 'Select category'}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.title || c.name}</option>
                ))}
              </select>
              {!categoriesLoading && categories.length === 0 && (
                <small className="text-danger">
                  No categories found. <Link to="/categories/new" className="text-gold">Add a category first</Link>
                </small>
              )}
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
              <label>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} placeholder="Auto-generated if empty" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} />
            </div>
          </div>

          {/* Image section */}
          <div className="form-group image-upload-section">
            <label>Product Image *</label>

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

            {form.image && (
              <div className="image-preview-wrap">
                <AdminImage src={form.image} alt="Preview" className="image-preview" />
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