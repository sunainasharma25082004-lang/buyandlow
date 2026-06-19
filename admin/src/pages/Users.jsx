import React, { useEffect, useState } from 'react';
import { getUsers } from '../api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Cart Items</th>
                    <th>Wishlist</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.cart?.length || 0}</td>
                      <td>{user.wishlist?.length || 0}</td>
                      <td>{formatDate(user.createdAt)}</td>
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

export default Users;