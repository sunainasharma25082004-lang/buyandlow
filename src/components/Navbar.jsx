import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Logo from "./Logo";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { getCartCount, getWishlistCount, setCartOpen, setAuthModalOpen } = useContext(CartContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleCartClick = () => {
    setCartOpen(true);
  };

  const handleProfileClick = () => {
    if (user) {
      setProfileDropdownOpen(!profileDropdownOpen);
    } else {
      setAuthModalOpen(true);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <div className="navbar-inner">
        <div className="nav-brand-group">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            <Logo />
          </Link>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <li className="mobile-drawer-header">
            <span className="mobile-drawer-title">Menu</span>
            <button className="mobile-drawer-close" onClick={closeMobileMenu}>✕</button>
          </li>

          <li className={`nav-item ${isActive("/") ? "active" : ""}`} onClick={closeMobileMenu}>
            <Link to="/">Home</Link>
          </li>
          <li className={`nav-item ${isActive("/allproducts") ? "active" : ""}`} onClick={closeMobileMenu}>
            <Link to="/allproducts">Shop All</Link>
          </li>
          {user && (
            <li className={`nav-item mobile-only-link ${isActive("/orders") ? "active" : ""}`} onClick={closeMobileMenu}>
              <Link to="/orders">My Orders</Link>
            </li>
          )}
          {user && (
            <li className="nav-item mobile-only-link" onClick={() => { closeMobileMenu(); logout(); }}>
              <span className="logout-span-btn">Sign Out</span>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          <button className="nav-icon-btn" title="Search" onClick={() => navigate("/allproducts")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <div className="profile-menu-container">
            <button
              className={`nav-icon-btn profile-btn ${user ? "logged-in" : ""}`}
              title="Profile"
              onClick={handleProfileClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user && <span className="profile-active-dot" />}
            </button>

            {user && profileDropdownOpen && (
              <div className="profile-dropdown-card">
                <div className="dropdown-user-info">
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item-btn"
                  onClick={() => { setProfileDropdownOpen(false); navigate("/orders"); }}
                >
                  📦 My Orders
                </button>
                <button
                  className="dropdown-item-btn"
                  onClick={() => { setProfileDropdownOpen(false); navigate("/wishlist"); }}
                >
                  ♥ My Favourites
                </button>
                <button
                  className="dropdown-item-btn logout-btn"
                  onClick={() => { setProfileDropdownOpen(false); logout(); navigate("/"); }}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>

          <button
            className="nav-icon-btn wishlist-nav-btn"
            title="Favourites"
            onClick={() => navigate('/wishlist')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {getWishlistCount() > 0 && (
              <span className="cart-badge wishlist-badge">{getWishlistCount()}</span>
            )}
          </button>

          <button className="nav-icon-btn cart-btn" title="Cart" onClick={handleCartClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;