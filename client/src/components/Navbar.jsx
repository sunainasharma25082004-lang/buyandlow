import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Logo from "./Logo";
import "./Navbar.css";

const navItems = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/allproducts", label: "Shop All", icon: "🛍️" },
  { to: "/allproducts?category=Grocery", label: "Grocery", icon: "🥦" },
  { to: "/allproducts?category=Electronics", label: "Electronics", icon: "📱" },
  { to: "/allproducts?category=Fashion", label: "Fashion", icon: "👕" },
  { to: "/allproducts?category=Home", label: "Home", icon: "🪴" },
  { to: "/allproducts?category=Beauty", label: "Beauty", icon: "💄" },
  { to: "/allproducts?sale=true&title=Sale Items", label: "Deals & Offers", icon: "🏷️" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { getCartCount, getWishlistCount, setCartOpen, setAuthModalOpen } = useContext(CartContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCartClick = () => setCartOpen(true);

  const handleProfileClick = () => {
    if (user) {
      setProfileDropdownOpen((o) => !o);
    } else {
      setAuthModalOpen(true);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openAuthFromDrawer = () => {
    closeMobileMenu();
    setAuthModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/allproducts?search=${encodeURIComponent(q)}&title=${encodeURIComponent(`Search: ${q}`)}`);
    } else {
      navigate('/allproducts');
    }
  };

  const cartCount = getCartCount();
  const wishCount = getWishlistCount();

  return (
    <nav className="navbar">
      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} aria-hidden="true" />
      )}

      {/* Drawer */}
      <aside className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-drawer-header">
          <Link to="/" className="mobile-drawer-brand" onClick={closeMobileMenu}>
            <Logo size="sm" className="mobile-drawer-logo" />
          </Link>
          <button type="button" className="mobile-drawer-close" onClick={closeMobileMenu} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-search">
          <form onSubmit={(e) => { handleSearchSubmit(e); closeMobileMenu(); }}>
            <div className="drawer-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <ul className="mobile-drawer-nav">
          {navItems.map((item) => (
            <li key={item.label} className="nav-item" onClick={closeMobileMenu}>
              <Link to={item.to}>
                <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mobile-drawer-section">
          <p className="mobile-drawer-label">Account & Services</p>
          <ul className="mobile-drawer-nav">
            {user ? (
              <>
                <li className="nav-item" onClick={closeMobileMenu}>
                  <Link to="/orders">
                    <span className="nav-item-icon" aria-hidden="true">📦</span>
                    My Orders
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMobileMenu}>
                  <Link to="/wishlist">
                    <span className="nav-item-icon" aria-hidden="true">♥</span>
                    Wishlist
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
                    Sign In / Sign Up
                  </button>
                </li>
                <li className="nav-item" onClick={closeMobileMenu}>
                  <Link to="/wishlist">
                    <span className="nav-item-icon" aria-hidden="true">♥</span>
                    Wishlist
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

      {/* Main Navbar Bar */}
      <div className="navbar-inner">
        {/* Left: Hamburger & Logo */}
        <div className="nav-left">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Menu"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.3" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            <Logo />
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="nav-center">
          <form className="nav-search-form" onSubmit={handleSearchSubmit}>
            <svg className="nav-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </form>
        </div>

        {/* Right: Account, Wishlist, Red Cart Button */}
        <div className="nav-right">
          {/* Account */}
          <div className="profile-menu-container" ref={profileRef}>
            <button
              type="button"
              className="nav-action-btn nav-account-btn"
              title={user ? "My Account" : "Sign in"}
              onClick={handleProfileClick}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="nav-action-text">{user ? (user.name?.split(' ')[0] || "Account") : "Account"}</span>
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
                  ♥ Wishlist
                </button>
                <button type="button" className="dropdown-item-btn logout-btn" onClick={() => { setProfileDropdownOpen(false); logout(); navigate("/"); }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            className="nav-action-btn nav-wishlist-btn"
            title="Wishlist"
            onClick={() => navigate("/wishlist")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="nav-action-text">Wishlist</span>
            {wishCount > 0 && <span className="wishlist-badge-count">{wishCount}</span>}
          </button>

          {/* Red Cart Pill Button */}
          <button
            type="button"
            className="nav-cart-red-btn"
            title="Shopping Cart"
            onClick={handleCartClick}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="nav-cart-red-text">Cart</span>
            {cartCount > 0 && <span className="nav-cart-counter-bubble">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;