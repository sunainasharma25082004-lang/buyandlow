import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  uploadImage,
  uploadMultipleImages,
} from '../api';
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
  images: [],
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
  const [uploadingText, setUploadingText] = useState('');
  const [imageMode, setImageMode] = useState('upload'); // default to device upload
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [previewMap, setPreviewMap] = useState({});
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [customSubcategoryMode, setCustomSubcategoryMode] = useState(false);
  const [allExistingProducts, setAllExistingProducts] = useState([]);

  useEffect(() => {
    return () => {
      Object.values(previewMap).forEach((url) => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch {}
        }
      });
    };
  }, [previewMap]);

  const getImagePreview = (url) => {
    if (!url) return '';
    return previewMap[url] || url;
  };

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

    getProducts()
      .then((res) => {
        setAllExistingProducts(res.data || []);
      })
      .catch(() => {});
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    getProducts()
      .then((res) => {
        const product = (res.data || []).find((p) => p._id === id);
        if (!product) {
          setError('Product not found');
          return;
        }

        const prodImages = Array.isArray(product.images) && product.images.length > 0
          ? product.images.filter(Boolean)
          : (product.image ? [product.image] : []);
        const mainImg = product.image || (prodImages.length > 0 ? prodImages[0] : '');

        setForm({
          name: product.name || '',
          price: product.price ?? '',
          oldPrice: product.oldPrice ?? '',
          category: product.category || 'General',
          subcategory: product.subcategory || '',
          brand: product.brand || 'Truemart',
          sku: product.sku || '',
          stock: product.stock ?? 10,
          rating: product.rating ?? 4.5,
          reviews: product.reviews ?? 0,
          image: mainImg,
          images: prodImages,
          description: product.description || '',
          badge: product.badge || '',
          colors: (product.colors || []).join(', '),
          tags: (product.tags || []).join(', '),
        });
      })
      .catch(() => setError('Failed to load product. Check that the backend server is running.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalid = files.filter((f) => !f.type.startsWith('image/'));
    if (invalid.length > 0) {
      setError('Please select valid image files (JPG, PNG, WEBP, GIF)');
      return;
    }

    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      setError('Each image must be smaller than 10MB');
      return;
    }

    setError('');
    setUploading(true);
    setUploadingText(files.length > 1 ? `Uploading ${files.length} images...` : 'Uploading image...');

    // Generate local blob previews immediately for instantaneous visual feedback
    const fileEntries = files.map((file) => ({
      file,
      blobUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    const newBlobUrls = fileEntries.map((fe) => fe.blobUrl);

    // Save blob URLs into previewMap
    setPreviewMap((prev) => {
      const next = { ...prev };
      fileEntries.forEach((fe) => {
        next[fe.blobUrl] = fe.blobUrl;
      });
      return next;
    });

    // Immediately show the new photos in the gallery
    setForm((prev) => {
      const currentList = Array.isArray(prev.images) ? prev.images : [];
      const updated = [...currentList, ...newBlobUrls];
      return {
        ...prev,
        images: updated,
        image: prev.image || updated[0],
      };
    });

    try {
      let uploadedUrls = [];
      if (files.length === 1) {
        const { data } = await uploadImage(files[0]);
        const url = data.url || data.fullUrl;
        if (url) uploadedUrls = [url];
      } else {
        const { data } = await uploadMultipleImages(files);
        uploadedUrls = data.urls || data.files?.map((f) => f.url) || [];
      }

      if (uploadedUrls.length > 0) {
        // Map the server URLs to local blobs so preview remains high-res & reliable
        setPreviewMap((prev) => {
          const next = { ...prev };
          uploadedUrls.forEach((serverUrl, idx) => {
            if (fileEntries[idx]) {
              next[serverUrl] = fileEntries[idx].blobUrl;
            }
          });
          return next;
        });

        // Swap the temporary blob URLs with the permanent server URLs
        setForm((prev) => {
          const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
          const replaced = currentList.map((item) => {
            const matchIndex = newBlobUrls.indexOf(item);
            return matchIndex !== -1 && uploadedUrls[matchIndex] ? uploadedUrls[matchIndex] : item;
          });
          const newMain = prev.image && newBlobUrls.includes(prev.image)
            ? uploadedUrls[newBlobUrls.indexOf(prev.image)] || replaced[0]
            : (prev.image || replaced[0]);

          return {
            ...prev,
            images: replaced,
            image: newMain,
          };
        });
      }
    } catch (err) {
      // Revert temporary blob URLs on failure
      setForm((prev) => ({
        ...prev,
        images: (prev.images || []).filter((u) => !newBlobUrls.includes(u)),
        image: newBlobUrls.includes(prev.image) ? (prev.images || [])[0] || '' : prev.image,
      }));
      newBlobUrls.forEach((b) => {
        try { URL.revokeObjectURL(b); } catch {}
      });
      setError(err.response?.data?.message || 'Images upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadingText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const urls = urlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length > 0) {
      setForm((prev) => {
        const currentList = Array.isArray(prev.images) ? prev.images : [];
        const updated = [...currentList, ...urls];
        return {
          ...prev,
          images: updated,
          image: prev.image || updated[0],
        };
      });
      setUrlInput('');
    }
  };

  const handleSetMainImage = (index) => {
    setForm((prev) => {
      const currentList = [...(prev.images || [])];
      if (index < 0 || index >= currentList.length) return prev;
      const [selected] = currentList.splice(index, 1);
      currentList.unshift(selected); // Put at index 0
      return {
        ...prev,
        images: currentList,
        image: selected,
      };
    });
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => {
      const currentList = [...(prev.images || [])];
      const removed = currentList.splice(index, 1)[0];
      const newMain = currentList.length > 0
        ? (prev.image === removed ? currentList[0] : prev.image)
        : '';
      return {
        ...prev,
        images: currentList,
        image: newMain,
      };
    });
  };

  const handleMoveImage = (index, direction) => {
    setForm((prev) => {
      const currentList = [...(prev.images || [])];
      const target = index + direction;
      if (target < 0 || target >= currentList.length) return prev;
      const temp = currentList[index];
      currentList[index] = currentList[target];
      currentList[target] = temp;
      return {
        ...prev,
        images: currentList,
        image: currentList[0],
      };
    });
  };

  const handleClearAllImages = () => {
    if (window.confirm('Remove all images for this product?')) {
      setForm((prev) => ({ ...prev, images: [], image: '' }));
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
    const cleanImages = (form.images || []).map((img) => String(img).trim()).filter(Boolean);
    const finalMainImg = form.image?.trim() || (cleanImages.length > 0 ? cleanImages[0] : defaultImg);
    const finalImages = cleanImages.length > 0 ? cleanImages : [finalMainImg];
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
      image: finalMainImg,
      images: finalImages,
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
          ? 'Cannot reach backend server. Please verify the backend is running.'
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
  const categorySubcategories = selectedCat?.subcategories || [];

  // Also collect any subcategories used by existing products in this category
  const productSubcategories = Array.from(
    new Set(
      allExistingProducts
        .filter((p) => String(p.category || '').toLowerCase() === String(form.category || '').toLowerCase())
        .map((p) => p.subcategory?.trim())
        .filter(Boolean)
    )
  );

  const mergedSubcategories = Array.from(
    new Set([...categorySubcategories, ...productSubcategories])
  );

  const imagesList = Array.isArray(form.images) ? form.images : (form.image ? [form.image] : []);
  const activeCoverUrl = form.image || (imagesList.length > 0 ? imagesList[0] : '');
  const activeCoverIndex = imagesList.indexOf(activeCoverUrl) !== -1 ? imagesList.indexOf(activeCoverUrl) : 0;

  return (
    <div className="product-form-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">Product and all uploaded images will appear on the store immediately</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>← Back</button>
      </div>

      <div className="card">
        {error && <div className="error-msg" style={{ margin: '16px 16px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Premium Wireless Noise-Cancelling Headphones"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Old Price (₹)</label>
              <input
                name="oldPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.oldPrice}
                onChange={handleChange}
                placeholder="Optional strike-through price"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => {
                  handleChange(e);
                  setCustomSubcategoryMode(false);
                }}
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading...' : 'Select category'}</option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
              {!categoriesLoading && categories.length === 0 && (
                <small className="text-muted">
                  Categories empty. Product will be saved under 'General'.
                </small>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Subcategory (Optional)</label>
                {form.subcategory ? (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, subcategory: '' }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d4af37',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>

              {mergedSubcategories.length > 0 ? (
                <div>
                  <select
                    name="subcategory"
                    value={
                      mergedSubcategories.includes(form.subcategory)
                        ? form.subcategory
                        : form.subcategory
                        ? '__custom__'
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomSubcategoryMode(true);
                      } else {
                        setCustomSubcategoryMode(false);
                        setForm((prev) => ({ ...prev, subcategory: e.target.value }));
                      }
                    }}
                  >
                    <option value="">Select a subcategory (Optional)</option>
                    {mergedSubcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter custom subcategory...</option>
                  </select>

                  {/* Quick suggestion chips */}
                  <div className="subcat-chips-row">
                    {mergedSubcategories.slice(0, 8).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        className={`subcat-chip-btn ${form.subcategory === sub ? 'active' : ''}`}
                        onClick={() => {
                          setCustomSubcategoryMode(false);
                          setForm((prev) => ({ ...prev, subcategory: sub }));
                        }}
                      >
                        {form.subcategory === sub ? `✓ ${sub}` : sub}
                      </button>
                    ))}
                  </div>

                  {(customSubcategoryMode || (form.subcategory && !mergedSubcategories.includes(form.subcategory))) && (
                    <input
                      name="subcategory"
                      value={form.subcategory}
                      onChange={handleChange}
                      placeholder="Type custom subcategory name..."
                      style={{ marginTop: '10px' }}
                      autoFocus
                    />
                  )}
                </div>
              ) : (
                <div>
                  <input
                    name="subcategory"
                    value={form.subcategory}
                    onChange={handleChange}
                    placeholder="e.g. Mobiles, Laptops, Headphones, Shirts (Optional)"
                  />
                  <small className="text-muted" style={{ display: 'block', marginTop: '4px', fontSize: '11px' }}>
                    Tip: Subcategory entered here will automatically be linked to this category.
                  </small>
                </div>
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
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b || 'None'}
                  </option>
                ))}
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
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={handleChange}
                placeholder="4.5"
              />
            </div>
            <div className="form-group">
              <label>Reviews Count</label>
              <input
                name="reviews"
                type="number"
                min="0"
                value={form.reviews}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          {/* Multiple Product Images Upload & Gallery Section */}
          <div className="form-group image-upload-section" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                Product Images (Multiple Upload Supported)
              </label>
              {imagesList.length > 0 && (
                <span className="multi-image-count">
                  {imagesList.length} Image{imagesList.length > 1 ? 's' : ''} Uploaded
                </span>
              )}
            </div>
            <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>
              Upload multiple photos from your device or paste URLs. The 1st photo (marked "Main Cover") will be displayed on product cards and search results.
            </p>

            <div className="image-mode-tabs">
              <button
                type="button"
                className={`mode-tab ${imageMode === 'upload' ? 'active' : ''}`}
                onClick={() => setImageMode('upload')}
              >
                📁 Upload from Device (Multiple Files)
              </button>
              <button
                type="button"
                className={`mode-tab ${imageMode === 'url' ? 'active' : ''}`}
                onClick={() => setImageMode('url')}
              >
                🔗 Add by Image URL
              </button>
            </div>

            {imageMode === 'upload' ? (
              <div className="upload-dropzone">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFilesSelect}
                  className="file-input-hidden"
                  id="product-images-upload"
                  disabled={uploading}
                />
                <label htmlFor="product-images-upload" className="upload-label">
                  {uploading ? (
                    <>
                      <div className="spinner" style={{ width: 24, height: 24 }} />
                      <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{uploadingText || 'Uploading images...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📸</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Click to select images from your computer</span>
                      <span className="upload-hint">
                        You can select multiple photos at once (JPG, PNG, WEBP, GIF — max 10MB per image)
                      </span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="Paste image URL (https://images.unsplash.com/...) and click Add"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={handleAddUrl}
                  style={{ whiteSpace: 'nowrap', padding: '0 20px' }}
                >
                  + Add URL
                </button>
              </div>
            )}

            {/* Visual Image Manager Grid */}
            {imagesList.length > 0 && (
              <div className="multi-image-container">
                {/* Dedicated Active Cover Photo Preview Showcase */}
                {activeCoverUrl && (
                  <div className="active-cover-showcase">
                    <div className="cover-showcase-badge">
                      <span className="cover-badge-title">★ Active Main Cover Photo</span>
                      <span className="cover-badge-hint">
                        This is the photo buyers see on store product cards and search results
                      </span>
                    </div>

                    <div className="cover-showcase-card">
                      <div
                        className="cover-showcase-img-wrap"
                        onClick={() => setLightboxUrl(activeCoverUrl)}
                        title="Click to inspect cover photo full size"
                      >
                        <AdminImage
                          src={getImagePreview(activeCoverUrl)}
                          alt="Main Cover Photo"
                          className="cover-showcase-img"
                        />
                        <div className="cover-hover-zoom">
                          <span>🔍 View Full Size</span>
                        </div>
                      </div>

                      <div className="cover-showcase-info">
                        <div className="cover-title-row">
                          <h4>{form.name ? `${form.name} — Cover Photo` : 'Primary Cover Photo'}</h4>
                          <span className="cover-pill">Photo #{activeCoverIndex + 1}</span>
                        </div>
                        <p className="cover-desc">
                          This image is set as the main storefront cover photo. To change which photo is the cover,
                          click <strong>"★ Set Cover"</strong> on any thumbnail in the gallery below.
                        </p>
                        <div className="cover-actions-row">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setLightboxUrl(activeCoverUrl)}
                          >
                            🔍 Inspect Full Size
                          </button>
                          {imagesList.length > 1 && (
                            <span className="cover-gallery-hint">
                              💡 {imagesList.length} total photos in gallery. First thumbnail is the primary cover.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="multi-image-header">
                  <h4>
                    <span>🖼️ Product Gallery ({imagesList.length} {imagesList.length === 1 ? 'photo' : 'photos'})</span>
                  </h4>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleClearAllImages}
                    style={{ fontSize: '11px', color: '#ff6b6b', borderColor: 'rgba(255, 107, 107, 0.4)' }}
                  >
                    Clear All Images
                  </button>
                </div>

                <div className="multi-image-grid">
                  {imagesList.map((imgUrl, index) => {
                    const isMain = index === 0 || form.image === imgUrl;
                    const previewSrc = getImagePreview(imgUrl);
                    return (
                      <div
                        key={`${imgUrl}-${index}`}
                        className={`image-tile ${isMain ? 'is-main' : ''}`}
                      >
                        {isMain ? (
                          <span className="main-image-tag">★ Main Cover</span>
                        ) : (
                          <span className="image-tile-index">#{index + 1}</span>
                        )}

                        <AdminImage
                          src={previewSrc}
                          alt={`Product ${index + 1}`}
                          className="image-tile-img"
                          onClick={() => setLightboxUrl(imgUrl)}
                        />

                        <div className="image-tile-actions">
                          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="tile-action-btn btn-zoom-img"
                              onClick={() => setLightboxUrl(imgUrl)}
                              title="Inspect Full Size"
                            >
                              🔍
                            </button>
                            {index > 0 && (
                              <button
                                type="button"
                                className="tile-action-btn"
                                onClick={() => handleMoveImage(index, -1)}
                                title="Move Left"
                              >
                                ◀
                              </button>
                            )}
                            {index < imagesList.length - 1 && (
                              <button
                                type="button"
                                className="tile-action-btn"
                                onClick={() => handleMoveImage(index, 1)}
                                title="Move Right"
                              >
                                ▶
                              </button>
                            )}
                            {!isMain && (
                              <button
                                type="button"
                                className="tile-action-btn btn-make-main"
                                onClick={() => handleSetMainImage(index)}
                                title="Set as Main Cover Photo"
                              >
                                ★ Set Cover
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            className="tile-action-btn btn-delete-img"
                            onClick={() => handleRemoveImage(index)}
                            title="Remove this photo"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lightbox / Zoom Modal */}
            {lightboxUrl && (
              <div className="image-lightbox-overlay" onClick={() => setLightboxUrl(null)}>
                <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
                  <div className="lightbox-header">
                    <div className="lightbox-title">
                      <span>🖼️ Photo Inspection</span>
                      {lightboxUrl === activeCoverUrl && (
                        <span className="lightbox-badge-main">★ Current Main Cover</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="lightbox-close-btn"
                      onClick={() => setLightboxUrl(null)}
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="lightbox-body">
                    <img
                      src={getImagePreview(lightboxUrl)}
                      alt="Product Preview Full Size"
                      className="lightbox-img"
                    />
                  </div>

                  <div className="lightbox-footer">
                    <span className="lightbox-url-info">
                      {lightboxUrl.startsWith('blob:') ? '📁 Device upload preview' : lightboxUrl}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {lightboxUrl !== activeCoverUrl && (
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          onClick={() => {
                            const idx = imagesList.indexOf(lightboxUrl);
                            if (idx !== -1) handleSetMainImage(idx);
                            setLightboxUrl(null);
                          }}
                        >
                          ★ Set as Main Cover Photo
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setLightboxUrl(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed product features, specifications, and details..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Colors (comma separated)</label>
              <input
                name="colors"
                value={form.colors}
                onChange={handleChange}
                placeholder="Black, Silver, Gold or #1a1a1a, #C9A84C"
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Wireless, Premium, Trending, Bluetooth"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-gold" disabled={saving || uploading}>
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;