import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Logo from "./Logo";
import "./Navbar.css";

const navItems = [
  { to: "/", label: "Home", icon: "🏠", match: (path) => path === "/" },
  { to: "/allproducts", label: "Shop", icon: "🛍️", match: (path) => path === "/allproducts" },
  { to: "/allproducts?sale=true&title=Sale Items", label: "Sale", icon: "🏷️", className: "nav-item-sale" },
  { to: "/allproducts?sort=Newest&title=New Arrivals", label: "New", icon: "✨", className: "nav-item-new" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { getCartCount, getWishlistCount, setCartOpen, setAuthModalOpen } = useContext(CartContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const isActive = (item) => {
    if (item.match) return item.match(location.pathname);
    return false;
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleCartClick = () => setCartOpen(true);

  const handleProfileClick = () => {
    if (user) setProfileDropdownOpen((o) => !o);
    else setAuthModalOpen(true);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openAuthFromDrawer = () => {
    closeMobileMenu();
    setAuthModalOpen(true);
  };

  const cartCount = getCartCount();
  const wishCount = getWishlistCount();

  const renderNavItem = (item, mobile = false) => (
    <li
      key={item.label}
      className={`nav-item ${item.className || ""} ${isActive(item) ? "active" : ""}`}
      onClick={closeMobileMenu}
    >
      <Link to={item.to}>
        {mobile && <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>}
        {item.label}
      </Link>
    </li>
  );

  return (
    <nav className="navbar">
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} aria-hidden="true" />
      )}

      <aside className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-drawer-header">
          <Link to="/" className="mobile-drawer-brand" onClick={closeMobileMenu}>
            <Logo size="sm" className="mobile-drawer-logo" />
          </Link>
          <button type="button" className="mobile-drawer-close" onClick={closeMobileMenu} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="mobile-drawer-nav">
          {navItems.map((item) => renderNavItem(item, true))}
        </ul>

        <div className="mobile-drawer-section">
          <p className="mobile-drawer-label">Account</p>
          <ul className="mobile-drawer-nav">
            {user ? (
              <>
                <li className={`nav-item ${location.pathname === "/orders" ? "active" : ""}`} onClick={closeMobileMenu}>
                  <Link to="/orders">
                    <span className="nav-item-icon" aria-hidden="true">📦</span>
                    My Orders
                  </Link>
                </li>
                <li className={`nav-item ${location.pathname === "/wishlist" ? "active" : ""}`} onClick={closeMobileMenu}>
                  <Link to="/wishlist">
                    <span className="nav-item-icon" aria-hidden="true">♥</span>
                    Favourites
                    {wishCount > 0 && <span className="drawer-badge">{wishCount}</span>}
                  </Link>
                </li>
                <li className="nav-item" onClick={() => { closeMobileMenu(); handleCartClick(); }}>
                  <button type="button" className="drawer-action-btn">
                    <span className="nav-item-icon" aria-hidden="true">🛒</span>
                    Cart
                    {cartCount > 0 && <span className="drawer-badge">{cartCount}</span>}
                  </button>
                </li>
                <li className="nav-item nav-item-logout" onClick={() => { closeMobileMenu(); logout(); }}>
                  <span className="logout-span-btn">
                    <span className="nav-item-icon" aria-hidden="true">🚪</span>
                    Sign Out
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <button type="button" className="drawer-action-btn" onClick={openAuthFromDrawer}>
                    <span className="nav-item-icon" aria-hidden="true">👤</span>
                    Sign In
                  </button>
                </li>
                <li className={`nav-item ${location.pathname === "/wishlist" ? "active" : ""}`} onClick={closeMobileMenu}>
                  <Link to="/wishlist">
                    <span className="nav-item-icon" aria-hidden="true">♥</span>
                    Favourites
                  </Link>
                </li>
                <li className="nav-item" onClick={() => { closeMobileMenu(); handleCartClick(); }}>
                  <button type="button" className="drawer-action-btn">
                    <span className="nav-item-icon" aria-hidden="true">🛒</span>
                    Cart
                    {cartCount > 0 && <span className="drawer-badge">{cartCount}</span>}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </aside>

      <div className="navbar-inner">
        <div className="nav-left">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Menu"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
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

        <ul className="nav-links">
          {navItems.map((item) => renderNavItem(item))}
        </ul>

        <div className="nav-right">
          <div className="profile-menu-container" ref={profileRef}>
            <button
              type="button"
              className={`nav-icon-btn profile-btn ${user ? "logged-in" : ""}`}
              title={user ? "Account" : "Sign in"}
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
                <button type="button" className="dropdown-item-btn" onClick={() => { setProfileDropdownOpen(false); navigate("/orders"); }}>
                  📦 My Orders
                </button>
                <button type="button" className="dropdown-item-btn" onClick={() => { setProfileDropdownOpen(false); navigate("/wishlist"); }}>
                  ♥ My Favourites
                </button>
                <button type="button" className="dropdown-item-btn logout-btn" onClick={() => { setProfileDropdownOpen(false); logout(); navigate("/"); }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>

          <button type="button" className="nav-icon-btn wishlist-nav-btn" title="Favourites" onClick={() => navigate("/wishlist")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishCount > 0 && <span className="cart-badge wishlist-badge">{wishCount}</span>}
          </button>

          <button type="button" className="nav-cart-btn" title="Cart" onClick={handleCartClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="nav-cart-label">Cart</span>
            {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;