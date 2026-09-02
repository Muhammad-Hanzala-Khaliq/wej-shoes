# Software Requirements Document (SRD)

## Custom Footwear E-Commerce Website

**Document Status:** Updated Final Draft
**Project Type:** Custom E-Commerce Website
**Business Type:** Footwear Store
**Target Market:** Men and Women
**Primary Payment Method:** Cash on Delivery (COD)

---

# 1. Project Overview

## 1.1 Project Description

The project is a custom-built footwear e-commerce website for a single footwear business. The website will allow customers to browse, search, filter, and purchase footwear online.

The store will sell footwear for:

* Men
* Women

The initial version will not include:

* Kids products
* Bags or other non-footwear products

The website will provide a complete e-commerce experience including product browsing, product variants, search, shopping cart, guest checkout, Cash on Delivery orders, order tracking, customer accounts, and a protected administrative dashboard.

The website may use Daisy Footwear as a general functional and user-experience reference, but the new website must use its own branding, products, content, images, and identity.

---

# 2. Goals & Objectives

The main objectives of the system are:

* Build a professional and responsive footwear e-commerce website.
* Allow customers to browse Men and Women footwear.
* Provide product search and filtering.
* Allow customers to purchase products without mandatory account creation.
* Support Cash on Delivery as the initial payment method.
* Provide secure customer authentication.
* Provide separate and protected admin authentication.
* Provide a complete admin panel.
* Allow administrators to manage products and categories.
* Support product variants such as size and color.
* Manage product inventory accurately.
* Prevent invalid orders for unavailable stock.
* Provide secure order tracking.
* Build SEO-friendly public product pages.
* Ensure the application is scalable and maintainable.
* Start with cost-efficient infrastructure.
* Allow future expansion without requiring a complete system rewrite.

---

# 3. Target Users

## 3.1 Guest User

A guest user is a visitor who has not logged into an account.

Guest users can:

* Browse products.
* Search products.
* Browse Men and Women collections.
* View product details.
* Select available product variants.
* Add products to the cart.
* Maintain a guest cart.
* Place an order through guest checkout.
* Place a Cash on Delivery order.
* Track orders using Order Number and Phone Number or Email verification.

Guest users cannot:

* Access another customer's order history.
* Access the admin panel.
* Modify administrative data.

---

## 3.2 Registered User

A registered user is a customer with an account.

Registered users can:

* Browse products.
* Search products.
* Add products to the cart.
* Place orders.
* Manage their profile.
* Save addresses.
* View their order history.
* View order details.
* Track their orders.
* Log out.

---

## 3.3 Admin

An Admin manages the business operations through a protected admin panel.

Admins can:

* Securely log in through `/admin/login`.
* Manage categories.
* Manage products.
* Manage product images.
* Manage product variants.
* Manage SKUs.
* Manage inventory.
* View inventory history.
* Manage orders.
* Update order status.
* Add courier information.
* Add tracking numbers.
* Manage homepage content.
* Manage shipping rules.
* Manage store settings.
* Log out securely.

Admin functionality must be protected through server-side authorization and middleware.

---

# 4. Functional Requirements

## FR-01: Homepage

### Description

The homepage will be the primary landing page of the website.

It will display:

* Header
* Navigation
* Hero section
* Men collection
* Women collection
* Featured products
* New arrivals
* Promotional banners or content
* Footer

Homepage content should be manageable through the Admin system where applicable.

### User Story

> As a customer, I want to see featured products and collections on the homepage so that I can quickly discover products.

### Acceptance Criteria

* Homepage must be accessible without authentication.
* Homepage must be responsive.
* Men and Women collections must be clearly distinguishable.
* Featured products must display correctly.
* Product links must navigate to the correct product pages.
* Images must be optimized through Cloudinary delivery.

---

## FR-02: Product Categories

### Description

The system will organize footwear into Men and Women categories.

Categories may contain subcategories.

Example:

Men:

* Sneakers
* Loafers
* Sandals

Women:

* Heels
* Flats
* Sandals

The exact categories may be modified by the Admin.

### User Story

> As a customer, I want to browse products by category so that I can quickly find the type of footwear I need.

### Acceptance Criteria

* Categories must have a unique slug.
* Admin can create categories.
* Admin can edit categories.
* Admin can activate or deactivate categories.
* Inactive categories must not appear publicly.

---

## FR-03: Product Management

### Description

The Admin must be able to manage footwear products.

Each product will contain:

* Name
* Unique slug
* Description
* Category
* Regular price
* Sale price, when applicable
* Status
* Featured status

Product statuses:

* DRAFT
* ACTIVE
* ARCHIVED

### User Story

> As an Admin, I want to create and manage products so that the online store catalog remains accurate.

### Acceptance Criteria

* Admin can create products.
* Admin can edit products.
* Admin can archive products.
* Product slugs must be unique.
* Archived products must not be publicly purchasable.
* Draft products must not be publicly visible.
* Active products may be displayed publicly.

---

## FR-04: Product Images

### Description

Each product may have multiple images.

**Cloudinary will be the only image storage and delivery provider used by the initial system.**

The database will store image metadata and Cloudinary image URLs or public identifiers.

Each image should support:

* Image URL
* Cloudinary public ID where required
* Alt text
* Sort order
* Primary image status

### User Story

> As a customer, I want to view multiple product images so that I can understand the product before ordering.

### Acceptance Criteria

* Admin can upload multiple images.
* Images must be uploaded to Cloudinary.
* Admin can select a primary image.
* Admin can change image order.
* Product images must load correctly.
* Images must not be stored as binary files directly in PostgreSQL.
* No other image storage provider is required for the initial version.

---

## FR-05: Product Variants

### Description

A product may have multiple variants.

Variants may include:

* Color
* Size
* SKU
* Stock quantity

Example:

Product: Running Shoe

Variants:

* Black / Size 40
* Black / Size 41
* White / Size 40
* White / Size 41

### User Story

> As a customer, I want to select the correct color and size before ordering a product.

### Acceptance Criteria

* Customers must select a valid variant.
* Each SKU must be unique.
* Duplicate product/color/size combinations must be prevented.
* Out-of-stock variants must not be purchasable.
* The selected variant must be stored in the cart and order.

---

## FR-06: Inventory Management

### Description

The system will track stock at the product variant level.

Inventory information may include:

* Stock quantity
* Reserved quantity
* Available quantity

Inventory changes must be recorded.

### User Story

> As an Admin, I want to track product inventory so that customers cannot purchase unavailable products.

### Acceptance Criteria

* Stock is managed per variant.
* Stock changes must be recorded.
* Negative stock must not occur.
* Out-of-stock variants cannot be purchased.
* Checkout must validate stock server-side.

---

## FR-07: Shopping Cart

### Description

The system will support both guest carts and authenticated user carts.

Guest carts will be stored in the database using a unique session identifier.

Authenticated user carts will be associated with the user's account.

Cart functionality includes:

* Add item
* Remove item
* Update quantity
* Variant-aware items

### User Story

> As a customer, I want to add products to my cart so that I can purchase multiple products together.

### Acceptance Criteria

* Guest users can use and persist a cart.
* Guest carts are identified using a unique `session_id`.
* Registered user carts may be associated with `user_id`.
* Cart items must include the selected product variant.
* Quantity must not exceed available stock.
* Customers can remove items.
* Duplicate cart lines for the same variant must be handled consistently.

---

## FR-08: Cart Merge After Login

### Description

When a guest logs into an existing account, the system should merge compatible guest cart items with the user's existing cart.

### User Story

> As a customer, I want my guest cart to remain available after logging in.

### Acceptance Criteria

* Guest cart items are identified using `session_id`.
* Compatible guest cart items are merged into the user's cart.
* Duplicate variants are combined according to stock limits.
* Invalid or unavailable products are handled safely.
* Cart merge must not exceed available stock.

---

## FR-09: Customer Authentication

### Description

The system will provide customer authentication.

Features include:

* Signup
* Login
* Logout
* Forgot password
* Reset password

### User Story

> As a customer, I want to create an account so that I can manage my information and view my orders.

### Acceptance Criteria

* Passwords must be securely hashed.
* Login must validate credentials securely.
* Protected pages must require authentication.
* Sessions must use secure server-side mechanisms.
* Users must be able to log out.
* Password reset must use a secure token-based mechanism.
* Password reset emails must be sent through the approved email provider.

---

## FR-10: Customer Profile and Addresses

### Description

Registered users will have access to their account.

They can:

* View profile information.
* Update permitted profile information.
* Save addresses.
* Manage multiple addresses.
* Select a default address.

### User Story

> As a registered user, I want to save my addresses so that future checkout is faster.

### Acceptance Criteria

* Users can only access their own data.
* Users cannot access other users' addresses.
* A user may have multiple addresses.
* Address validation must occur server-side.

---

## FR-11: Guest Checkout

### Description

Customers must be able to place an order without creating an account.

The checkout form will collect:

* First name
* Last name
* Phone number
* Email
* City
* Area
* Full address
* Order notes

### User Story

> As a customer, I want to place an order without creating an account so that checkout is faster.

### Acceptance Criteria

* Account creation must not be mandatory.
* Required customer information must be validated.
* Order information must be stored correctly.
* Guest customers must receive an order confirmation.
* Guest order tracking must require Order Number and Phone Number or Email verification.

---

## FR-12: Cash on Delivery

### Description

The initial system will support Cash on Delivery only.

### User Story

> As a customer, I want to pay for my order when it is delivered.

### Acceptance Criteria

* COD must be the supported payment method.
* The system must not require an online payment gateway.
* Orders must record the payment method.
* Payment status must be manageable according to business rules.

---

## FR-13: Checkout Validation

### Description

Before creating an order, the server must validate:

* Products
* Variants
* Current price
* Quantity
* Stock
* Shipping fee

The client must not be treated as the authoritative source.

### User Story

> As the business owner, I want orders to be validated so that manipulated prices or invalid stock cannot create incorrect orders.

### Acceptance Criteria

* Product prices are loaded from the server.
* Stock is validated on the server.
* Shipping fee is calculated on the server.
* Order totals are calculated on the server.
* Invalid carts cannot create orders.

---

## FR-14: Duplicate Order Protection

### Description

The system must prevent accidental duplicate orders caused by double-clicking or repeated checkout requests.

### User Story

> As a customer, I want my checkout request to create only one order.

### Acceptance Criteria

* Duplicate checkout requests are handled safely.
* The same checkout submission must not unintentionally create multiple orders.
* Order creation logic must support safe concurrency.

---

## FR-15: Order Creation

### Description

After successful checkout validation, the system will create:

* Order
* Order items
* Customer information snapshot
* Address snapshot
* Product and variant snapshots
* Order totals

### User Story

> As a customer, I want to receive an order confirmation after placing my order.

### Acceptance Criteria

* Every order must have a unique order number.
* Order items must preserve historical product information.
* Later product edits must not change historical orders.
* Address information must be preserved as an order snapshot.

---

## FR-16: Order Management

### Description

The Admin can manage the complete order lifecycle.

Initial order flow:

PENDING
→ CONFIRMED
→ PROCESSING
→ SHIPPED
→ DELIVERED

Cancellation follows approved business rules.

### User Story

> As an Admin, I want to update order status so that customers and staff can track order progress.

### Acceptance Criteria

* Admin can view orders.
* Admin can view order details.
* Valid order status transitions must work.
* Invalid transitions must be blocked.
* Status history must be recorded.
* Customer-visible order information must be accurate.

---

## FR-17: Order Tracking

### Description

The system will allow customers to securely track their orders.

For guest order tracking, verification is mandatory.

The customer must provide:

* Order Number

And at least one of:

* Phone Number
* Email Address

The provided Phone Number or Email Address must match the customer information stored with the order.

### User Story

> As a customer, I want to securely track my order so that I know its current status.

### Acceptance Criteria

* Registered users can view only their own orders.
* Guest users must provide a valid Order Number.
* Guest users must also provide either the matching Phone Number or matching Email Address.
* The provided verification information must match the order.
* Guest users cannot access unrelated orders.
* Order status is displayed correctly.
* Tracking information can include courier name and tracking number.

---

## FR-18: Homepage Content Management

### Description

The Admin may manage approved homepage content.

Content may include:

* Hero content
* Promotional banners
* Titles
* Subtitles
* Button text
* Button links
* Images
* Display order
* Active status

### User Story

> As an Admin, I want to manage homepage promotional content without changing application code.

### Acceptance Criteria

* Admin can update approved homepage content.
* Inactive content is not displayed publicly.
* Content order is respected.

---

## FR-19: Shipping Rules

### Description

The system will support configurable shipping rules.

The initial system may support:

* Fixed shipping fee
* Free shipping threshold

The database structure should remain extendable for future city-based shipping rules.

### User Story

> As an Admin, I want to configure shipping rules so that delivery charges are calculated correctly.

### Acceptance Criteria

* Shipping configuration is managed centrally.
* Checkout uses server-side shipping calculations.
* Shipping values cannot be trusted from the frontend.

---

## FR-20: SEO

### Description

Public pages must be optimized for search engines.

SEO functionality includes:

* SEO-friendly URLs
* Unique slugs
* Dynamic metadata
* Product structured data
* Breadcrumb structured data
* Sitemap
* Robots file
* Canonical URLs
* Image alt text
* Search-engine-friendly Search Results handling

### User Story

> As a business owner, I want products to be discoverable through search engines.

### Acceptance Criteria

* Product pages have unique metadata.
* Category pages have appropriate metadata.
* Sitemap contains intended public pages.
* Admin and sensitive pages are not treated as public SEO pages.
* Structured data must use actual product information.
* Search Results pages must not create unnecessary duplicate indexed pages.

---

## FR-21: Admin Authentication

### Description

The system will provide a dedicated and protected authentication flow for Admin users.

The Admin login page will be available at:

`/admin/login`

Administrative routes must be protected using server-side authorization and middleware.

The system must verify both:

1. The user is authenticated.
2. The authenticated user has the `ADMIN` role.

### User Story

> As an Admin, I want to securely log in to the Admin panel so that only authorized personnel can manage business data.

### Acceptance Criteria

* Admin login page is available at `/admin/login`.
* Non-authenticated users attempting to access protected admin routes are redirected to `/admin/login`.
* Authenticated users with the `USER` role cannot access admin routes.
* Admin authorization must be validated server-side.
* Middleware must protect applicable admin routes.
* Admin sessions must use secure session handling.
* Admin logout must invalidate or safely terminate the active session.

---

# 5. Non-Functional Requirements

## 5.1 Performance

The application should:

* Load efficiently on mobile and desktop.
* Optimize product images through Cloudinary.
* Avoid unnecessary client-side JavaScript.
* Use caching appropriately for public content.
* Avoid unsafe caching for cart, checkout, account, and admin data.

---

## 5.2 Security

The application must:

* Hash passwords securely.
* Protect sessions.
* Use server-side authorization.
* Protect admin routes through middleware.
* Validate untrusted input.
* Protect environment variables.
* Never expose database credentials.
* Never trust client-side prices.
* Never trust client-side stock values.
* Never trust client-side user roles.
* Prevent unauthorized admin access.
* Require secure verification for guest order tracking.
* Use secure password reset tokens.

---

## 5.3 Scalability

The application architecture must:

* Use a modular monolith architecture initially.
* Keep business logic separated from UI components.
* Keep route handlers relatively thin.
* Support future infrastructure upgrades.
* Avoid unnecessary microservices during the initial stage.

---

## 5.4 Reliability

The system should:

* Handle invalid requests safely.
* Avoid duplicate order creation.
* Validate inventory during checkout.
* Preserve historical order information.
* Handle unexpected errors without exposing sensitive information.

---

## 5.5 Mobile Responsiveness

The application must work correctly on:

* Mobile phones
* Tablets
* Desktop devices

The customer storefront must follow a mobile-first approach.

---

## 5.6 Maintainability

The project must:

* Use TypeScript.
* Follow consistent naming conventions.
* Separate business logic from presentation logic.
* Use database migrations.
* Document architectural decisions.
* Maintain progress documentation.
* Avoid unnecessary dependencies.

---

# 6. Recommended Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Backend

* Next.js Route Handlers
* Service layer for business logic

## Architecture

* Modular Monolith

## Database

* PostgreSQL
* Neon PostgreSQL

## ORM

* Prisma

## Image Storage

* Cloudinary only

## Email Provider

One provider will be selected for transactional emails:

* Resend (recommended)
* SendGrid

The initial provider decision should be documented before implementation.

## Hosting

* Vercel

## Version Control

* GitHub

Architecture overview:

Customer / Admin
↓
Next.js Application
↓
Route Handlers
↓
Validation
↓
Business Services
↓
Prisma
↓
Neon PostgreSQL

Product Images:

Admin
↓
Cloudinary
↓
Image URL and Metadata
↓
PostgreSQL

Transactional Email:

Application
↓
Resend or SendGrid
↓
Password Reset Email

---

# 7. Database Design

## 7.1 Users

Fields:

* id
* first_name
* last_name
* email
* phone
* password_hash
* role
* status
* created_at
* updated_at

Role values:

* USER
* ADMIN

---

## 7.2 Addresses

Fields:

* id
* user_id
* label
* city
* area
* address
* notes
* is_default
* created_at
* updated_at

Relationship:

One User → Many Addresses

---

## 7.3 Categories

Fields:

* id
* name
* slug
* gender
* parent_id
* image_url
* status
* created_at
* updated_at

---

## 7.4 Products

Fields:

* id
* category_id
* name
* slug
* description
* regular_price
* sale_price
* status
* is_featured
* created_at
* updated_at

---

## 7.5 ProductImages

Fields:

* id
* product_id
* image_url
* cloudinary_public_id
* alt_text
* sort_order
* is_primary
* created_at

Relationship:

One Product → Many ProductImages

All product images must be stored and delivered through Cloudinary.

---

## 7.6 ProductVariants

Fields:

* id
* product_id
* sku
* color
* size
* stock_quantity
* reserved_quantity
* status
* created_at
* updated_at

Recommended constraints:

* SKU must be unique.
* Product/color/size combination must be unique.

---

## 7.7 InventoryHistory

Fields:

* id
* variant_id
* previous_quantity
* change_quantity
* new_quantity
* reason
* reference_type
* reference_id
* created_by
* created_at

---

## 7.8 Carts

Fields:

* id
* user_id (nullable)
* session_id
* created_at
* updated_at

### Rules

* `user_id` is nullable.
* Guest carts are identified using `session_id`.
* Authenticated user carts may be associated with `user_id`.
* `session_id` must be unique where applicable.
* The implementation must define and document cart ownership and merge rules.

---

## 7.9 CartItems

Fields:

* id
* cart_id
* variant_id
* quantity
* created_at
* updated_at

---

## 7.10 Orders

Fields:

* id
* order_number
* user_id (nullable for guest orders)
* customer_first_name
* customer_last_name
* customer_phone
* customer_email
* city
* area
* address
* notes
* subtotal
* shipping_fee
* total_amount
* payment_method
* payment_status
* order_status
* courier_name
* tracking_number
* created_at
* updated_at

---

## 7.11 OrderItems

Fields:

* id
* order_id
* product_id
* variant_id
* product_name
* sku
* color
* size
* unit_price
* quantity
* total_price

Order items must preserve historical information.

---

## 7.12 OrderStatusHistory

Fields:

* id
* order_id
* status
* notes
* changed_by
* created_at

---

## 7.13 ShippingRules

Fields:

* id
* name
* type
* amount
* free_shipping_threshold
* is_active
* created_at
* updated_at

---

## 7.14 HomepageContent

Fields:

* id
* section_type
* title
* subtitle
* image_url
* button_text
* button_url
* sort_order
* is_active

---

## 7.15 StoreSettings

Fields:

* id
* store_name
* logo_url
* support_email
* phone
* whatsapp_number
* currency
* cod_enabled
* created_at
* updated_at

---

## 7.16 PasswordResetTokens

Fields:

* id
* user_id
* token_hash
* expires_at
* used_at
* created_at

### Rules

* Raw reset tokens must not be stored in plaintext.
* Tokens must expire.
* Used tokens must not be reusable.

---

# 8. Pages and Screens

## Public Pages

### 1. Homepage

Features:

* Navigation
* Hero
* Collections
* Featured products
* New arrivals
* Promotions

---

### 2. Men Collection Page

Features:

* Men products
* Categories
* Filters
* Sorting
* Pagination

---

### 3. Women Collection Page

Features:

* Women products
* Categories
* Filters
* Sorting
* Pagination

---

### 4. Category Page

URL pattern:

`/category/[slug]`

Features:

* Category information
* Product listing
* Filters
* Sorting

---

### 5. Search Results Page

Suggested URL pattern:

`/search?q=keyword`

Features:

* Search input
* Search results
* Product listing
* Empty-state message
* Filters where applicable
* Sorting where applicable
* Pagination

---

### 6. Product Page

URL pattern:

`/product/[slug]`

Features:

* Product images
* Product information
* Price
* Color selection
* Size selection
* Stock status
* Add to Cart
* Buy Now

---

### 7. Cart Page

Features:

* Cart items
* Selected variants
* Quantity controls
* Remove item
* Order totals

---

### 8. Checkout Page

Features:

* Customer information
* Delivery address
* Order notes
* COD payment
* Order summary
* Server-validated totals

---

### 9. Order Confirmation Page

Features:

* Order number
* Order summary
* Order status
* Tracking information where available

---

### 10. Order Tracking Page

Features:

* Order number input
* Phone Number or Email verification
* Order status
* Tracking details

---

### 11. Privacy Policy Page

Features:

* Customer data usage information
* Account information policy
* Order information policy
* Contact information

Content should be manageable according to the final legal/content management requirements.

---

### 12. Return Policy Page

Features:

* Return eligibility
* Return process
* Return conditions
* Refund or replacement policy according to business requirements

---

## Authentication Pages

### 13. Signup Page

### 14. Customer Login Page

### 15. Forgot Password Page

### 16. Reset Password Page

### 17. Admin Login Page

URL:

`/admin/login`

---

## Customer Account Pages

### 18. Account Dashboard

### 19. Profile

### 20. Addresses

### 21. My Orders

### 22. Order Details

---

## Admin Pages

### 23. Admin Dashboard

### 24. Category Management

### 25. Product Management

### 26. Product Create/Edit

### 27. Product Image Management

### 28. Variant and Inventory Management

### 29. Inventory History

### 30. Order Management

### 31. Order Details

### 32. Homepage Content Management

### 33. Shipping Rules

### 34. Store Settings

---

# 9. Integrations

## 9.1 Payment

Initial version:

* Cash on Delivery only

No online payment gateway is required.

---

## 9.2 Image Storage

Cloudinary will be used exclusively for:

* Product image uploads
* Product image storage
* Image delivery
* Image optimization

No Cloudflare image storage integration is included in the initial system.

---

## 9.3 Database

Neon PostgreSQL will be used for:

* Application data
* Product data
* Customer data
* Carts
* Orders
* Inventory

---

## 9.4 Hosting

Vercel will host the Next.js application.

---

## 9.5 Email Provider

A transactional email provider is required because the system supports password reset functionality.

The selected provider will be either:

* Resend (recommended)
* SendGrid

Initial required email use case:

* Password reset emails

The email provider must support secure transactional email delivery.

---

## 9.6 SMS

SMS integration is not included in the initial scope.

---

## 9.7 Maps

Maps integration is not included in the initial scope.

Customers will manually enter:

* City
* Area
* Address

---

## 9.8 Courier Integration

A direct courier API integration is not included initially.

The Admin can manually enter:

* Courier name
* Tracking number

---

# 10. Out of Scope

The following features are explicitly outside the initial project scope:

* Kids product category
* Bags
* Online credit/debit card payments
* Stripe integration
* PayPal integration
* Multiple payment gateways
* Courier API integration
* SMS notifications
* Maps integration
* Multi-vendor marketplace functionality
* Seller dashboards
* Microservices architecture
* Kubernetes
* Separate Express backend
* MongoDB
* Redis
* Elasticsearch

These features must not be implemented unless explicitly approved in a future scope update.

---

# 11. Assumptions & Constraints

## Assumptions

* The business sells Men and Women footwear.
* The business operates as a single store.
* Cash on Delivery is the only initial payment method.
* Customers may place orders without creating accounts.
* Guest carts are stored using `session_id`.
* Product variants include size and color.
* The Admin manages products and orders.
* Product images are stored and delivered through Cloudinary only.
* Password reset requires transactional email delivery.

---

## Constraints

* The initial system should use cost-efficient infrastructure.
* Free tiers may be used during the early stage where appropriate.
* Neon PostgreSQL will be used as the initial database provider.
* Vercel will be used as the initial hosting provider.
* Only approved technologies may be introduced.
* Database schema changes must use migrations.
* Secrets must never be committed to GitHub.
* Client-side code must not be trusted for pricing, inventory, authorization, or final order calculations.
* The email provider must be selected and documented before password reset implementation.

---

# 12. Future Enhancements

The following features may be added in future versions:

## Payments

* Online payment gateway
* Credit/debit card payments
* Mobile wallet payments

## Notifications

* Order confirmation emails
* Order status emails
* SMS notifications
* WhatsApp notifications

## Courier

* Courier API integration
* Automatic shipment tracking
* Automatic shipment creation

## Customer Experience

* Product reviews
* Product ratings
* Wishlist
* Recently viewed products
* Product recommendations
* Advanced search

## Marketing

* Discount coupons
* Promotional campaigns
* Referral system
* Loyalty points
* Abandoned cart recovery

## Inventory

* Low-stock alerts
* Automated stock reports
* Advanced inventory analytics

## Analytics

* Sales dashboard
* Product performance
* Customer analytics
* Conversion tracking

## Scalability

* CDN and caching enhancements
* Background jobs
* Queue system
* Redis when justified by actual requirements
* Separate services when actual scale requires them

---

# Final Architecture Summary

The initial production architecture will follow:

Next.js + TypeScript
↓
Customer Storefront + Admin Panel
↓
Next.js Route Handlers
↓
Validation
↓
Service Layer
↓
Prisma ORM
↓
Neon PostgreSQL

Product images:

Admin
↓
Cloudinary
↓
Image URLs and Metadata
↓
PostgreSQL

Transactional email:

Application
↓
Resend or SendGrid
↓
Password Reset Email

Deployment:

GitHub
↓
Vercel
↓
Custom Domain

---

# Development Governance

Before implementing a feature, developers or AI coding agents must:

1. Read the project documentation.
2. Read this Software Requirements Document.
3. Check the current development phase.
4. Inspect the relevant existing code.
5. Create an implementation plan.
6. Stay within the approved scope.
7. Avoid introducing unapproved technologies.
8. Test the implementation.
9. Update project progress documentation.
10. Record completed work.
11. Avoid marking work complete without verification.

This Software Requirements Document is the primary functional reference for the project.

Any requirement that conflicts with this document must be identified and clarified before implementation.
