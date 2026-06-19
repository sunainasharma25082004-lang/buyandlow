import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import API_URL from '../config/api';
import ProductCard from './ProductCard';
import './Allproducts.css';

const StarRating = ({ rating, size = 12 }) => (
  <span className="stars" style={{ fontSize: size }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
  </span>
);

const priceRanges = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 – ₹150', min: 100, max: 150 },
  { label: '₹150 – ₹200', min: 150, max: 200 },
  { label: 'Over ₹200', min: 200, max: 99999 },
];

const ratingOptions = [5, 4, 3];
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Best Rating', 'Newest'];

const Allproducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const [activePriceRange, setActivePriceRange] = useState(null);
  const [activeRating, setActiveRating] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const [saleOnly, setSaleOnly] = useState(false);
  const [pageTitle, setPageTitle] = useState('Shop All Products');
  const [pageDesc, setPageDesc] = useState('Explore our complete collection of premium handcrafted products');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const perPage = 8;

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/categories`)
      .then((res) => {
        const names = (res.data.categories || []).map((c) => c.name);
        setCategories(['All', ...names]);
      })
      .catch(() => setCategories(['All']));
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
      setCurrentPage(1);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const sort = searchParams.get('sort');
    const sale = searchParams.get('sale');
    const category = searchParams.get('category');
    const title = searchParams.get('title');
    const desc = searchParams.get('desc');

    if (sort && sortOptions.includes(sort)) setSortBy(sort);
    if (category) setActiveCategory(category);
    setSaleOnly(sale === 'true');
    if (title) setPageTitle(title);
    else setPageTitle('Shop All Products');
    if (desc) setPageDesc(desc);
    else setPageDesc('Explore our complete collection of premium handcrafted products');
    setCurrentPage(1);
  }, [searchParams, categories]);

  // Fetch products from Express backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: perPage,
          sort: sortBy,
          category: activeCategory,
        };

        if (searchKeyword) {
          params.keyword = searchKeyword;
        }

        if (activePriceRange) {
          params.minPrice = activePriceRange.min;
          params.maxPrice = activePriceRange.max;
        }

        if (activeRating) {
          params.rating = activeRating;
        }

        const res = await axios.get(`${API_URL}/products`, { params });
        let list = res.data.products || [];
        if (saleOnly) {
          list = list.filter((p) => p.badge === 'SALE');
        }
        setProductsList(list);
        setTotalPages(saleOnly ? Math.ceil(list.length / perPage) || 1 : res.data.pages);
        setTotalProducts(saleOnly ? list.length : res.data.total);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, sortBy, activePriceRange, activeRating, searchKeyword, currentPage, saleOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(searchField);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setActiveCategory('All');
    setActivePriceRange(null);
    setActiveRating(null);
    setSearchKeyword('');
    setSearchField('');
    setCurrentPage(1);
  };

  return (
    <div className="all-products-page">
      {/* Page Header */}
      <div className="ap-page-header">
        <div className="container ap-header-content">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>Home</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">All Products</span>
          </div>
          <h1 className="ap-page-title">{pageTitle}</h1>
          <p className="ap-page-desc">{pageDesc}</p>
        </div>
      </div>

      {/* Filter overlay for mobile */}
      <div
        className={`filter-overlay ${showMobileFilters ? 'show' : ''}`}
        onClick={() => setShowMobileFilters(false)}
      />

      <div className="container ap-body">
        {/* Search Bar */}
        <div className="search-bar-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search products by keyword..."
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-submit-btn btn-dark">Search</button>
            {(searchKeyword || activeCategory !== 'All' || activePriceRange || activeRating) && (
              <button type="button" onClick={handleClearFilters} className="clear-search-btn">
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Mobile category chips */}
        <div className="mobile-category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-bar">
          <button className="mobile-filter-toggle-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            ⚙ {showMobileFilters ? 'Hide Filters' : 'Filters & Sort'}
          </button>
        </div>

        <div className="ap-layout">
          {/* Sidebar */}
          <aside className={`ap-sidebar ${showMobileFilters ? 'mobile-show' : ''}`}>
            <div className="sidebar-header">
              <span>Filters</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="clear-btn" onClick={handleClearFilters}>Clear All</button>
                <button className="sidebar-close-btn" onClick={() => setShowMobileFilters(false)}>✕</button>
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-section">
              <h4 className="sidebar-title">Categories</h4>
              <ul className="sidebar-list">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      className={`sidebar-item ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => { setActiveCategory(cat); setCurrentPage(1); setShowMobileFilters(false); }}
                    >
                      <span>{cat}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="sidebar-section">
              <h4 className="sidebar-title">Price Range</h4>
              <ul className="sidebar-list">
                {priceRanges.map((r) => (
                  <li key={r.label}>
                    <button
                      className={`sidebar-item ${activePriceRange?.label === r.label ? 'active' : ''}`}
                      onClick={() => { setActivePriceRange(activePriceRange?.label === r.label ? null : r); setCurrentPage(1); }}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rating */}
            <div className="sidebar-section">
              <h4 className="sidebar-title">Rating</h4>
              <ul className="sidebar-list">
                {ratingOptions.map((r) => (
                  <li key={r}>
                    <button
                      className={`sidebar-item rating-item ${activeRating === r ? 'active' : ''}`}
                      onClick={() => { setActiveRating(activeRating === r ? null : r); setCurrentPage(1); }}
                    >
                      <span className="stars">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
                      <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>& up</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="ap-main">
            {/* Toolbar */}
            <div className="ap-toolbar">
              <p className="ap-count">
                Showing <strong>{productsList.length}</strong> of <strong>{totalProducts}</strong> products
              </p>
              <div className="toolbar-right">
                <span className="sort-label">Sort by</span>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {sortOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Loading / Error States */}
            {loading ? (
              <div className="ap-loading-container">
                <div className="spinner"></div>
                <p>Loading artisanal collection...</p>
              </div>
            ) : error ? (
              <div className="ap-error-container">
                <p>{error}</p>
                <button className="btn-dark" onClick={handleClearFilters}>Reset Filters</button>
              </div>
            ) : productsList.length === 0 ? (
              <div className="ap-empty-container">
                <p>No products found matching your filter criteria.</p>
                <button className="btn-dark" onClick={handleClearFilters}>View All Products</button>
              </div>
            ) : (
              /* Products Grid */
              <div className="ap-grid">
                {productsList.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >{p}</button>
                ))}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >›</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allproducts;