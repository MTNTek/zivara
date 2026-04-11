# Implementation Plan: Multi-Supplier Dropshipping

## Overview

Transform Zivara into a multi-supplier dropshipping aggregator by extending the database schema, building a supplier adapter layer with registry pattern, implementing price/inventory sync pipelines, order routing with sub-orders, tracking aggregation, and admin management pages. All tasks use TypeScript with the existing Next.js 16 + Drizzle ORM + Vitest + fast-check stack.

## Tasks

- [x] 1. Add supplier database tables and relations
  - [x] 1.1 Add new table definitions to `src/db/schema.ts`
    - Add `suppliers`, `supplierCredentials`, `productSupplierLinks`, `markupRules`, `exchangeRates`, `subOrders`, `subOrderItems`, `syncJobs`, `supplierPriceHistory` tables as defined in the design
    - Add all indexes specified in the design
    - _Requirements: 1.1, 2.1, 4.3, 5.1, 5.5, 6.1, 9.2, 15.1, 8.4_
  - [x] 1.2 Add Drizzle relations for new tables and extend existing relations
    - Add `suppliersRelations`, `supplierCredentialsRelations`, `productSupplierLinksRelations`, `markupRulesRelations`, `exchangeRatesRelations`, `subOrdersRelations`, `subOrderItemsRelations`, `syncJobsRelations`, `supplierPriceHistoryRelations`
    - Extend `productsRelations` with `supplierLinks`, `ordersRelations` with `subOrders`, `categoriesRelations` with `markupRules`, `orderItemsRelations` with `subOrderItems`
    - _Requirements: 1.1, 4.3, 9.2_
  - [x] 1.3 Generate and run database migration
    - Run `drizzle-kit generate` and `tsx src/db/migrate.ts` to apply the new schema
    - _Requirements: 1.1_

- [x] 2. Implement credential manager with AES-256-GCM encryption
  - [x] 2.1 Create `src/features/suppliers/credentials.ts`
    - Implement `encryptCredential(plaintext, encryptionKey)` using AES-256-GCM with random IV and auth tag
    - Implement `decryptCredential(ciphertext, encryptionKey)` that reverses the encryption
    - Implement `maskCredential(value)` that shows only last 4 characters
    - Implement `getDecryptedCredentials(supplierId)` that fetches and decrypts all credentials for a supplier
    - On decryption failure, mark supplier as `credential_error` and log the error
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [ ]* 2.2 Write property test for credential encryption round-trip
    - **Property 4: Credential encryption round-trip**
    - **Validates: Requirements 2.2**
    - Create `src/features/suppliers/__tests__/credentials.property.test.ts`
  - [ ]* 2.3 Write property test for credential masking
    - **Property 5: Credential masking shows only last four characters**
    - **Validates: Requirements 2.4**

- [x] 3. Implement supplier adapter interface and registry
  - [x] 3.1 Create adapter types at `src/features/suppliers/adapters/types.ts`
    - Define `SupplierType`, `AdapterResponse<T>`, `SupplierProduct`, `SupplierOrderRequest`, `SupplierOrderResult`, `TrackingInfo`, `DecryptedCredential`, and `SupplierAdapter` interface as specified in the design
    - _Requirements: 3.1, 3.4_
  - [x] 3.2 Create supplier registry at `src/features/suppliers/registry.ts`
    - Implement `SupplierRegistry` class with `register()`, `getAdapter()`, `hasAdapter()`, and `verifyConnectivity()` methods
    - `verifyConnectivity` should decrypt credentials, call adapter `healthCheck`, update supplier status and `lastHealthCheck` timestamp
    - Track `consecutiveFailures` — set status to `unavailable` after 3 consecutive failures, reset on success
    - _Requirements: 1.3, 1.6, 3.2, 16.1, 16.4_
  - [x] 3.3 Create a custom adapter stub at `src/features/suppliers/adapters/custom-adapter.ts`
    - Implement `SupplierAdapter` interface for the `custom` type as a reference implementation
    - Include 30-second timeout on all external calls
    - _Requirements: 1.5, 3.3, 3.5_
  - [ ]* 3.4 Write property tests for supplier registry
    - **Property 1: Supplier name uniqueness and type validation**
    - **Property 3: Health check failure sets error status**
    - **Property 6: Registry resolves correct adapter by type**
    - **Property 27: Three consecutive health check failures set unavailable**
    - **Validates: Requirements 1.2, 1.5, 1.6, 3.2, 16.1, 16.4**
    - Create `src/features/suppliers/__tests__/supplier-registry.property.test.ts`

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement currency converter
  - [x] 5.1 Create `src/features/suppliers/currency.ts`
    - Implement `convert(amount, fromCurrency, toCurrency, rate)` with proper rounding
    - Implement `getExchangeRate(from, to)` that queries the `exchangeRates` table and returns rate with staleness flag (stale if >48h old)
    - Implement `refreshExchangeRates()` placeholder for fetching rates from an external API
    - Support at minimum: USD, EUR, TRY, AED, CNY
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_
  - [ ]* 5.2 Write property test for exchange rate staleness detection
    - **Property 14: Exchange rate staleness detection**
    - **Validates: Requirements 6.5**
    - Create `src/features/suppliers/__tests__/currency.property.test.ts`

- [x] 6. Implement price engine with markup rules
  - [x] 6.1 Create `src/features/suppliers/price-engine.ts`
    - Implement `resolveMarkupRule(rules, productId, categoryId, supplierId)` with specificity: product > category > supplier, fallback to default 20%
    - Implement `calculateDisplayPrice(productId, supplierId, costPrice, costCurrency)` that converts currency then applies markup
    - Implement `recalculateAllPrices(scope)` for bulk recalculation
    - Round all display prices to 2 decimal places
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.2_
  - [ ]* 6.2 Write property tests for price engine
    - **Property 10: Markup rule specificity resolution**
    - **Property 11: Markup calculation correctness**
    - **Property 13: Currency conversion before markup**
    - **Property 22: Best-price supplier selection**
    - **Validates: Requirements 5.2, 5.3, 5.6, 5.7, 6.2, 13.3, 13.4**
    - Create `src/features/suppliers/__tests__/price-engine.property.test.ts`

- [x] 7. Implement product importer
  - [x] 7.1 Create `src/features/suppliers/importer.ts`
    - Implement `importProducts(supplierId, options)` that fetches via adapter, creates/updates local product records and product-supplier links
    - Generate SKUs in format `{SUPPLIER_CODE}-{SUPPLIER_PRODUCT_ID}`
    - Handle idempotent imports — update existing records when supplier product ID matches
    - Skip invalid records, log errors, continue importing (batch up to 500)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 7.2 Implement `syncInventory(supplierId)` in the importer
    - Query adapter for stock status, update local inventory table
    - Set quantity to 0 and mark unavailable when out of stock
    - Restore quantity and availability when back in stock
    - _Requirements: 7.2, 7.3, 7.4_
  - [x] 7.3 Implement `syncPrices(supplierId)` in the importer
    - Detect cost price changes, update product-supplier links, trigger price engine recalculation
    - Flag products for admin review when cost increases >20% (set `isActive = false`)
    - Record all price changes in `supplierPriceHistory` table
    - _Requirements: 8.2, 8.3, 8.4_
  - [ ]* 7.4 Write property tests for product importer
    - **Property 7: Product import creates correct local records and links**
    - **Property 8: Product import is idempotent**
    - **Property 9: Import resilience to invalid records**
    - **Property 12: Price recalculation on cost change**
    - **Property 15: Inventory sync round-trip**
    - **Property 18: Large price increase flags product for review**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.4, 7.3, 7.4, 8.2, 8.3, 8.4**
    - Create `src/features/suppliers/__tests__/importer.property.test.ts`

- [x] 8. Implement sync scheduler
  - [x] 8.1 Create `src/features/suppliers/sync-scheduler.ts`
    - Implement `scheduleSyncJob(supplierId, jobType)` with concurrent job prevention (reject if running job exists for same supplier+type)
    - Implement `runPendingSyncJobs()` that processes due jobs, calls importer sync functions
    - Implement `retrySyncJob(jobId)` with exponential backoff (1min, 4min, 16min), max 3 retries
    - Record job results: products checked, updated, error count, start/completion time
    - _Requirements: 7.1, 7.5, 7.6, 8.1, 8.5, 15.1, 15.5_
  - [ ]* 8.2 Write property tests for sync scheduler
    - **Property 16: Sync job retry with exponential backoff**
    - **Property 17: Sync job record completeness**
    - **Property 26: Concurrent sync job prevention**
    - **Validates: Requirements 7.5, 7.6, 8.5, 15.1, 15.5**
    - Create `src/features/suppliers/__tests__/sync-scheduler.property.test.ts`

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement order router
  - [x] 10.1 Create `src/features/suppliers/order-router.ts`
    - Implement `routeOrder(orderId)` that groups order items by supplier, creates sub-orders with cost totals and exchange rate references
    - Forward each sub-order to the supplier adapter `placeOrder` method
    - Store supplier order reference ID on sub-order record
    - On adapter failure, mark sub-order as `failed`, keep parent order in `processing`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 6.4_
  - [x] 10.2 Implement `checkSubOrderStatuses(orderId)` for parent order status aggregation
    - Update parent order to `shipped` when all sub-orders are `shipped`
    - Update parent order to `delivered` when all sub-orders are `delivered`
    - _Requirements: 9.5, 10.5_
  - [ ]* 10.3 Write property tests for order router
    - **Property 19: Order routing splits by supplier**
    - **Property 20: Parent order status aggregation**
    - **Property 32: Exchange rate stored on sub-order at order time**
    - **Validates: Requirements 9.1, 9.2, 9.5, 9.6, 6.4, 10.4, 10.5**
    - Create `src/features/suppliers/__tests__/order-router.property.test.ts`

- [x] 11. Implement tracking aggregator
  - [x] 11.1 Create `src/features/suppliers/tracking.ts`
    - Implement `pollTrackingUpdates()` that queries active sub-orders, calls adapter `getTrackingInfo`, updates sub-order tracking fields
    - Update sub-order status to `delivered` when tracking shows delivered
    - Implement `getUnifiedTracking(orderId)` that combines all sub-order tracking events into a chronologically sorted timeline
    - On poll failure, skip and retry on next scheduled poll
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_
  - [ ]* 11.2 Write property test for tracking timeline
    - **Property 21: Unified tracking timeline is chronologically sorted**
    - **Validates: Requirements 10.3**
    - Create `src/features/suppliers/__tests__/tracking.property.test.ts`

- [x] 12. Implement cart grouping and checkout integration
  - [x] 12.1 Create `src/features/suppliers/cart-utils.ts`
    - Implement cart item grouping by supplier for display
    - Implement checkout validation: check supplier availability, remove unavailable items, recalculate totals
    - Block checkout for items from unavailable suppliers with appropriate error messages
    - _Requirements: 14.1, 14.2, 14.5, 16.3, 16.6_
  - [x] 12.2 Integrate order router into checkout flow
    - Modify checkout to call `routeOrder` after order creation to split into sub-orders
    - Calculate per-supplier shipping costs as separate line items
    - Ensure order total = sum of supplier subtotals + shipping + tax
    - _Requirements: 14.3, 14.4, 9.3_
  - [ ]* 12.3 Write property tests for cart and checkout
    - **Property 23: Cart grouping by supplier**
    - **Property 24: Order total is sum of components**
    - **Property 25: Unavailable item removal recalculates total**
    - **Property 28: Checkout blocked for unavailable supplier products**
    - **Validates: Requirements 14.1, 14.2, 14.4, 14.5, 16.3, 16.6**
    - Create `src/features/suppliers/__tests__/cart-checkout.property.test.ts`

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Build admin supplier management pages
  - [x] 14.1 Create supplier server actions at `src/features/suppliers/actions.ts`
    - Implement CRUD actions: create supplier, update supplier, activate/deactivate supplier, save credentials, trigger health check
    - Implement manual sync trigger action
    - _Requirements: 1.2, 1.3, 1.4, 2.2, 15.4_
  - [x] 14.2 Create supplier list page at `src/app/admin/suppliers/page.tsx`
    - Display all suppliers with name, type, status, product count, last sync timestamp
    - Show warning indicator for suppliers with fulfillment rate below 90%
    - Show "unavailable" badge for suppliers with status `unavailable`
    - _Requirements: 11.1, 11.5, 16.2_
  - [x] 14.3 Create supplier detail page at `src/app/admin/suppliers/[id]/page.tsx`
    - Show supplier info, credentials (masked), recent sync logs, error logs, product list
    - Show performance metrics: orders routed, fulfillment rate, average fulfillment time, revenue
    - Show profit margin summary: cost totals, markup totals, net margin
    - _Requirements: 11.2, 11.3, 11.4_
  - [x] 14.4 Create supplier registration form at `src/app/admin/suppliers/new/page.tsx`
    - Form for name, type, base URL, currency, credentials
    - Validate unique name and supported type on submit
    - _Requirements: 1.2, 1.5, 2.1_

- [x] 15. Build admin markup rules management page
  - [x] 15.1 Create markup rules server actions at `src/features/suppliers/markup-actions.ts`
    - Implement CRUD actions for markup rules with scope validation (supplier/category/product must exist)
    - Prevent deletion of sole rule covering active products
    - Trigger price recalculation on rule create/update
    - _Requirements: 12.1, 12.2, 12.3, 12.5_
  - [x] 15.2 Create markup rules page at `src/app/admin/markup-rules/page.tsx`
    - List all markup rules with scope, type, value, priority, active status
    - Create/edit form with display price preview
    - _Requirements: 12.1, 12.4_
  - [ ]* 15.3 Write property tests for markup rule validation
    - **Property 29: Markup rule scope validation**
    - **Property 30: Sole markup rule deletion prevention**
    - **Validates: Requirements 12.2, 12.5**
    - Create `src/features/suppliers/__tests__/markup-rules.property.test.ts`

- [x] 16. Build admin sync jobs dashboard
  - [x] 16.1 Create sync jobs page at `src/app/admin/sync-jobs/page.tsx`
    - Display recent sync jobs with status, duration, error count, supplier name, job type
    - Show alert for failed jobs after all retries
    - Allow manual trigger of inventory/price sync per supplier
    - _Requirements: 15.2, 15.3, 15.4_

- [x] 17. Update storefront for supplier attribution and multi-supplier display
  - [x] 17.1 Add "Fulfilled by" badge to product cards and detail pages
    - Display `Fulfilled by {displayLabel}` on `ProductCard` and product detail page
    - Show "Temporarily unavailable" badge for products from unavailable suppliers
    - _Requirements: 13.1, 13.2, 16.2_
  - [x] 17.2 Update cart page to group items by supplier
    - Group cart items by supplier with supplier label headers
    - Show per-supplier shipping line items
    - _Requirements: 14.2, 14.3_
  - [x] 17.3 Add sub-order tracking to customer order page
    - Display sub-order details showing which items ship from which supplier
    - Show unified tracking timeline combining all sub-order events chronologically
    - _Requirements: 9.7, 10.3_
  - [ ]* 17.4 Write property test for supplier performance metrics
    - **Property 31: Supplier performance metrics calculation**
    - **Validates: Requirements 11.2, 11.4, 11.5**
    - Create `src/features/suppliers/__tests__/supplier-metrics.property.test.ts`

- [x] 18. Wire supplier deactivation to product visibility
  - [x] 18.1 Implement supplier deactivation product hiding logic
    - When a supplier is deactivated, hide products sourced exclusively from that supplier (set `isActive = false`)
    - Products with other active supplier links remain visible
    - When supplier is reactivated, restore product visibility
    - _Requirements: 1.4, 16.2, 16.3_
  - [ ]* 18.2 Write property test for supplier deactivation
    - **Property 2: Supplier deactivation hides exclusive products**
    - **Validates: Requirements 1.4**
    - Create test in `src/features/suppliers/__tests__/supplier-registry.property.test.ts`

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project already has Vitest and fast-check configured
- All code uses TypeScript with the existing Next.js 16 + Drizzle ORM conventions
