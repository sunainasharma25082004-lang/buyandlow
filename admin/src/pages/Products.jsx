import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api';
import { formatINR } from '../utils/currency';
import AdminImage from '../components/AdminImage';

const matchesProductSearch = (product, query) => {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  const name = (product.name || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const id = String(product._id || '').toLowerCase();
  const category = (product.category || '').toLowerCase();

  return (
    name.includes(term)
    || sku.includes(term)
    || id.includes(term)
    || category.includes(term)
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => {
        setProducts([]);
        setError('Could not load products. Make sure the backend server is running on port 5000.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = useMemo(
    () => products.filter((p) => matchesProductSearch(p, search)),
    [products, search],
  );

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
          <p className="page-subtitle">{products.length} products in store</p>
        </div>
        <Link to="/products/new" className="btn btn-gold">+ Add Product</Link>
      </div>

      {!loading && products.length > 0 ? (
        <div className="search-toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search by product name, SKU or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearch('')}>
              Clear
            </button>
          ) : null}
          {search ? (
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
              No products match &quot;{search}&quot;. Try a different name, SKU or ID.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Badge</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id}>
                      <td className="td-product-main" data-label="">
                        <div className="product-cell">
                          <AdminImage src={p.image} alt={p.name} className="product-thumb" />
                          <div>
                            <strong className="product-name">{p.name}</strong>
                            <div className="text-sub">{p.sku}</div>
                            <div className="text-sub product-id-line">ID: {p._id}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Category"><span className="badge badge-gold">{p.category}</span></td>
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

export default Products;