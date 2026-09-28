import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, deleteProduct } from '../api';
import { formatINR } from '../utils/currency';
import AdminImage from '../components/AdminImage';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const matchesProductSearch = (product, query, selectedCat, selectedSubcat) => {
  if (selectedCat && selectedCat !== 'All') {
    if (String(product.category || '').toLowerCase() !== selectedCat.toLowerCase()) {
      return false;
    }
  }

  if (selectedSubcat && selectedSubcat !== 'All') {
    if (String(product.subcategory || '').toLowerCase() !== selectedSubcat.toLowerCase()) {
      return false;
    }
  }

  const term = query.trim().toLowerCase();
  if (!term) return true;

  const name = (product.name || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const id = String(product._id || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const subcategory = (product.subcategory || '').toLowerCase();

  return (
    name.includes(term) ||
    sku.includes(term) ||
    id.includes(term) ||
    category.includes(term) ||
    subcategory.includes(term)
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  const fetchProducts = () => {
    setLoading(true);
    Promise.all([getProducts(), getCategories().catch(() => ({ data: [] }))])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {
        setProducts([]);
        setError('Could not load products. Make sure the backend server is running.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute available subcategories for the selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'All') {
      const allSubcats = products.map((p) => p.subcategory?.trim()).filter(Boolean);
      return Array.from(new Set(allSubcats));
    }

    const matchedCat = categories.find(
      (c) => String(c.name).toLowerCase() === selectedCategory.toLowerCase()
    );
    const catSubs = matchedCat?.subcategories || [];
    const prodSubs = products
      .filter((p) => String(p.category || '').toLowerCase() === selectedCategory.toLowerCase())
      .map((p) => p.subcategory?.trim())
      .filter(Boolean);

    return Array.from(new Set([...catSubs, ...prodSubs]));
  }, [selectedCategory, categories, products]);

  const filteredProducts = useMemo(
    () => products.filter((p) => matchesProductSearch(p, search, selectedCategory, selectedSubcategory)),
    [products, search, selectedCategory, selectedSubcategory]
  );

  const {
    page,
    setPage,
    totalPages,
    paginatedItems: paginatedProducts,
    totalItems: filteredCount,
    rangeStart,
    rangeEnd,
  } = usePagination(filteredProducts, 20, `${search}-${selectedCategory}-${selectedSubcategory}`);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
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
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products — showing 20 per page</p>
        </div>
        <Link to="/products/new" className="btn btn-gold">+ Add Product</Link>
      </div>

      {!loading && products.length > 0 ? (
        <div
          className="search-toolbar"
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <input
            type="search"
            className="search-input"
            placeholder="Search by product name, SKU or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
            style={{ flex: '1 1 240px' }}
          />

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('All');
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--surface-soft)',
              border: '1.5px solid var(--card-border)',
              color: 'var(--cream)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c.name}>
                {c.title || c.name}
              </option>
            ))}
          </select>

          {/* Subcategory filter */}
          {availableSubcategories.length > 0 && (
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--surface-soft)',
                border: '1.5px solid var(--card-border)',
                color: 'var(--cream)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Subcategories</option>
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {(search || selectedCategory !== 'All' || selectedSubcategory !== 'All') ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedSubcategory('All');
              }}
            >
              Clear Filters
            </button>
          ) : null}

          {(search || selectedCategory !== 'All' || selectedSubcategory !== 'All') ? (
            <span className="search-count">
              {filteredProducts.length} of {products.length}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              {error || (
                <>
                  No products yet. <Link to="/products/new" className="text-gold">Add your first product</Link>
                </>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              No products match your search or filter. Try clearing filters.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category & Subcategory</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Badge</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p) => {
                    const imgCount = Array.isArray(p.images) && p.images.length > 0
                      ? p.images.length
                      : (p.image ? 1 : 0);
                    return (
                      <tr key={p._id}>
                        <td className="td-product-main" data-label="">
                          <div className="product-cell">
                            <div>
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <AdminImage src={p.image} images={p.images} alt={p.name} className="product-thumb" />
                                {imgCount > 1 && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      right: '-4px',
                                      background: '#d4af37',
                                      color: '#000',
                                      fontSize: '9px',
                                      fontWeight: '700',
                                      padding: '1px 5px',
                                      borderRadius: '8px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    }}
                                    title={`${imgCount} photos uploaded`}
                                  >
                                    📷 {imgCount}
                                  </span>
                                )}
                              </div>
                              {Array.isArray(p.images) && p.images.length > 1 && (
                                <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                                  {p.images.slice(0, 4).map((extraImg, idx) => (
                                    <AdminImage
                                      key={idx}
                                      src={extraImg}
                                      alt=""
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '3px',
                                        objectFit: 'cover',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                      }}
                                    />
                                  ))}
                                  {p.images.length > 4 && (
                                    <span style={{ fontSize: '9px', color: '#d4af37', alignSelf: 'center', fontWeight: 'bold' }}>
                                      +{p.images.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <strong className="product-name">{p.name}</strong>
                              <div className="text-sub">{p.sku}</div>
                              <div className="text-sub product-id-line">ID: {p._id}</div>
                              {imgCount > 0 && (
                                <div style={{ fontSize: '11px', color: '#d4af37', marginTop: '2px' }}>
                                  {imgCount} {imgCount === 1 ? 'image' : 'images'} uploaded
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td data-label="Category & Subcategory">
                          <span className="badge badge-gold">{p.category}</span>
                          {p.subcategory ? (
                            <div style={{ marginTop: '4px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  background: 'rgba(212, 175, 55, 0.12)',
                                  border: '1px solid rgba(212, 175, 55, 0.3)',
                                  color: '#e0c068',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                }}
                              >
                                ↳ {p.subcategory}
                              </span>
                            </div>
                          ) : (
                            <div style={{ marginTop: '2px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                              No subcategory
                            </div>
                          )}
                        </td>
                        <td data-label="Price">
                          <strong>{formatINR(p.price)}</strong>
                          {p.oldPrice ? <div className="text-strike">{formatINR(p.oldPrice)}</div> : null}
                        </td>
                        <td data-label="Stock">{p.stock ?? '—'}</td>
                        <td data-label="Rating">★ {p.rating} ({p.reviews})</td>
                        <td data-label="Badge">{p.badge ? <span className="badge badge-warning">{p.badge}</span> : '—'}</td>
                        <td data-label="Actions">
                          <div className="actions-cell">
                            <Link to={`/products/edit/${p._id}`} className="btn btn-outline btn-sm">Edit</Link>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={deleting === p._id}
                              onClick={() => handleDelete(p._id, p.name)}
                            >
                              {deleting === p._id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredCount}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                label="products"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;