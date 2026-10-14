# Admin Panel Test & Validation Report — BuyLow India
**Date**: October 2026  
**Application**: BuyLow Admin Panel (`admin/`)  
**Scope**: Product Management, Category Control, Media Uploads, Order Workflows, API Sync

---

## 1. Test Execution Matrix

| Test ID | Feature Under Test | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ADM-01** | Add Product | Submit new product with name, price, stock, category, subcategory, and image | Product created in catalog, assigned SKU, and immediately visible in customer API | Product created with auto-SKU; category auto-created if new; returned 201 | **PASSED** |
| **ADM-02** | Edit Product | Update price, stock count, and description for existing product | Changes saved in database and reflected on next customer API query | Product updated in store; fallback and DB synchronized | **PASSED** |
| **ADM-03** | Product Visibility Toggle | Click Active/Hidden button in product table | `isActive` flips between `true` and `false`; hidden items filtered from customer store | One-click toggle instantly updates status; hidden items excluded from customer store | **PASSED** |
| **ADM-04** | Single Image Upload | Upload JPG/PNG from local device via file picker | Image uploaded to `/uploads/products/`, path returned, and preview shown | Upload successful; preview displays without reload | **PASSED** |
| **ADM-05** | Multiple Image Upload | Select 3 images for product gallery | Array of image paths stored in `images[]` field; first image set as primary | All 3 images stored and navigable in gallery | **PASSED** |
| **ADM-06** | Delete Product | Delete product by MongoDB ObjectId or SKU | Product removed from database and customer API without orphan records | Removed cleanly; SKU and ID tracked in deleted set; 200 OK | **PASSED** |
| **ADM-07** | Category Creation | Add new category with title, image, and comma-separated subcategories | Category saved with trimmed subcategories and displayed on storefront | Category created and added to `/api/categories` with accurate counts | **PASSED** |
| **ADM-08** | Order Status Transition | Update order from `placed` to `confirmed` / `shipped` / `delivered` | Status updated; delivery timestamp recorded on `delivered` | Status updated with validation; timestamp saved | **PASSED** |
| **ADM-09** | Order Cancellation | Cancel order with cancellation reason | Order marked cancelled; inventory stock automatically restored | Cancellation recorded; product quantities incremented back to stock | **PASSED** |
| **ADM-10** | Admin Build Validation | Run `npm run build` in `admin/` | Vite bundles production assets with zero syntax or compilation errors | Built in 3.61s; output bundle verified in `admin/dist/` | **PASSED** |

---

## 2. Admin-to-Storefront Synchronization Rules
1. **Cache Invalidation**: Customer views fetch with dynamic timestamps or query pagination, guaranteeing that an admin update to price or stock reflects upon the user's next navigation or pull-to-refresh.
2. **Stock Awareness**: Setting a product's stock to `0` automatically changes the customer card badge to "Out of Stock" and disables the Add to Cart CTA.
3. **Soft-Delete Safety**: Products flagged with `isActive: false` remain fully visible, editable, and restorable inside the Admin panel, but are strictly hidden from storefront search and category listings.
