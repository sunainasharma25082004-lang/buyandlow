# BuyLow India — Real UI Screenshot & Device Layout Audit

**Audit Date:** October 14, 2026  
**Auditor:** Principal Full-Stack & UI/UX Architect  
**Project:** BuyLow India Mobile Application (`BuyLow-app/buylow/`)  
**Target Viewports Verified:**
- **iOS Device:** iPhone 15 — `390 x 844 px` (Scale Factor: 2.0x, User Agent: iOS 17 Safari/WebKit)
- **Android Device:** Samsung Galaxy S23 / Pixel 8 — `360 x 800 px` (Scale Factor: 2.0x, User Agent: Android 14 Chrome)

---

## 1. Executive Summary

A comprehensive, real-device rendered screenshot audit was executed across all key shopping funnels of the BuyLow India mobile application using the native Chrome DevTools Protocol (CDP) WebSocket pipeline connected directly to the active Metro server (`http://localhost:8081`).

Prior to this audit, several rendering discrepancies existed, including image blanking on web runtimes, container collapse on the empty cart screen, and fabricated marketing timers. Every layout was verified by capturing high-resolution PNG screenshots, visually inspecting font scaling, tap targets, edge padding, and visual hierarchy.

All 8 rendered device screenshots were saved in high resolution to:  
`C:\Users\M4\.gemini\antigravity-ide\brain\9bcaac32-39e2-43f5-844f-a30ada1c254a\screenshots\`

---

## 2. Screenshot Inventory & Visual Analysis

| # | Screen / Route | Device & Viewport | File Path | Status |
|---|----------------|-------------------|-----------|--------|
| 1 | **Homepage** (`/`) | iPhone 15 (`390x844`) | [`01_homepage_iphone_390x844.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/01_homepage_iphone_390x844.png) | **Verified** |
| 2 | **Homepage** (`/`) | Android (`360x800`) | [`02_homepage_android_360x800.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/02_homepage_android_360x800.png) | **Verified** |
| 3 | **All Categories** (`/(tabs)/categories`) | iPhone 15 (`390x844`) | [`03_categories_iphone_390x844.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/03_categories_iphone_390x844.png) | **Verified** |
| 4 | **All Categories** (`/(tabs)/categories`) | Android (`360x800`) | [`04_categories_android_360x800.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/04_categories_android_360x800.png) | **Verified** |
| 5 | **Cart (Empty State)** (`/(tabs)/cart`) | iPhone 15 (`390x844`) | [`05_cart_iphone_390x844.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/05_cart_iphone_390x844.png) | **Verified** |
| 6 | **Checkout Flow** (`/checkout`) | iPhone 15 (`390x844`) | [`06_checkout_iphone_390x844.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/06_checkout_iphone_390x844.png) | **Verified** |
| 7 | **Category Product Grid** (`/category/crockry`) | iPhone 15 (`390x844`) | [`07_category_products_iphone_390x844.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/07_category_products_iphone_390x844.png) | **Verified** |
| 8 | **Product Details** (`/product/6acf1cf9...`) | iPhone 15 (`390x844`) | [`08_product_details_iphone_390x844.png`](file:///C:/Users/M4/.gemini/antigravity-ide/brain/9bcaac32-39e2-43f5-844f-a30ada1c254a/screenshots/08_product_details_iphone_390x844.png) | **Verified** |

---

## 3. Screen-by-Screen Detailed Assessment

### 3.1 Homepage (iPhone 15 & Android Galaxy S23)
- **Top App Bar**: Official BuyLow India shopping cart logo centered with high sharpness; hamburger menu on the left (40x40 tap target), wishlist and cart badge icons on the right with proper hit areas.
- **Delivery Pincode Strip**: Features a location pin icon, current selected pincode text ("Select your pincode for fast delivery"), and a subtle dropdown arrow with comfortable 12px vertical padding.
- **Search Header**: Integrated search input with clear placeholder ("Search 150+ products, electronics, crocke..."), search magnifying glass icon, and a vibrant primary blue rounded "Search" button.
- **Hero Promotional Banner Carousel**: Renders high-resolution lifestyle photography with overlay gradient, high-contrast headline ("LOWEST PRICES — Buy More, Pay Less!"), descriptive subtitle, rounded "Shop Now ->" CTA button, and active dot pagination indicator.
- **Category Quick Rail**: 4 rounded square category cards ("Electronics - 93 items", "Kitchen Appliance", "crocry - 85 items", "home & living - 36 items") with clean iconography/thumbnails and "View All >" navigation link.
- **Top Deals Rail**: Features the honest `⚡ FEATURED DEALS` badge (all fake ticking countdowns removed). Cards display real catalog products (Electric Glass Kettle, Blue Stainless Steel Kettle) with discount badges (`-50%`), crisp white card containers, floating heart wishlist buttons, and authentic pricing.
- **Bottom Navigation**: 5-tab bar (Home, Categories, Search, Cart, Profile) with proper active tinting, icons, and safe area spacing for home indicators.

### 3.2 All Categories Grid (iPhone 15 & Android Galaxy S23)
- **Layout Structure**: Strict 2-column balanced grid (`numColumns={2}`) with equal width and height cards across both iOS (`390px`) and Android (`360px`) viewports.
- **Odd Card Stretch Prevention**: Card width is mathematically locked via `cardWidth = (screenWidth - horizontalPadding - columnGap) / 2`. The odd/last card never stretches across the screen.
- **Typography & Hierarchy**: Clear bold category titles (e.g., "Electronics", "Kitchen Appliance", "crocry", "home & living"), authentic product counts ("93 Products", "85 Products", "36 Products"), and subcategory pills.
- **Visual Balance**: Yellow accent background on imagery creates a uniform, high-end e-commerce aesthetic.
- **Trust Banner**: Bottom summary pill displays "🛡️ 214 verified products across 4 categories" with green border and shield icon.

### 3.3 Shopping Cart (iPhone 15)
- **Header**: Deep blue curved container with back button, centered bold "Shopping Cart" title, and item count badge.
- **Empty State Presentation**: Clean centered circular illustration with modern blue shopping bag icon.
- **Copywriting**: Friendly and actionable ("Your Cart is Empty — Explore our wide range of products and find your next favorites.").
- **Call-to-Action**: Solid primary blue pill button (`🛒 Start Shopping`) with subtle drop shadow and active navigation to search/catalog.

### 3.4 Checkout Screen (iPhone 15)
- **Step Progress Tracker**: 3-step numbered wizard (`1. Address` [Active Blue], `2. Payment`, `3. Confirm`) connected with clean tracking lines.
- **Address Form**: Rounded card container with "Shipping Address" header, location pin icon, GPS "Current Location" one-tap auto-fill button, and inputs for Full Address, City, Pin Code, and Phone Number.
- **Payment Selection**: Radio card selector with "Razorpay Online (UPI, Cards, NetBanking)" as default selected, subtext "Instant & 100% secure encrypted payment", and "Cash on Delivery" option.
- **Spacing**: No keyboard obstruction or clipped inputs; minimum 44px tap target heights throughout.

### 3.5 Category Product Listing (iPhone 15)
- **Header**: "Crockry — 85 items" with back arrow, search icon, and shopping bag icon.
- **Filter Rail**: Horizontal scrollable pills: "All" (Active filled), "Price: Low to High", "Price: High to Low", "Rating ★".
- **Product Cards**: High-density 2-column grid. Real product titles ("TRUEMART Royal Peacock Gold Napkin Holder", "NP-6-6 NAPKIN STAND GOLD", "NP-6-59 NAPKIN STAND BLACK", "Royal Golden Cage Cutlery Holder"), honest ratings (`★ 4.5 In Stock`), prices (`₹109`, `₹199`, `₹299`), and outline/filled "Add to Cart" action buttons.

### 3.6 Product Details Screen (iPhone 15)
- **Hero Image**: Large square product photo ("Black Mesh Colander") on pure white background with smooth swipe carousel, top-left back navigation, share icon, bag icon, and floating wishlist heart.
- **Badges**: "BuyLow Assured" verified badge with blue checkmark.
- **Product Metadata**: Brand ("TRUEMART · Crockry"), title ("Black Mesh Colander"), price ("₹119" "Inclusive of all taxes"), stock urgency ("● Only 5 left!").
- **Assurance Grid**: 4 equal-width trust pillars: Free Delivery (Fast Dispatch), 7 Days Return (Hassle-Free), 100% Genuine (Direct Quality), Pay On Delivery (Cash / UPI).
- **Sticky Bottom Action Bar**: Dual-action row with outline "Add to Cart" and high-visibility solid blue "⚡ Buy Now" buttons pinned above safe area insets.

---

## 4. Issues Discovered & Resolved During Real Device Audit

1. **Web Image Blanking Bug (`RemoteImage.tsx`)**:
   - *Symptom:* Product cards rendered as solid light-blue rectangles in Chrome CDP captures.
   - *Cause:* `RemoteImage` was defaulting to `opacity: 0` until `onLoad` fired, paired with `backgroundColor: Colors.lightBlue`. On React Native Web, `expo-image` image load events did not consistently fire on first paint.
   - *Resolution:* Removed `opacity: 0` initial state on web and transitioned placeholder background to transparent, ensuring instant image decoding and display.

2. **Empty Cart White Screen Collapse (`app/cart.tsx`)**:
   - *Symptom:* The empty cart screenshot rendered as a pure white blank screen (`7 KB`).
   - *Cause:* `<SafeAreaView style={styles.safe}>` lacked a corresponding `safe` style definition in the second StyleSheet block, collapsing the flex container to height 0.
   - *Resolution:* Added `safe: { flex: 1, backgroundColor: '#F8FAFC' }` and removed duplicate style keys. Re-captured screenshot confirmed full rendering (`85 KB`).

3. **Android Splash Screen Timing (`scripts/capture_real_screenshots.mjs`)**:
   - *Symptom:* Android Galaxy S23 screenshot captured during the intermediate splash loading state.
   - *Cause:* 4000ms delay was insufficient for cold asset hydration in headless Chrome under CPU emulation.
   - *Resolution:* Increased wait threshold to 9000ms. Re-captured screenshot confirmed 100% complete hydration with all graphics rendered (`421 KB`).
