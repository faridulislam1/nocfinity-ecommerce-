# 🛍️ Nocfinity E-Commerce Platform

> **Full-Stack E-Commerce Test Project**  
> **Tech Stack:** Laravel 13 API + Sanctum + MySQL 8 + Next.js 14+ App Router (TypeScript & Tailwind CSS) + Stripe Test Mode

A production-ready e-commerce platform built strictly adhering to the project brief. Features a customer-facing storefront closely following the provided Figma design (Desktop 1440px & Mobile 390px) and a role-based Admin Panel with granular permission enforcement.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Key Security & Business Logic Highlights](#-key-security--business-logic-highlights)
3. [Pre-Seeded Accounts & Demo Credentials](#-pre-seeded-accounts--demo-credentials)
4. [Test Coupons & Stripe Test Cards](#-test-coupons--stripe-test-cards)
5. [Local Setup Guide](#-local-setup-guide)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Automated Test Suite](#-automated-test-suite)
8. [What Would Be Improved With More Time](#-what-would-be-improved-with-more-time)

---

## 🏛️ Architecture Overview

The application is structured as a **Decoupled Monorepo**:

```text
Nocfinity/
├── backend/                  # Laravel 13 Headless REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # REST Controllers (Auth, Products, Cart, Checkout, Admin)
│   │   ├── Http/Middleware/        # CheckPermission, CheckStaff, SecurityHeaders
│   │   ├── Mail/                   # OrderConfirmationMail, OrderStatusUpdated
│   │   └── Models/                 # User, Role, Permission, Product, Order, Cart, Coupon...
│   ├── database/
│   │   ├── migrations/             # All 14 MySQL core tables
│   │   └── seeders/DatabaseSeeder  # Super admin, staff roles, 21 products, coupons, orders
│   ├── routes/api.php              # RESTful API endpoints prefixed with /api/v1/
│   └── tests/Feature/              # Automated PHPUnit tests for RBAC, Checkout & Inventory
│
├── frontend/                 # Next.js 14+ App Router with TypeScript & Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── (storefront)/       # Homepage, Products Catalog, Detail, Cart, Checkout, Orders
│   │   │   └── admin/              # Role-protected Admin Dashboard, Products, Orders, Matrix...
│   │   ├── components/             # Navbar, Footer, ProductCard, CartDrawer...
│   │   ├── context/                # CartContext, AuthContext, AdminAuthContext
│   │   └── lib/                    # API client wrapper, TypeScript types
│   └── next.config.ts              # Security headers & remote image patterns
└── README.md
```

- **Headless Backend**: Laravel serves strictly as a JSON API (no Blade templates).
- **Client App**: Next.js App Router consumes Laravel API via REST endpoints with Sanctum token authentication.

---

## 🔒 Key Security & Business Logic Highlights

### 1. Authoritative Backend Pricing & Calculation (Section 3.6)
- **Zero Frontend Trust**: Product prices, line totals, discounts, taxes, and shipping fees submitted from the browser are completely ignored during preview and checkout.
- The backend queries the database directly for active prices, checks validity of coupon codes, applies 8% sales tax, and dynamically adds free shipping for orders over $100.

### 2. Inventory Concurrency & Overselling Prevention (Section 3.4)
- **Pessimistic Row Locking**: During checkout confirmation, product rows are locked using:
  ```php
  Product::whereIn('id', $productIds)->lockForUpdate()->get();
  ```
- **Stock Validation**: Inside `DB::transaction()`, stock availability is re-verified under lock. If stock changed between cart addition and payment, the transaction rolls back with a clear error:
  `"Stock changed! Product '{name}' only has {stock} unit(s) remaining."`
- **Stock Decrementing**: Stock is decremented **only after payment is confirmed**.
- **Stock Restoration on Cancellation**: If an order status changes to `cancelled`, inventory stock is automatically incremented back to the product database.

### 3. Role-Based Access Control (RBAC) & Permission Matrix (Section 3.2)
- Proper relational RBAC system (`roles`, `permissions`, `role_user`, `permission_role`).
- **Granular Permissions**: Protected at the route level via `CheckPermission:permission.slug` middleware (e.g. `products.create`, `orders.update_status`, `roles.manage`).
- **Super Admin Protection**: The `super-admin` role is flagged with `is_system = true` and cannot be edited or deleted by anyone. Super Admin automatically bypasses permission checks.
- **Dynamic UI Element Hiding**: Admin panel sidebar links and action buttons (Create Product, Edit Matrix, Update Status) are dynamically hidden based on the staff member's effective permissions.
- **Visual Matrix UI**: An interactive matrix page at `/admin/roles` allows assigning/revoking granular permissions to custom roles with one click.

### 4. IDOR Protection (Section 3.6)
- Customer order endpoints verify that `order.user_id === auth()->id()`. Attempts by customers to access orders belonging to other users return `403 Forbidden`.

### 5. Authentication Rate Limiting & Security (Section 3.1 & 3.6)
- Login routes are throttled to **5 failed attempts per minute** via Laravel's `RateLimiter`.
- Returns generic error message `"Invalid credentials provided."` to prevent user enumeration attacks.
- Strong password enforcement: Minimum 8 characters with mixed case and numbers.
- Sensitive fields (`password`, `remember_token`, `two_factor_secret`) are permanently hidden from serialization.
- HTTP security headers injected: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`.

---

## 👥 Pre-Seeded Accounts & Demo Credentials

All accounts use password: **`Password123!`**

| Email | Role / Guard | Access Level / Permissions |
| :--- | :--- | :--- |
| **`superadmin@nocfinity.com`** | **Super Admin** | Unrestricted access across all modules; system locked |
| **`admin@nocfinity.com`** | **Admin** | Catalog, Orders, Coupons, Customers & Reports |
| **`product@nocfinity.com`** | **Product Manager** | Product catalog CRUD, Categories & Inventory |
| **`order@nocfinity.com`** | **Order Manager** | Customer orders view & status lifecycle updates |
| **`support@nocfinity.com`** | **Support Staff** | Read-only inspection of orders, products & customers |
| **`customer@nocfinity.com`** | **Customer** | Customer storefront shopping & order tracking |

---

## 🏷️ Test Coupons & Stripe Test Cards

### Promotional Coupons (Seeded)
- `WELCOME10`: **10% Off** (Minimum order $50)
- `SAVE20`: **$20 Off** (Minimum order $100)
- `FLASH50`: **50% Off** (Minimum order $200)
- `EXPIRED30`: **30% Off** *(Expired; demonstrating validation rejection)*

### Stripe Test Mode Card
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g. `12/28`)
- **CVC:** Any 3 digits (e.g. `123`)

---

## 🚀 Local Setup Guide

### Prerequisites
- PHP 8.2 or 8.3+
- Composer 2+
- Node.js 18+ and npm
- MySQL 8+ (running via Laragon, XAMPP, or standalone)

---

### Step 1: Database Setup
Ensure MySQL is running on `127.0.0.1:3306`. Create the database:
```sql
CREATE DATABASE nocfinity_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Step 2: Backend Setup (Laravel 13 API)
```bash
cd backend

# 1. Install dependencies
composer install

# 2. Configure .env (already configured with DB & Stripe test keys)
# Ensure DB_DATABASE=nocfinity_ecommerce, DB_USERNAME=root, DB_PASSWORD=

# 3. Run migrations and database seeder
php artisan migrate:fresh --seed

# 4. Create public storage symlink for uploaded product images
php artisan storage:link

# 5. Start the backend API server (runs on http://localhost:8000)
php artisan serve
```

---

### Step 3: Frontend Setup (Next.js 14+)
In a separate terminal:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the development server (runs on http://localhost:3000)
npm run dev
```

Visit:
- **Customer Storefront:** `http://localhost:3000`
- **Staff Admin Portal:** `http://localhost:3000/admin` (or click the "Admin" button in the navbar)

---

### Alternative: Run with Docker Compose (One Command)
If you prefer Docker, you can run the complete stack (MySQL + Laravel + Next.js) with a single command:
```bash
docker-compose up --build
```
This automatically boots:
- MySQL 8.4 on port `3306`
- Laravel 13 backend on `http://localhost:8000`
- Next.js 14 frontend on `http://localhost:3000`
- Migrates and seeds the database automatically on startup.

---

## 📡 API Endpoints Reference

All endpoints are versioned under `/api/v1/`:

### Storefront & Catalog
- `GET /api/v1/categories` — Category hierarchy tree (Parent & children)
- `GET /api/v1/products` — Catalog with search, category filter, price range, in_stock, and sorting
- `GET /api/v1/products/featured` — Homepage featured products
- `GET /api/v1/products/{slug}` — Product detail with images and related products
- `POST /api/v1/coupons/validate` — Validate coupon against subtotal

### Shopping Cart (Guest & Authenticated)
- `GET /api/v1/cart` — Retrieve cart (via `X-Cart-Session` or Bearer token)
- `POST /api/v1/cart/items` — Add item (enforces stock limits)
- `PUT /api/v1/cart/items/{id}` — Update item quantity
- `DELETE /api/v1/cart/items/{id}` — Remove item
- `POST /api/v1/auth/cart/merge` — Merge guest cart into customer account on login

### Checkout & Orders
- `POST /api/v1/checkout/preview` — Authoritative backend total calculation
- `POST /api/v1/checkout/payment-intent` — Stripe test PaymentIntent creation
- `POST /api/v1/checkout/confirm` — DB transaction, row lock, inventory deduction, order creation
- `GET /api/v1/orders/{order_number}` — Guest or customer order status tracking

### Staff Administration (RBAC Protected)
- `POST /api/v1/admin/auth/login` — Staff login (returns token + permissions)
- `GET /api/v1/admin/dashboard` — Analytics stats, 30-day velocity chart (*`reports.view`*)
- `GET|POST|PUT|DELETE /api/v1/admin/products` — Products CRUD (*`products.*`*)
- `GET|POST|PUT|DELETE /api/v1/admin/categories` — Categories CRUD (*`categories.*`*)
- `GET|PUT /api/v1/admin/orders` — Orders management & status lifecycle (*`orders.*`*)
- `GET|POST|PUT|DELETE /api/v1/admin/coupons` — Coupons CRUD (*`coupons.*`*)
- `GET /api/v1/admin/customers` — Customer directory with order history (*`customers.view`*)
- `GET|POST|PUT|DELETE /api/v1/admin/roles` — Custom roles & permission matrix (*`roles.*`*)
- `GET|POST /api/v1/admin/staff` — Staff personnel management (*`roles.manage`*)
- `PUT /api/v1/admin/profile` — Self-service profile update & password change
- `POST /api/v1/admin/profile/toggle-2fa` — Two-factor authentication toggle

---

## 🧪 Automated Test Suite

Both automated Feature tests and Unit tests are provided in `backend/tests`:

```bash
cd backend
php artisan test
```

### 1. Unit Tests (`backend/tests/Unit`):
- **`ProductTest`**:
  - `test_effective_price_returns_discount_price_when_valid`: Verifies discounted pricing logic.
  - `test_effective_price_returns_regular_price_when_no_discount`: Verifies fallback to base price.
  - `test_effective_price_ignores_discount_if_greater_than_regular_price`: Prevents negative pricing bugs.
  - `test_effective_price_ignores_zero_or_negative_discount`: Validates boundary handling.
  - `test_in_stock_returns_true_when_stock_greater_than_zero`: Validates stock status boolean.
  - `test_in_stock_returns_false_when_stock_is_zero_or_negative`: Validates out-of-stock state.
- **`CouponTest`**:
  - `test_percentage_discount_calculation`: Verifies accurate percentage deductions.
  - `test_fixed_discount_calculation`: Verifies flat dollar discount amounts.
  - `test_fixed_discount_does_not_exceed_subtotal`: Prevents discount overflow beyond cart value.
  - `test_coupon_validation_fails_when_inactive`: Tests inactive coupon rejection.
  - `test_coupon_validation_fails_when_below_min_order_amount`: Enforces minimum cart threshold.
  - `test_coupon_validation_fails_when_expired`: Verifies date expiration enforcement.
  - `test_coupon_validation_fails_when_usage_limit_reached`: Enforces redemption cap limits.
  - `test_coupon_validation_succeeds_when_all_conditions_met`: Verifies valid coupon flow.
- **`OrderNumberGeneratorTest`**:
  - `test_order_number_matches_expected_format`: Enforces regex format `ORD-YYYY-XXXXXX`.
  - `test_order_numbers_are_unique`: Ensures collision-resistant order identifiers.
- **`UserRbacUnitTest`**:
  - `test_super_admin_has_permission_returns_true_for_any_slug`: Verifies wildcard privilege bypass.
  - `test_regular_user_without_roles_has_no_permissions`: Ensures default deny principle.
  - `test_user_with_role_has_only_assigned_permissions`: Tests granular permission evaluation.

### 2. Feature Tests (`backend/tests/Feature`):
- **`RbacMiddlewareTest`**:
  - `test_unauthenticated_request_to_admin_is_unauthorized` (401 check)
  - `test_regular_customer_cannot_access_admin_endpoints` (403 check)
  - `test_super_admin_can_access_admin_endpoints` (200 pass)
  - `test_order_manager_cannot_create_products_without_permission` (Granular permission check)
- **`CheckoutInventoryTest`**:
  - `test_checkout_rejects_out_of_stock_product` (Prevents overselling)
  - `test_stock_decrements_when_order_is_confirmed` (Stock logic verification)
  - `test_cancelling_order_restores_stock` (Stock restoration on cancellation)
- **`IdorOrderSecurityTest`**:
  - `test_customer_cannot_view_another_customers_order` (403 IDOR prevention check)
  - `test_anonymous_guest_cannot_view_registered_order_without_matching_email` (403 check)
  - `test_customer_can_view_own_order` (200 ownership verification)

---

## 🔮 What Would Be Improved With More Time

1. **Redis Queue Workers**: Move status notification emails and activity log dispatching to asynchronous background Redis queue workers (`Queue::push`).
2. **Elasticsearch / Meilisearch**: Implement faceted full-text search with instant typo-tolerance for large-scale multi-million product catalogs.
3. **Stripe Webhook Listener**: Configure `cashier` webhook handler listening for `payment_intent.succeeded` and `payment_intent.payment_failed` for asynchronous payment verification.
4. **Automated E2E Testing**: Add Playwright test coverage verifying the complete browser user journey from category browsing to Stripe checkout completion.
5. **Next.js ISR / On-Demand Revalidation**: Implement `revalidateTag('products')` on product creation or stock updates to cache public catalog pages on the edge.

---

*Authored for the E-Commerce Developer Evaluation.*

