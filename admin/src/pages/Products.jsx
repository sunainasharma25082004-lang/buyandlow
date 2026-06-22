import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api';
import { formatINR } from '../utils/currency';
import { resolveMediaUrl } from '../config/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

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

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              No products yet. <Link to="/products/new" className="text-gold">Add your first product</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
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
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={resolveMediaUrl(p.image)} alt={p.name} className="product-thumb" />
                          <div>
                            <strong style={{ fontSize: '13px' }}>{p.name}</strong>
                            <div className="text-sub">{p.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gold">{p.category}</span></td>
                      <td>
                        <strong>{formatINR(p.price)}</strong>
                        {p.oldPrice && <div className="text-strike">{formatINR(p.oldPrice)}</div>}
                      </td>
                      <td>{p.stock ?? '—'}</td>
                      <td>★ {p.rating} ({p.reviews})</td>
                      <td>{p.badge ? <span className="badge badge-warning">{p.badge}</span> : '—'}</td>
                      <td>
                        <div className="actions-cell">
                          <Link to={`/products/edit/${p._id}`} className="btn btn-outline btn-sm">Edit</Link>
                          <button
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