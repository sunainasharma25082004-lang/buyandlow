import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Logo from './Logo';

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="admin-layout">
      <header className="mobile-topbar">
        <button
          type="button"
          className="hamburger-btn"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-topbar-brand">
          <Logo size="sm" />
          <span>Admin Panel</span>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;