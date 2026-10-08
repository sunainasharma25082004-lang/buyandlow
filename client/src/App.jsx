import React from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import AnnouncementBar from "./components/AnnouncementBar";
import CategoryStoryBar from "./components/CategoryStoryBar";
import HeroSection from "./components/HeroSection";
import BankOffersBanner from "./components/BankOffersBanner";
import ShopCategories from "./components/ShopCategories";
import FlashDeals from "./components/FlashDeals";
import FeaturedProducts from "./components/FeaturedProducts";
import PromoSlider from "./components/PromoSlider";
import BudgetStore from "./components/BudgetStore";
import PromoBanners from "./components/PromoBanners";
import NewArrivals from "./components/NewArrivals";
import BrandsShowcase from "./components/BrandsShowcase";
import WhyChooseUs from "./components/WhyChooseUs";
import CustomerReviews from "./components/CustomerReviews";
import FaqSection from "./components/FaqSection";
import AppBanner from "./components/AppBanner";
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
      <AnnouncementBar />
      <CategoryStoryBar />
      <HeroSection />
      <BankOffersBanner />
      <ShopCategories />
      <FlashDeals />
      <FeaturedProducts />
      <PromoSlider />
      <BudgetStore />
      <PromoBanners />
      <NewArrivals />
      <BrandsShowcase />
      <WhyChooseUs />
      <CustomerReviews />
      <FaqSection />
      <AppBanner />
      <Newsletter />
    </>
  );
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

function App() {
  const app = (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="app">

            <header className="site-header">
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
              <Route path="/privacy-policy" element={<InfoPage slugOverride="privacy-policy" />} />
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

  if (!googleClientId) return app;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {app}
    </GoogleOAuthProvider>
  );
}

export default App;