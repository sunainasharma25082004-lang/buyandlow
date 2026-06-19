# Truemart — Premium E-Commerce Website

A pixel-perfect React clone of the Truemart premium e-commerce UI.

## Tech Stack
- React 18
- Vite
- CSS Modules (per-component CSS files)
- Google Fonts (Playfair Display + Poppins)

## Project Structure

```
truemart/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css                    ← Global variables & base styles
    └── components/
        ├── AnnouncementBar.jsx/css  ← Top promo bar with slider
        ├── Navbar.jsx/css           ← Sticky dark brown navbar
        ├── HeroSection.jsx/css      ← Hero banner + trust badges
        ├── ShopCategories.jsx/css   ← 6-card category grid with filters
        ├── FeaturedProducts.jsx/css ← 4-column product grid with tabs
        ├── SummerCollection.jsx/css ← Collection banners (3 panels)
        ├── NewArrivals.jsx/css      ← List-style new arrivals
        ├── CustomerReviews.jsx/css  ← 3-column review cards
        ├── Newsletter.jsx/css       ← Email subscription section
        └── Footer.jsx/css           ← 4-column footer
```

## Color Palette (exact match)
- Dark Brown: `#2C1A0E`
- Mid Brown: `#4A2C17`  
- Gold Accent: `#C9A84C`
- Cream BG: `#FDF6E9`
- Cream Light: `#F5ECD7`
- Dark Green (card): `#2D4A2D`

## Setup & Run

```bash
npm install
npm run dev
```

Then open: http://localhost:5173