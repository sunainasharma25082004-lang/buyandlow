import React, { useEffect, useState } from 'react';
import { getUsers } from '../api';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const {
    page,
    setPage,
    totalPages,
    paginatedItems: paginatedUsers,
    totalItems: userCount,
    rangeStart,
    rangeEnd,
  } = usePagination(users, 20);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} users — showing 20 per page</p>
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
              <table className="admin-table">
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
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Name"><strong>{user.name}</strong></td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Role">
                        <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td data-label="Cart">{user.cart?.length || 0}</td>
                      <td data-label="Wishlist">{user.wishlist?.length || 0}</td>
                      <td data-label="Joined">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && users.length > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalItems={userCount}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Users;