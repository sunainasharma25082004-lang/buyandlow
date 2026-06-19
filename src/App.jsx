import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import AnnouncementBar from "./components/AnnouncementBar";
import Footer from "./components/Footer";

import HeroSection from "./components/HeroSection";
import ShopCategories from "./components/ShopCategories";
import FeaturedProducts from "./components/FeaturedProducts";
import SummerCollection from "./components/SummerCollection";
import NewArrivals from "./components/NewArrivals";
import CustomerReviews from "./components/CustomerReviews";
import Newsletter from "./components/Newsletter";

import Allproducts from "./components/Allproducts";
import ProductDetail from "./components/ProductDetail";
import Checkout from "./components/Checkout";
import OrderHistory from "./components/OrderHistory";
import InfoPage from "./components/InfoPage";
import Wishlist from "./components/Wishlist";

import CartOverlay from "./components/CartOverlay";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/ScrollToTop";

import "./index.css";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ShopCategories />
      <FeaturedProducts />
      <SummerCollection />
      <NewArrivals />
      <CustomerReviews />
      <Newsletter />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="app">

            <header className="site-header">
              <AnnouncementBar />
              <Navbar />
            </header>

            <main className="site-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/allproducts" element={<Allproducts />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/page/:slug" element={<InfoPage />} />
            </Routes>
            </main>

            <Footer />

            {/* Global Overlays */}
            <CartOverlay />
            <AuthModal />

          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;