import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../api';
import AdminImage from '../components/AdminImage';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {
        setCategories([]);
        setError('Could not load categories. Make sure the backend server is running on port 5000.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
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
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage shop categories shown on the store</p>
        </div>
        <Link to="/categories/new" className="btn btn-gold">+ Add Category</Link>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              {error || (
                <>
                  No categories yet.{' '}
                  <Link to="/categories/new" className="text-gold">Add your first category</Link>
                </>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Name (for products)</th>
                    <th>Order</th>
                    <th>Homepage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <AdminImage
                            src={cat.image}
                            alt={cat.name}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{cat.title || cat.name}</div>
                            {cat.description && (
                              <div className="text-sub">
                                {cat.description.slice(0, 60)}
                                {cat.description.length > 60 ? '...' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{cat.name}</td>
                      <td>{cat.sortOrder ?? 0}</td>
                      <td>{cat.showOnHome !== false ? 'Yes' : 'No'}</td>
                      <td>
                        <span className={`badge ${cat.isActive !== false ? 'badge-success' : 'badge-muted'}`}>
                          {cat.isActive !== false ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link to={`/categories/edit/${cat._id}`} className="btn btn-outline btn-sm">Edit</Link>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={deleting === cat._id}
                            onClick={() => handleDelete(cat._id, cat.title || cat.name)}
                          >
                            {deleting === cat._id ? '...' : 'Delete'}
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

export default Categories;