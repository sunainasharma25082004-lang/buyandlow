# Architecture Audit Report — BuyLow India
**Date**: October 2026  
**Auditor**: Principal Full-Stack & Mobile Systems Architect  
**Project**: BuyLow India (Web, Android, iOS, Admin, Backend, DB)

---

## 1. Executive Summary
BuyLow India is a unified omni-channel e-commerce ecosystem consisting of:
1. **React Web Storefront** (`client/`): Vite + React 18 Single Page Application with dynamic routing, responsive CSS design system, and Razorpay payment integration.
2. **React Native Mobile App** (`BuyLow-app/buylow/`): Expo Router v3 (Expo SDK 52 / React Native 0.76+) with native Hermes bytecode generation for Android and iOS targets.
3. **Admin Dashboard** (`admin/`): React 18 + Vite management panel for catalog management, stock control, category hierarchy, order updates, customer reviews, and app banners.
4. **Backend Server** (`server/`): Node.js + Express (ESM) REST API service supporting dual operating modes: MongoDB Mongoose database connection and comprehensive offline in-memory fallback.
5. **Media Storage** (`server/uploads/products/`): Local and CDN-synced product imagery accessible via `/uploads/` and `/api/uploads/`.

---

## 2. Component Topology & Mapping

| Component | Technology | Directory | Primary Ports / Endpoints | Production Target |
| :--- | :--- | :--- | :--- | :--- |
| **Storefront Web** | React 18, Vite 5, React Router v6 | `client/` | Dev: 5173 / Prod: Static dist | Vercel / Render / Single-service |
| **Admin Panel** | React 18, Vite 5, React Router v6 | `admin/` | Dev: 5174 / Prod: Static dist | Render / Static Host |
| **Backend API** | Node.js 18+, Express ESM, Mongoose | `server/` | Dev: 5000 / Prod: 443 | Render (`buylowindia.com`) |
| **Mobile App** | Expo Router v3, React Native, Hermes | `BuyLow-app/buylow/` | Metro: 8081 | Google Play (AAB) & TestFlight/App Store (IPA) |
| **Database** | MongoDB 6+ / In-Memory Mock Store | MongoDB Atlas / Local | Default: 27017 | MongoDB Atlas Cluster |

---

## 3. Data Flow & Communication Lifecycle

```
[ Customer (Web / Android / iOS) ]
               │
               ▼
   [ Express API Gateway :5000 ]
     ├── Helmet Security & CORS Resolver
     ├── Rate Limiting Middleware
     ├── Express Static Uploads (/uploads)
     └── Route Handlers
           ├── /api/products   ──> Pagination, Filtering, Search, Category Alias Resolver
           ├── /api/categories ──> Hierarchy, Image, Active Filter, Product Count
           ├── /api/orders     ──> Server-side Price Verification, Razorpay HMAC SHA256
           ├── /api/admin      ──> Protected RBAC (Add, Edit, Delete, Stock, Status)
           └── /api/auth       ──> JWT Token Issuance, Google OAuth, Profile Management
               │
               ▼
   [ Persistence Layer ]
     ├── Primary: MongoDB Atlas (Product, Category, Order, User collections)
     └── Fallback: In-memory store (server/data/products.js, server/data/categories.js)
```

---

## 4. Key Architectural Flaws Identified During Audit

1. **Category Mismatch & Disappearing Catalog**:
   - Live production products were divided into `crockry` (56 products), `Electronics` (93 products), and `electronic` (2 products).
   - The web storefront homepage was hardcoding mock categories (`Grocery`, `Fashion`, `Home`, `Beauty`), causing customers to browse empty categories where real products never displayed.
   - Products assigned to `electronic` were hidden when searching for `Kitchen Appliance` due to strict string equality.
2. **Artificial API Throttling & Pagination Caps**:
   - `clampPagination` was enforcing an aggressive `maxLimit = 50` and default `limit = 8`.
   - Web pagination was restricted to numbered page navigation showing only 8 items at a time, hiding 95% of catalog products.
3. **Dummy Data Contamination**:
   - Storefront components (`FlashDeals.jsx`, `NewArrivals.jsx`) imported mock items from `client/src/data/products.js`, substituting fake items ("Premium Wireless Headphones Pro X") when API responses took time to resolve.
4. **Mobile Navigation & Search Pagination Gaps**:
   - Mobile `category/[name].tsx` and `search.tsx` previously lacked continuous infinite scroll pagination, loading only an initial batch of 20 items and discarding subsequent items.
5. **App Store Guideline Gaps**:
   - Missing mandatory iOS Account Deletion (Guideline 5.1.1(v)) and Sign in with Apple option alongside Google Sign-In (Guideline 4.8).
   - Missing `LSApplicationQueriesSchemes` for native Indian UPI apps in `app.json`.

---

## 5. Architectural Remediation Implemented
- Dynamic category integration across Web (`CategoryStoryBar`, `ShopCategories`) and Mobile (`Categories.tsx`).
- Robust Category Alias Normalization (`normalizeCategoryAliases`) matching variations (`crockry`/`crocry`/`crockery`, `Electronics`/`electronic`, `Kitchen Appliance`/`electronic`).
- Unified Infinite Scrolling on Web (`IntersectionObserver` sentinel) and Mobile (`FlatList onEndReached`).
- Elimination of all mock/dummy fallback data from customer-facing views.
- Upgraded `clampPagination` to support up to 100 items per request with default batch of 20.
- Synchronized local offline fallback dataset with all 151 live production products and images.
- Full compliance with Google Play Store & Apple App Store submission standards.
