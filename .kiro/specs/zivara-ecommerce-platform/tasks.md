# Implementation Plan: Zivara eCommerce Platform

## Overview

This implementation plan breaks down the Zivara eCommerce platform into sequential, actionable tasks. The platform is built with Next.js 14+ (App Router), TypeScript, PostgreSQL, and Drizzle ORM. Each task builds on previous work, with checkpoints to ensure quality and allow for questions.

The implementation follows a layered approach:
1. Foundation (database, auth, core utilities)
2. Core features (products, cart, orders)
3. User-facing features (reviews, profile, search)
4. Admin features (dashboard, management interfaces)
5. Polish (email, responsive design, performance)

## Tasks

- [x] 1. Set up project foundation and database schema
  - [x] 1.1 Configure database connection and Drizzle ORM
    - Set up PostgreSQL connection in `src/db/index.ts`
    - Configure Drizzle ORM with connection pooling
    - Create environment variable configuration for database credentials
    - _Requirements: 31.1, 16.3_
  
  - [x] 1.2 Define complete database schema with Drizzle
    - Create all table definitions in `src/db/schema.ts` (users, products, categories, cart_items, orders, order_items, reviews, product_images, inventory, user_addresses, price_history, sessions, audit_logs, order_status_history)
    - Define all foreign key relationships and indexes
    - Set up Drizzle relations for type-safe queries
    - _Requirements: 31.1-31.10, 16.3_
  
  - [x] 1.3 Create database migration system
    - Set up Drizzle migration configuration
    - Generate initial migration for all tables
    - Create migration scripts for up/down operations
    - _Requirements: 32.1-32.7_
  
  - [x]* 1.4 Write property tests for schema validation
    - **Property: All foreign key relationships maintain referential integrity**
    - **Validates: Requirements 16.3, 31.10**

- [x] 2. Implement authentication and authorization system
  - [x] 2.1 Set up NextAuth.js with credentials provider
    - Configure NextAuth in `src/app/api/auth/[...nextauth]/route.ts`
    - Implement JWT session strategy with 24-hour expiration
    - Create password hashing utilities using bcrypt
    - _Requirements: 1.1-1.7, 19.2_
  
  - [x] 2.2 Create authentication helper functions
    - Implement `requireAuth()` and `requireAdmin()` in `src/lib/auth.ts`
    - Create session validation utilities
    - Add role-based access control helpers
    - _Requirements: 1.2, 1.3, 19.2, 19.3_
  
  - [x] 2.3 Implement user registration and login
    - Create registration server action with validation
    - Create login server action with error handling
    - Implement password reset request functionality
    - _Requirements: 1.1-1.5_
  
  - [x] 2.4 Set up Next.js middleware for route protection
    - Create middleware in `src/middleware.ts` to protect admin routes
    - Implement redirect logic for unauthorized access
    - Add session validation on protected routes
    - _Requirements: 9.2, 9.3, 19.3_
  
  - [x]* 2.5 Write unit tests for authentication flows
    - Test successful registration and login
    - Test invalid credentials handling
    - Test session expiration
    - _Requirements: 1.1-1.7_

- [x] 3. Checkpoint - Verify database and auth setup
  - Ensure migrations run successfully
  - Test user registration and login flows
  - Verify admin route protection works
  - Ask the user if questions arise

- [x] 4. Build core product catalog system
  - [x] 4.1 Create product and category data models
    - Define TypeScript types in `src/types/index.ts`
    - Create Zod validation schemas in `src/features/products/schemas.ts`
    - Set up product query functions in `src/features/products/queries.ts`
    - _Requirements: 2.1, 2.6, 2.7, 3.1_
  
  - [x] 4.2 Implement product CRUD operations
    - Create server actions for product creation, update, and deletion
    - Implement soft delete (mark as inactive) for products
    - Add validation for required fields and price format
    - Add audit logging for product changes
    - _Requirements: 2.1-2.7, 20.2-20.4_
  
  - [x] 4.3 Implement category management
    - Create server actions for category CRUD operations
    - Implement hierarchical category support (max 3 levels)
    - Add category validation and unique name enforcement
    - Handle product reassignment when categories are deleted
    - _Requirements: 3.1-3.5_
  
  - [x] 4.4 Build product image management
    - Create image upload functionality with cloud storage integration
    - Implement image validation (format, size limits)
    - Generate thumbnail versions for list views
    - Set primary image logic
    - _Requirements: 13.1-13.7, 2.4_
  
  - [x]* 4.5 Write property tests for product validation
    - **Property: Product prices are always positive decimals with max 2 decimal places**
    - **Validates: Requirements 2.6**
  
  - [x]* 4.6 Write property tests for category hierarchy
    - **Property: Category hierarchy never exceeds 3 levels**
    - **Validates: Requirements 3.2**

- [x] 5. Implement inventory management system
  - [x] 5.1 Create inventory tracking functionality
    - Implement inventory quantity updates in `src/features/inventory/actions.ts`
    - Add inventory validation (non-negative integers)
    - Create low stock threshold alerts
    - _Requirements: 10.1, 10.6_
  
  - [x] 5.2 Implement inventory checks during cart and checkout
    - Add inventory validation when adding to cart
    - Prevent out-of-stock products from being added to cart
    - Validate inventory availability during checkout
    - _Requirements: 10.3, 10.4, 10.7_
  
  - [x] 5.3 Handle inventory updates on order operations
    - Decrease inventory on successful checkout
    - Restore inventory on order cancellation
    - Implement transaction-based inventory updates
    - _Requirements: 10.2, 10.5, 16.4_
  
  - [x]* 5.4 Write property tests for inventory operations
    - **Property: Inventory quantities are never negative**
    - **Validates: Requirements 10.6**

- [x] 6. Build shopping cart functionality
  - [x] 6.1 Implement cart data layer and queries
    - Create cart queries in `src/features/cart/queries.ts`
    - Implement cart total calculation logic
    - Add cart item validation
    - _Requirements: 5.5, 22.1_
  
  - [x] 6.2 Create cart server actions
    - Implement add to cart with quantity validation (max 99 per product)
    - Implement update cart item quantity
    - Implement remove from cart
    - Implement clear cart functionality
    - _Requirements: 5.1-5.3, 5.7_
  
  - [x] 6.3 Implement cart persistence logic
    - Add database persistence for authenticated users
    - Implement local storage persistence for guest users
    - Create cart merge logic when guest users log in
    - Handle cart cleanup (remove items older than 30 days)
    - _Requirements: 5.4, 5.8, 22.1-22.7_
  
  - [x] 6.4 Handle cart updates when products change
    - Remove deleted products from all carts
    - Mark unavailable products in cart view
    - Lock prices when items are added to cart (24-hour honor period)
    - _Requirements: 5.6, 14.3, 14.4, 22.6_
  
  - [x]* 6.5 Write unit tests for cart operations
    - Test add, update, remove operations
    - Test cart total calculations
    - Test cart merge logic
    - _Requirements: 5.1-5.8_

- [x] 7. Checkpoint - Verify product and cart functionality
  - Test product creation and management
  - Test category hierarchy
  - Test cart operations for both authenticated and guest users
  - Verify inventory checks work correctly
  - Ask the user if questions arise

- [x] 8. Implement checkout and order creation
  - [x] 8.1 Create checkout validation logic
    - Validate all cart items are still available
    - Validate inventory quantities are sufficient
    - Validate shipping address has all required fields
    - _Requirements: 6.1, 6.4, 10.7_
  
  - [x] 8.2 Integrate Stripe payment processing
    - Set up Stripe SDK in `src/lib/payment.ts`
    - Create payment intent creation logic
    - Implement payment confirmation handling
    - Add payment timeout handling (30 seconds)
    - Store only last 4 digits of card numbers
    - _Requirements: 30.1-30.7_
  
  - [x] 8.3 Implement order creation server action
    - Create order with all cart items in a database transaction
    - Generate unique order confirmation number
    - Clear cart after successful order creation
    - Handle checkout failures with descriptive errors
    - _Requirements: 6.2, 6.3, 6.5, 6.6, 16.4, 16.5_
  
  - [x] 8.4 Add order status tracking system
    - Create order status history table entries
    - Implement status update functionality
    - Add status change validation (e.g., can only cancel pending orders)
    - _Requirements: 7.2, 7.3, 7.6, 23.3_
  
  - [x]* 8.5 Write property tests for checkout transactions
    - **Property: Checkout operations are atomic - either all succeed or all fail**
    - **Validates: Requirements 16.4, 16.5**
  
  - [x]* 8.6 Write unit tests for order creation
    - Test successful order creation
    - Test checkout failure scenarios
    - Test inventory deduction
    - _Requirements: 6.1-6.7_

- [x] 9. Build order management features
  - [x] 9.1 Create order query functions
    - Implement get orders by user
    - Implement get order by ID with full details
    - Implement order search and filtering for admins
    - Add pagination support
    - _Requirements: 7.1, 7.5, 12.1-12.5_
  
  - [x] 9.2 Implement order status updates
    - Create admin action to update order status
    - Add status change logging with admin identifier
    - Implement order cancellation logic with inventory restoration
    - _Requirements: 7.3, 7.6, 7.7, 21.4, 21.5_
  
  - [x] 9.3 Build order tracking functionality
    - Create guest-accessible order tracking page
    - Display order status timeline
    - Show estimated delivery date
    - Display carrier and tracking number when available
    - _Requirements: 23.1-23.7_
  
  - [x]* 9.4 Write unit tests for order operations
    - Test order status updates
    - Test order cancellation with inventory restoration
    - Test order filtering and search
    - _Requirements: 7.1-7.7, 12.1-12.5_

- [x] 10. Implement product reviews and ratings
  - [x] 10.1 Create review submission functionality
    - Implement review creation server action
    - Validate customer purchased the product before allowing review
    - Enforce one review per customer per product
    - Validate rating is 1-5 and comment is 10-2000 characters
    - _Requirements: 8.1-8.3, 8.8, 25.1-25.4_
  
  - [x] 10.2 Implement review display and sorting
    - Create review query functions with pagination (10 per page)
    - Implement sorting by most recent, highest rating, lowest rating
    - Display reviewer name, date, and helpful count
    - _Requirements: 8.4, 24.1-24.7_
  
  - [x] 10.3 Add review rating calculations
    - Calculate and update product average rating on review submission
    - Recalculate average rating on review deletion
    - Update review count on products table
    - _Requirements: 8.5, 8.7_
  
  - [x] 10.4 Implement review editing and deletion
    - Allow customers to edit their own reviews (within 30 days)
    - Allow customers to delete their own reviews
    - Update modification timestamp on edits
    - _Requirements: 8.6, 25.6, 25.7_
  
  - [x] 10.5 Add helpful review marking
    - Implement mark review as helpful functionality
    - Track helpful count per review
    - _Requirements: 24.5, 24.6_
  
  - [x]* 10.6 Write property tests for rating calculations
    - **Property: Average rating is always between 1 and 5 when reviews exist**
    - **Validates: Requirements 8.5**
  
  - [x]* 10.7 Write unit tests for review operations
    - Test review submission validation
    - Test average rating calculations
    - Test review editing restrictions
    - _Requirements: 8.1-8.8_

- [x] 11. Checkpoint - Verify order and review systems
  - Test complete checkout flow
  - Test order status updates and tracking
  - Test review submission and display
  - Verify rating calculations are correct
  - Ask the user if questions arise

- [x] 12. Build product search and filtering
  - [x] 12.1 Implement product search functionality
    - Create search query function with text matching in name and description
    - Implement relevance ranking (prioritize name matches)
    - Add partial word matching support
    - Filter out common stop words
    - Optimize search queries with database indexes
    - _Requirements: 4.1, 29.1-29.4_
  
  - [x] 12.2 Implement product filtering
    - Add filter by category (including subcategories)
    - Add filter by price range
    - Add filter by minimum rating
    - Support multiple simultaneous filters
    - _Requirements: 4.2, 4.4_
  
  - [x] 12.3 Implement product sorting
    - Add sort by price (ascending/descending)
    - Add sort by rating
    - Add sort by newest first
    - _Requirements: 4.3_
  
  - [x] 12.4 Add search optimization features
    - Implement search result highlighting
    - Add search suggestions based on popular searches
    - Log search queries for analytics
    - Ensure search returns results within 500ms for 100k products
    - _Requirements: 4.5, 4.6, 29.5-29.7, 17.6_
  
  - [x]* 12.5 Write unit tests for search and filtering
    - Test search relevance ranking
    - Test filter combinations
    - Test sorting options
    - _Requirements: 4.1-4.6_

- [x] 13. Implement user profile management
  - [x] 13.1 Create profile update functionality
    - Implement profile update server action
    - Add email format validation
    - Send verification email on email change
    - _Requirements: 11.1-11.3, 11.7_
  
  - [x] 13.2 Implement shipping address management
    - Create add/update/delete address server actions
    - Enforce maximum of 5 addresses per user
    - Implement default address selection
    - _Requirements: 11.4-11.6_
  
  - [x]* 13.3 Write unit tests for profile operations
    - Test profile updates
    - Test address management
    - Test email validation
    - _Requirements: 11.1-11.7_

- [x] 14. Build price management system
  - [x] 14.1 Implement price update functionality
    - Create price update server action with timestamp
    - Store price changes in price history table
    - _Requirements: 14.1, 14.2_
  
  - [x] 14.2 Implement discount pricing
    - Add discount price with start/end dates
    - Validate discount price is less than original price
    - Display both original and discounted prices when active
    - _Requirements: 14.5-14.7_
  
  - [x]* 14.3 Write property tests for price validation
    - **Property: Discount prices are always less than original prices**
    - **Validates: Requirements 14.7**

- [x] 15. Implement email notification system
  - [x] 15.1 Set up email service integration
    - Configure email service (Resend or similar) in `src/lib/email.ts`
    - Create email templates with Teal branding
    - Implement email retry logic (up to 3 attempts)
    - _Requirements: 28.6, 28.7_
  
  - [x] 15.2 Create email notification functions
    - Implement welcome email on registration
    - Implement order confirmation email
    - Implement shipping notification email
    - Implement delivery confirmation email
    - Include order number and tracking link in order emails
    - _Requirements: 28.1-28.5, 6.7, 7.4_
  
  - [x]* 15.3 Write unit tests for email notifications
    - Test email sending on various triggers
    - Test email retry logic
    - Test email template rendering
    - _Requirements: 28.1-28.7_

- [x] 16. Build admin dashboard
  - [x] 16.1 Create dashboard statistics queries
    - Implement queries for total orders, revenue, active products
    - Calculate revenue for current day, week, and month
    - Query recent orders with status and customer info
    - _Requirements: 9.1, 9.4, 9.6_
  
  - [x] 16.2 Build dashboard UI page
    - Create admin dashboard page at `/admin/dashboard`
    - Display summary statistics cards
    - Show recent orders table
    - Add navigation to management sections
    - _Requirements: 9.1, 9.4, 9.5_
  
  - [x]* 16.3 Write unit tests for dashboard queries
    - Test revenue calculations
    - Test statistics aggregations
    - _Requirements: 9.1, 9.4, 9.6_

- [x] 17. Build admin product management interface
  - [x] 17.1 Create product list page for admins
    - Build paginated product list at `/admin/products`
    - Add search by name or SKU
    - Display product status and key information
    - _Requirements: 20.1, 20.7_
  
  - [x] 17.2 Create product creation and editing forms
    - Build product creation form with all required fields
    - Build product editing form with pre-populated values
    - Add inline validation error display
    - Implement image upload interface
    - _Requirements: 20.2-20.5_
  
  - [x] 17.3 Add bulk product operations
    - Implement bulk status updates
    - Implement bulk category assignment
    - _Requirements: 20.6_
  
  - [x]* 17.4 Write unit tests for admin product interface
    - Test form validation
    - Test bulk operations
    - _Requirements: 20.1-20.7_

- [x] 18. Build admin order management interface
  - [x] 18.1 Create order list page for admins
    - Build paginated order list at `/admin/orders`
    - Add filters for status, date range, and customer
    - Display order statistics (total revenue, average order value)
    - _Requirements: 21.1, 21.2, 21.7_
  
  - [x] 18.2 Create order detail view for admins
    - Display complete order details including items and customer info
    - Add status update dropdown
    - Show status change history with admin identifiers
    - _Requirements: 21.3-21.5_
  
  - [x] 18.3 Implement order export functionality
    - Create CSV export function for orders
    - Include all relevant order data in export
    - _Requirements: 21.6_
  
  - [x]* 18.4 Write unit tests for admin order interface
    - Test order filtering
    - Test status updates
    - Test CSV export
    - _Requirements: 21.1-21.7_

- [x] 19. Build admin user management interface
  - [x] 19.1 Create user list page for admins
    - Build paginated user list at `/admin/users`
    - Add search by email or name
    - Display user registration date and status
    - _Requirements: 26.1, 26.2_
  
  - [x] 19.2 Create user detail view and management actions
    - Display user details including order history
    - Implement user account deactivation
    - Implement password reset functionality
    - Log all admin actions on user accounts
    - _Requirements: 26.3-26.7_
  
  - [x]* 19.3 Write unit tests for admin user management
    - Test user search
    - Test account deactivation
    - Test audit logging
    - _Requirements: 26.1-26.7_

- [x] 20. Checkpoint - Verify admin features
  - Test admin dashboard displays correct statistics
  - Test product management interface
  - Test order management interface
  - Test user management interface
  - Ask the user if questions arise

- [x] 21. Implement customer-facing UI pages
  - [x] 21.1 Build homepage
    - Create homepage at `/` with featured products
    - Add category navigation
    - Implement Teal branding throughout
    - _Requirements: 17.1, 27.1_
  
  - [x] 21.2 Build product listing page
    - Create product listing at `/products` with grid layout
    - Add pagination (24 items per page)
    - Integrate search and filter components
    - Implement lazy loading for images
    - _Requirements: 17.3, 17.7, 4.1-4.6_
  
  - [x] 21.3 Build product detail page
    - Create product detail page at `/products/[id]`
    - Display product image gallery
    - Show product information, price, and inventory status
    - Add "Add to Cart" functionality
    - Display reviews and ratings
    - _Requirements: 17.2, 13.7, 8.4, 24.1-24.7_
  
  - [x] 21.4 Build category pages
    - Create category page at `/products/category/[slug]`
    - Display products in category and subcategories
    - Show category hierarchy breadcrumbs
    - _Requirements: 3.3_
  
  - [x] 21.5 Build cart page and drawer
    - Create cart page at `/cart`
    - Build cart drawer component for quick access
    - Display cart items with quantity controls
    - Show cart summary with totals
    - _Requirements: 5.1-5.8_
  
  - [x] 21.6 Build checkout page
    - Create checkout page at `/checkout`
    - Build shipping address form
    - Integrate Stripe payment form
    - Display order summary
    - Handle guest checkout flow
    - _Requirements: 6.1-6.7, 15.1-15.6, 30.1-30.7_
  
  - [x] 21.7 Build order history and detail pages
    - Create order history page at `/orders`
    - Create order detail page at `/orders/[id]`
    - Display order status timeline
    - Show order items and shipping information
    - _Requirements: 7.1, 7.5, 23.1-23.7_
  
  - [x] 21.8 Build order tracking page
    - Create guest-accessible tracking page at `/orders/track/[number]`
    - Display order status without authentication
    - _Requirements: 23.4, 23.5_
  
  - [x] 21.9 Build user profile pages
    - Create profile page at `/profile`
    - Build profile edit form
    - Build address management interface
    - _Requirements: 11.1-11.7_
  
  - [x] 21.10 Build authentication pages
    - Create login page at `/login`
    - Create registration page at `/register`
    - Create password reset page at `/reset-password`
    - _Requirements: 1.1-1.7_

- [x] 22. Implement responsive design
  - [x] 22.1 Make all pages responsive
    - Ensure all pages work on screen widths 320px to 2560px
    - Implement responsive navigation with hamburger menu (<768px)
    - Make all interactive elements touch-friendly (44px minimum)
    - Test on portrait and landscape orientations
    - _Requirements: 27.1-27.6_
  
  - [x] 22.2 Optimize images for mobile
    - Implement responsive image sizes
    - Use Next.js Image component for optimization
    - _Requirements: 27.3_
  
  - [ ]* 22.3 Test cross-browser compatibility
    - Test on Chrome, Firefox, Safari, and Edge
    - _Requirements: 27.5_

- [x] 23. Implement security and validation
  - [x] 23.1 Add comprehensive input validation
    - Create Zod schemas for all forms
    - Validate all user inputs before database operations
    - Return descriptive validation errors
    - _Requirements: 16.1, 16.2, 16.7_
  
  - [x] 23.2 Implement security measures
    - Add CSRF protection for all state-changing operations
    - Implement input sanitization to prevent SQL injection
    - Add rate limiting for authentication (5 attempts per 15 minutes)
    - Implement general API rate limiting (100 req/15min unauthenticated, 1000 req/15min authenticated)
    - _Requirements: 19.1, 19.4-19.8, 34.1-34.7_
  
  - [x] 23.3 Add audit logging
    - Log all authentication attempts
    - Log all admin actions
    - Log rate limit violations
    - _Requirements: 18.4, 26.7, 34.7_
  
  - [ ]* 23.4 Write property tests for validation
    - **Property: All user inputs are validated before database operations**
    - **Validates: Requirements 16.1**

- [x] 24. Implement error handling and logging
  - [x] 24.1 Create error handling infrastructure
    - Implement error class hierarchy in `src/lib/errors.ts`
    - Create global error handler in `src/lib/error-handler.ts`
    - Set up logging service in `src/lib/logger.ts`
    - _Requirements: 18.1-18.7_
  
  - [x] 24.2 Add error handling to all server actions and API routes
    - Wrap all operations in try-catch blocks
    - Return user-friendly error messages
    - Log errors with appropriate severity levels
    - _Requirements: 18.1, 18.2_
  
  - [x] 24.3 Implement database retry logic
    - Add connection retry (up to 3 times) on database failures
    - _Requirements: 18.3_
  
  - [x] 24.4 Add error boundaries to UI
    - Create error boundary components
    - Add error boundaries to key page sections
    - _Requirements: 18.2_
  
  - [ ]* 24.5 Write unit tests for error handling
    - Test error class hierarchy
    - Test error handler responses
    - Test retry logic
    - _Requirements: 18.1-18.7_

- [x] 25. Implement caching and performance optimizations
  - [x] 25.1 Add caching to product and category queries
    - Use Next.js unstable_cache for product queries (5 minute revalidation)
    - Cache category data
    - Implement cache invalidation on mutations
    - _Requirements: 17.4_
  
  - [x] 25.2 Optimize database queries
    - Ensure all frequently queried fields have indexes
    - Optimize search queries for performance
    - Add database connection pooling configuration
    - _Requirements: 17.6, 4.5, 12.5, 17.5_
  
  - [x] 25.3 Implement pagination throughout
    - Ensure all list views use pagination
    - Use consistent page sizes (24 for products, 10 for reviews)
    - _Requirements: 17.3, 24.2_
  
  - [ ]* 25.4 Test performance requirements
    - Verify homepage loads within 2 seconds
    - Verify product detail pages load within 1.5 seconds
    - Verify search returns results within 500ms for 100k products
    - _Requirements: 17.1, 17.2, 4.5_

- [x] 26. Checkpoint - Verify complete system
  - Test complete user flows (browse, cart, checkout, order tracking)
  - Test admin workflows (product management, order processing)
  - Verify all security measures are in place
  - Test responsive design on multiple devices
  - Verify performance meets requirements
  - Ask the user if questions arise

- [x] 27. Create database seed data
  - [x] 27.1 Create seed script
    - Create seed script in `src/db/seed.ts`
    - Add sample categories (3-level hierarchy)
    - Add sample products with images and inventory
    - Add sample users (customers and admin)
    - Add sample orders and reviews
    - _Requirements: 32.6_
  
  - [x] 27.2 Document seed data usage
    - Add instructions for running seed script
    - Document test user credentials

- [x] 28. Final integration and polish
  - [x] 28.1 Add loading states and optimistic updates
    - Add loading spinners for async operations
    - Implement optimistic updates for cart operations
    - Add skeleton loaders for data fetching
  
  - [x] 28.2 Improve error messages and user feedback
    - Review all error messages for clarity
    - Add success toast notifications
    - Improve form validation feedback
  
  - [x] 28.3 Add accessibility improvements
    - Ensure proper ARIA labels
    - Test keyboard navigation
    - Verify screen reader compatibility
  
  - [x] 28.4 Review and refine Teal branding
    - Ensure consistent use of Teal (#14B8A6) throughout
    - Review color contrast for accessibility
    - Polish UI components for professional appearance

- [x] 29. Final checkpoint and deployment preparation
  - Run complete test suite
  - Verify all requirements are met
  - Test complete user journeys end-to-end
  - Review security checklist
  - Prepare environment variables documentation
  - Ask the user if questions arise before deployment

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation uses TypeScript throughout as specified in the design document
- Checkpoints are placed at logical breaks to ensure quality and allow for questions
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All tasks build incrementally on previous work to avoid orphaned code
