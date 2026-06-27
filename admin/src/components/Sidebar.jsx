import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/app-banners', label: 'App Home Banners', icon: '📱' },
  { to: '/orders', label: 'Orders & Transactions', icon: '💳' },
  { to: '/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/callbacks', label: 'Support Requests', icon: '📞' },
];

const Sidebar = ({ isOpen = false, onClose }) => {
  const { admin, logout } = useContext(AuthContext);

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <Logo size="sm" />
          <button
            type="button"
            className="sidebar-close-btn"
            aria-label="Close menu"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <a
          href={import.meta.env.VITE_STORE_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          className="nav-link"
          onClick={handleNavClick}
        >
          <span>🛍️</span>
          View Store
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">{admin?.name?.[0] || 'A'}</div>
          <div>
            <div className="admin-name">{admin?.name}</div>
            <div className="admin-email">{admin?.email}</div>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm sidebar-logout"
          onClick={() => {
            handleNavClick();
            logout();
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;