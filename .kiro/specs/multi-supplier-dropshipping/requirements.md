# Requirements Document

## Introduction

Transform Zivara from a single-store eCommerce platform into a multi-supplier dropshipping aggregator. The platform will connect to external suppliers (Amazon, Noon, Trendyol, AliExpress, CJ Dropshipping, and others), import their product catalogs, synchronize pricing and inventory, route customer orders to the correct supplier, and provide unified shipment tracking. The existing storefront, checkout, and admin dashboard will be extended to support multi-supplier operations, markup pricing, multi-currency conversion, and supplier performance monitoring.

## Glossary

- **Platform**: The Zivara eCommerce application acting as the dropshipping aggregator
- **Supplier**: An external product source (e.g., Amazon, Noon, Trendyol, AliExpress, CJ Dropshipping) from which products are imported and orders are fulfilled
- **Supplier_Adapter**: A module that implements the integration logic for a specific Supplier, abstracting API calls, scraping, or affiliate program interactions behind a common interface
- **Supplier_Registry**: The system component that manages all registered Suppliers and their Supplier_Adapters
- **Product_Importer**: The system component responsible for fetching product data from Suppliers and creating or updating local product records
- **Price_Engine**: The system component that calculates the customer-facing price by applying markup rules to the Supplier cost price
- **Markup_Rule**: A configuration that defines how much to add to a Supplier cost price, scoped by Supplier, category, or individual product
- **Order_Router**: The system component that splits a customer order into sub-orders and dispatches each to the appropriate Supplier
- **Sub_Order**: A portion of a customer order containing items from a single Supplier, forwarded to that Supplier for fulfillment
- **Sync_Scheduler**: The system component that periodically triggers inventory and price synchronization jobs for all active Suppliers
- **Tracking_Aggregator**: The system component that collects shipment tracking updates from multiple Suppliers and presents a unified tracking view to the customer
- **Currency_Converter**: The system component that converts Supplier prices from their native currency to the Platform display currency
- **Supplier_Credential**: Encrypted API keys, tokens, or authentication data required to communicate with a Supplier
- **Cost_Price**: The price at which the Platform purchases a product from a Supplier, before markup
- **Display_Price**: The final customer-facing price after markup and currency conversion
- **Supplier_Product_ID**: The unique identifier for a product in the Supplier external system
- **Admin**: A user with the admin role who manages Suppliers, markup rules, and monitors platform operations

## Requirements

### Requirement 1: Supplier Registration and Management

**User Story:** As an Admin, I want to register and manage external suppliers, so that the Platform can connect to multiple product sources.

#### Acceptance Criteria

1. THE Platform SHALL store Supplier records with name, type, base URL, status (active/inactive), supported currency, and creation timestamp
2. WHEN an Admin registers a new Supplier, THE Supplier_Registry SHALL validate that the Supplier name is unique and the Supplier type is supported
3. WHEN an Admin activates a Supplier, THE Supplier_Registry SHALL verify connectivity to the Supplier by invoking the corresponding Supplier_Adapter health check
4. WHEN an Admin deactivates a Supplier, THE Platform SHALL hide all products sourced exclusively from that Supplier from the storefront
5. THE Platform SHALL support the following Supplier types: amazon, noon, trendyol, aliexpress, cj_dropshipping, and custom
6. IF a Supplier connectivity check fails, THEN THE Supplier_Registry SHALL set the Supplier status to "error" and record the failure reason

### Requirement 2: Supplier Credential Storage

**User Story:** As an Admin, I want to securely store API credentials for each supplier, so that the Platform can authenticate with external supplier systems.

#### Acceptance Criteria

1. THE Platform SHALL store Supplier_Credentials with a reference to the Supplier, credential type (api_key, oauth_token, affiliate_id), and an encrypted credential value
2. WHEN an Admin saves a Supplier_Credential, THE Platform SHALL encrypt the credential value using AES-256-GCM before persisting it to the database
3. WHEN a Supplier_Adapter requires authentication, THE Platform SHALL decrypt the Supplier_Credential at runtime and pass it to the adapter
4. THE Platform SHALL mask Supplier_Credential values in all API responses and admin UI displays, showing only the last four characters
5. IF decryption of a Supplier_Credential fails, THEN THE Platform SHALL log the failure, mark the Supplier as "credential_error", and notify the Admin via the dashboard

### Requirement 3: Supplier Adapter Interface

**User Story:** As a developer, I want a common adapter interface for all suppliers, so that new suppliers can be added without modifying core platform logic.

#### Acceptance Criteria

1. THE Supplier_Adapter interface SHALL define methods for: health check, fetch products, fetch product details, check inventory, place order, and get tracking info
2. THE Supplier_Registry SHALL load the correct Supplier_Adapter based on the Supplier type field
3. WHEN a new Supplier type is added, THE Platform SHALL require only a new Supplier_Adapter implementation without changes to the Order_Router, Product_Importer, or Tracking_Aggregator
4. THE Supplier_Adapter interface SHALL return standardized response objects with success status, data payload, and error details regardless of the underlying Supplier API format
5. IF a Supplier_Adapter method call times out after 30 seconds, THEN THE Platform SHALL abort the call and return a timeout error

### Requirement 4: Product Import from Suppliers

**User Story:** As an Admin, I want to import products from connected suppliers, so that the Platform catalog is populated with supplier offerings.

#### Acceptance Criteria

1. WHEN an Admin triggers a product import for a Supplier, THE Product_Importer SHALL fetch product data using the Supplier_Adapter and create local product records
2. THE Product_Importer SHALL map Supplier product data to the existing products table schema, including name, description, images, and category
3. THE Platform SHALL store a product-supplier link record containing the product ID, Supplier ID, Supplier_Product_ID, Cost_Price, supplier currency, and the supplier product URL
4. WHEN a product already exists locally with the same Supplier_Product_ID for the same Supplier, THE Product_Importer SHALL update the existing record instead of creating a duplicate
5. THE Product_Importer SHALL generate a unique SKU for imported products using the format "{SUPPLIER_CODE}-{SUPPLIER_PRODUCT_ID}"
6. WHEN a product import encounters an invalid product record, THE Product_Importer SHALL skip that record, log the error, and continue importing remaining products
7. THE Product_Importer SHALL support batch imports of up to 500 products per import job

### Requirement 5: Price Management and Markup Rules

**User Story:** As an Admin, I want to define markup rules for supplier products, so that the Platform earns a margin on each sale.

#### Acceptance Criteria

1. THE Price_Engine SHALL support Markup_Rules scoped at three levels: per-Supplier, per-category, and per-product
2. WHEN multiple Markup_Rules apply to a product, THE Price_Engine SHALL use the most specific rule (product > category > Supplier)
3. THE Price_Engine SHALL support two markup types: percentage (e.g., 15%) and fixed amount (e.g., $5.00)
4. WHEN a Cost_Price changes during synchronization, THE Price_Engine SHALL recalculate the Display_Price using the applicable Markup_Rule
5. THE Platform SHALL store the Cost_Price, markup amount, and Display_Price on each product-supplier link record
6. IF no Markup_Rule exists for a product, THEN THE Price_Engine SHALL apply a default platform-wide markup of 20%
7. THE Price_Engine SHALL round all Display_Prices to two decimal places

### Requirement 6: Currency Conversion

**User Story:** As an Admin, I want supplier prices in foreign currencies to be converted to the platform display currency, so that customers see consistent pricing.

#### Acceptance Criteria

1. THE Currency_Converter SHALL maintain a table of exchange rates with source currency, target currency, rate, and last-updated timestamp
2. WHEN the Price_Engine calculates a Display_Price, THE Currency_Converter SHALL convert the Cost_Price from the Supplier currency to the Platform display currency before applying markup
3. THE Platform SHALL update exchange rates at least once every 24 hours
4. THE Platform SHALL store the exchange rate used at the time of order placement on the Sub_Order record for audit purposes
5. IF an exchange rate is older than 48 hours, THEN THE Currency_Converter SHALL flag the rate as stale and log a warning
6. THE Currency_Converter SHALL support at minimum: USD, EUR, TRY, AED, and CNY

### Requirement 7: Inventory Synchronization

**User Story:** As an Admin, I want product availability to stay in sync with supplier inventory, so that customers do not order out-of-stock items.

#### Acceptance Criteria

1. THE Sync_Scheduler SHALL run inventory synchronization jobs at a configurable interval (default: every 4 hours)
2. WHEN an inventory sync job runs, THE Product_Importer SHALL query each active Supplier_Adapter for current stock status and update the local inventory table
3. WHEN a Supplier reports a product as out of stock, THE Platform SHALL set the local inventory quantity to zero and mark the product as unavailable on the storefront
4. WHEN a Supplier reports a product as back in stock, THE Platform SHALL restore the local inventory quantity and mark the product as available
5. THE Platform SHALL log each inventory sync result with Supplier ID, products checked, products updated, and sync duration
6. IF an inventory sync job fails for a Supplier, THEN THE Sync_Scheduler SHALL retry the job up to 3 times with exponential backoff before marking the sync as failed

### Requirement 8: Price Synchronization

**User Story:** As an Admin, I want supplier prices to stay current, so that the Platform does not sell products at a loss.

#### Acceptance Criteria

1. THE Sync_Scheduler SHALL run price synchronization jobs at a configurable interval (default: every 6 hours)
2. WHEN a price sync job detects a Cost_Price change, THE Product_Importer SHALL update the product-supplier link record and trigger the Price_Engine to recalculate the Display_Price
3. WHEN a Cost_Price increases by more than 20% in a single sync, THE Platform SHALL flag the product for Admin review and pause the product listing
4. THE Platform SHALL record all Cost_Price changes in a supplier price history table with old price, new price, and change timestamp
5. IF a price sync job fails for a Supplier, THEN THE Sync_Scheduler SHALL retry the job up to 3 times with exponential backoff before marking the sync as failed

### Requirement 9: Order Routing to Suppliers

**User Story:** As a customer, I want my order to be fulfilled by the correct supplier, so that I receive the products I purchased.

#### Acceptance Criteria

1. WHEN a customer places an order containing products from multiple Suppliers, THE Order_Router SHALL split the order into separate Sub_Orders grouped by Supplier
2. THE Order_Router SHALL create Sub_Order records with a reference to the parent order, Supplier ID, sub-order status, Cost_Price total, and the exchange rate used
3. WHEN a Sub_Order is created, THE Order_Router SHALL forward the Sub_Order to the corresponding Supplier_Adapter place-order method
4. THE Platform SHALL store the Supplier order reference ID returned by the Supplier on the Sub_Order record
5. WHEN all Sub_Orders for a parent order reach "shipped" status, THE Platform SHALL update the parent order status to "shipped"
6. IF a Supplier_Adapter place-order call fails, THEN THE Order_Router SHALL mark the Sub_Order as "failed", notify the Admin, and keep the parent order in "processing" status
7. THE Platform SHALL display Sub_Order details on the customer order page, showing which items ship from which Supplier (using a display-friendly Supplier label)

### Requirement 10: Shipment Tracking Aggregation

**User Story:** As a customer, I want to see unified tracking for my order, so that I can monitor delivery progress regardless of which supplier ships each item.

#### Acceptance Criteria

1. THE Tracking_Aggregator SHALL poll each Supplier_Adapter for tracking updates on active Sub_Orders at a configurable interval (default: every 2 hours)
2. WHEN a Supplier_Adapter returns a tracking update, THE Tracking_Aggregator SHALL store the tracking number, carrier name, current status, and status timestamp on the Sub_Order record
3. THE Platform SHALL display a unified tracking timeline on the customer order page, combining tracking events from all Sub_Orders in chronological order
4. WHEN a Sub_Order tracking status changes to "delivered", THE Tracking_Aggregator SHALL update the Sub_Order status to "delivered"
5. WHEN all Sub_Orders for a parent order reach "delivered" status, THE Platform SHALL update the parent order status to "delivered"
6. IF a tracking poll fails for a Sub_Order, THEN THE Tracking_Aggregator SHALL retry on the next scheduled poll without marking the Sub_Order as failed

### Requirement 11: Admin Supplier Dashboard

**User Story:** As an Admin, I want a dashboard to monitor supplier performance, so that I can identify issues and optimize supplier selection.

#### Acceptance Criteria

1. THE Platform SHALL display a supplier management page listing all registered Suppliers with name, type, status, product count, and last sync timestamp
2. THE Platform SHALL display per-Supplier performance metrics: total orders routed, successful fulfillment rate, average fulfillment time, and total revenue generated
3. WHEN an Admin views a Supplier detail page, THE Platform SHALL show recent sync logs, error logs, and a list of products sourced from that Supplier
4. THE Platform SHALL display a profit margin summary showing Cost_Price totals, markup totals, and net margin per Supplier
5. WHEN a Supplier has a fulfillment rate below 90%, THE Platform SHALL display a warning indicator on the supplier management page

### Requirement 12: Admin Markup Rules Management

**User Story:** As an Admin, I want to create and edit markup rules from the dashboard, so that I can control pricing strategy without code changes.

#### Acceptance Criteria

1. THE Platform SHALL provide an admin page for creating, editing, and deleting Markup_Rules
2. WHEN an Admin creates a Markup_Rule, THE Platform SHALL validate that the scope (Supplier, category, or product) references a valid entity
3. WHEN an Admin updates a Markup_Rule, THE Price_Engine SHALL recalculate Display_Prices for all affected products within 60 seconds
4. THE Platform SHALL display a preview of the resulting Display_Price when an Admin creates or edits a Markup_Rule
5. THE Platform SHALL prevent deletion of a Markup_Rule if it is the only rule covering active products, requiring the Admin to assign an alternative rule first

### Requirement 13: Product Source Attribution

**User Story:** As a customer, I want to know which supplier fulfills a product, so that I can make informed purchasing decisions.

#### Acceptance Criteria

1. THE Platform SHALL display a "Fulfilled by {Supplier_Label}" badge on product cards and product detail pages
2. THE Platform SHALL allow Admins to configure a display-friendly label for each Supplier that differs from the internal Supplier name
3. WHEN a product is available from multiple Suppliers, THE Platform SHALL display the price from the Supplier with the lowest Display_Price
4. WHEN a product is available from multiple Suppliers, THE Platform SHALL select the Supplier with the lowest Display_Price as the default fulfillment source

### Requirement 14: Multi-Supplier Cart and Checkout

**User Story:** As a customer, I want to purchase products from multiple suppliers in a single checkout, so that I do not need to place separate orders.

#### Acceptance Criteria

1. THE Platform SHALL allow cart items from different Suppliers to coexist in a single cart
2. WHEN a customer views the cart, THE Platform SHALL group cart items by Supplier and display the Supplier label for each group
3. WHEN a customer proceeds to checkout, THE Platform SHALL calculate shipping costs per Supplier group and display them as separate line items
4. THE Platform SHALL display the total order cost as the sum of all Supplier group subtotals, shipping costs, and applicable taxes
5. IF a cart item becomes unavailable during checkout, THEN THE Platform SHALL notify the customer, remove the unavailable item, and recalculate the order total

### Requirement 15: Sync Job Monitoring

**User Story:** As an Admin, I want to monitor synchronization job status, so that I can detect and resolve sync failures promptly.

#### Acceptance Criteria

1. THE Platform SHALL store sync job records with job type (inventory/price), Supplier ID, status (running/completed/failed), start time, end time, and result summary
2. THE Platform SHALL display a sync jobs dashboard showing recent jobs with status, duration, and error count
3. WHEN a sync job fails after all retries, THE Platform SHALL display an alert on the admin dashboard
4. THE Platform SHALL allow an Admin to manually trigger an inventory or price sync for a specific Supplier
5. THE Platform SHALL prevent concurrent sync jobs for the same Supplier and job type

### Requirement 16: Error Handling for Supplier Unavailability

**User Story:** As a customer, I want the platform to handle supplier outages gracefully, so that my shopping experience is not disrupted.

#### Acceptance Criteria

1. WHEN a Supplier_Adapter health check fails three consecutive times, THE Supplier_Registry SHALL set the Supplier status to "unavailable"
2. WHILE a Supplier status is "unavailable", THE Platform SHALL display a "Temporarily unavailable" badge on products sourced exclusively from that Supplier
3. WHILE a Supplier status is "unavailable", THE Platform SHALL prevent new orders for products sourced exclusively from that Supplier
4. WHEN a Supplier_Adapter health check succeeds after a period of unavailability, THE Supplier_Registry SHALL restore the Supplier status to "active"
5. THE Sync_Scheduler SHALL continue to attempt health checks on unavailable Suppliers at a reduced interval (default: every 30 minutes)
6. IF a customer attempts to checkout with items from an unavailable Supplier, THEN THE Platform SHALL notify the customer and suggest removing those items
