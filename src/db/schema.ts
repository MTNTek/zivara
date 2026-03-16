import { pgTable, text, varchar, integer, decimal, timestamp, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('customer'), // 'customer' | 'admin'
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  parentId: uuid('parent_id'),
  description: text('description'),
  imageUrl: text('image_url'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  parentIdx: index('categories_parent_idx').on(table.parentId),
}));

// Products Table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal('discount_price', { precision: 10, scale: 2 }),
  discountStartDate: timestamp('discount_start_date'),
  discountEndDate: timestamp('discount_end_date'),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  sku: varchar('sku', { length: 100 }).unique(),
  isActive: boolean('is_active').notNull().default(true),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('products_name_idx').on(table.name),
  slugIdx: index('products_slug_idx').on(table.slug),
  categoryIdx: index('products_category_idx').on(table.categoryId),
  skuIdx: index('products_sku_idx').on(table.sku),
  // Composite indexes for common query patterns
  priceIdx: index('products_price_idx').on(table.price),
  ratingIdx: index('products_rating_idx').on(table.averageRating),
  isActiveIdx: index('products_is_active_idx').on(table.isActive),
  // Composite index for filtering active products by category
  activeCategoryIdx: index('products_active_category_idx').on(table.isActive, table.categoryId),
  // Composite index for price range queries on active products
  activePriceIdx: index('products_active_price_idx').on(table.isActive, table.price),
}));

// Product Images Table
export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  altText: varchar('alt_text', { length: 255 }),
  displayOrder: integer('display_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('product_images_product_idx').on(table.productId),
}));

// Inventory Table
export const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id).unique(),
  quantity: integer('quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('inventory_product_idx').on(table.productId),
}));

// Cart Items Table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }), // For guest carts
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  priceAtAdd: decimal('price_at_add', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('cart_items_user_idx').on(table.userId),
  sessionIdx: index('cart_items_session_idx').on(table.sessionId),
  productIdx: index('cart_items_product_idx').on(table.productId),
}));

// Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id),
  guestEmail: varchar('guest_email', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  shippingAddressLine1: varchar('shipping_address_line1', { length: 255 }).notNull(),
  shippingAddressLine2: varchar('shipping_address_line2', { length: 255 }),
  shippingCity: varchar('shipping_city', { length: 100 }).notNull(),
  shippingState: varchar('shipping_state', { length: 100 }).notNull(),
  shippingPostalCode: varchar('shipping_postal_code', { length: 20 }).notNull(),
  shippingCountry: varchar('shipping_country', { length: 100 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentIntentId: varchar('payment_intent_id', { length: 255 }),
  lastFourDigits: varchar('last_four_digits', { length: 4 }),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  carrierName: varchar('carrier_name', { length: 100 }),
  estimatedDeliveryDate: timestamp('estimated_delivery_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
  userIdx: index('orders_user_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  // Composite index for admin order filtering by status and date
  statusCreatedIdx: index('orders_status_created_idx').on(table.status, table.createdAt),
  // Index for guest order lookup
  guestEmailIdx: index('orders_guest_email_idx').on(table.guestEmail),
}));

// Order Items Table
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  productName: varchar('product_name', { length: 255 }).notNull(), // Snapshot at purchase time
  quantity: integer('quantity').notNull(),
  priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
  productIdx: index('order_items_product_idx').on(table.productId),
}));

// Order Status History Table
export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull(),
  notes: text('notes'),
  changedBy: uuid('changed_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orderIdx: index('order_status_history_order_idx').on(table.orderId),
}));

// Reviews Table
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment').notNull(),
  helpfulCount: integer('helpful_count').notNull().default(0),
  isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userProductIdx: index('reviews_user_product_idx').on(table.userId, table.productId),
  productIdx: index('reviews_product_idx').on(table.productId),
  // Index for sorting reviews by rating
  productRatingIdx: index('reviews_product_rating_idx').on(table.productId, table.rating),
  // Index for sorting reviews by date
  productCreatedIdx: index('reviews_product_created_idx').on(table.productId, table.createdAt),
}));

// User Addresses Table
export const userAddresses = pgTable('user_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }), // e.g., 'Home', 'Work'
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('user_addresses_user_idx').on(table.userId),
}));

// Price History Table (for tracking price changes)
export const priceHistory = pgTable('price_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  effectiveDate: timestamp('effective_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('price_history_product_idx').on(table.productId),
}));

// Sessions Table (Better Auth)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  impersonatedBy: text('impersonated_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tokenIdx: index('sessions_token_idx').on(table.token),
  userIdx: index('sessions_user_idx').on(table.userId),
}));

// Accounts Table (Better Auth)
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('accounts_user_idx').on(table.userId),
}));

// Verifications Table (Better Auth)
export const verifications = pgTable('verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  changes: text('changes'), // JSON string of changes
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('audit_logs_user_idx').on(table.userId),
  entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}));

// Search Queries Table (for analytics and suggestions)
export const searchQueries = pgTable('search_queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  query: varchar('query', { length: 255 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 255 }),
  resultsCount: integer('results_count').notNull().default(0),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  queryIdx: index('search_queries_query_idx').on(table.query),
  createdAtIdx: index('search_queries_created_at_idx').on(table.createdAt),
}));

// Wishlist Table
export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('wishlist_items_user_idx').on(table.userId),
  productIdx: index('wishlist_items_product_idx').on(table.productId),
  userProductIdx: index('wishlist_items_user_product_idx').on(table.userId, table.productId),
}));

// Suppliers Table
export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // SupplierType enum
  displayLabel: varchar('display_label', { length: 255 }),
  baseUrl: text('base_url'),
  status: varchar('status', { length: 50 }).notNull().default('inactive'),
  // 'active' | 'inactive' | 'error' | 'credential_error' | 'unavailable'
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  lastError: text('last_error'),
  lastHealthCheck: timestamp('last_health_check'),
  consecutiveFailures: integer('consecutive_failures').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('suppliers_name_idx').on(table.name),
  typeIdx: index('suppliers_type_idx').on(table.type),
  statusIdx: index('suppliers_status_idx').on(table.status),
}));

// Supplier Credentials Table
export const supplierCredentials = pgTable('supplier_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
  credentialType: varchar('credential_type', { length: 50 }).notNull(),
  // 'api_key' | 'oauth_token' | 'affiliate_id'
  encryptedValue: text('encrypted_value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index('supplier_credentials_supplier_idx').on(table.supplierId),
}));

// Product-Supplier Links Table
export const productSupplierLinks = pgTable('product_supplier_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
  supplierProductId: varchar('supplier_product_id', { length: 255 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(),
  costCurrency: varchar('cost_currency', { length: 10 }).notNull(),
  convertedCostPrice: decimal('converted_cost_price', { precision: 10, scale: 2 }),
  markupAmount: decimal('markup_amount', { precision: 10, scale: 2 }),
  displayPrice: decimal('display_price', { precision: 10, scale: 2 }),
  supplierProductUrl: text('supplier_product_url'),
  isPrimary: boolean('is_primary').notNull().default(false),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('psl_product_idx').on(table.productId),
  supplierIdx: index('psl_supplier_idx').on(table.supplierId),
  supplierProductIdx: index('psl_supplier_product_idx').on(table.supplierId, table.supplierProductId),
  primaryIdx: index('psl_primary_idx').on(table.productId, table.isPrimary),
}));

// Markup Rules Table
export const markupRules = pgTable('markup_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  markupType: varchar('markup_type', { length: 20 }).notNull(), // 'percentage' | 'fixed'
  markupValue: decimal('markup_value', { precision: 10, scale: 2 }).notNull(),
  priority: integer('priority').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index('markup_rules_supplier_idx').on(table.supplierId),
  categoryIdx: index('markup_rules_category_idx').on(table.categoryId),
  productIdx: index('markup_rules_product_idx').on(table.productId),
}));

// Exchange Rates Table
export const exchangeRates = pgTable('exchange_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceCurrency: varchar('source_currency', { length: 10 }).notNull(),
  targetCurrency: varchar('target_currency', { length: 10 }).notNull(),
  rate: decimal('rate', { precision: 16, scale: 8 }).notNull(),
  fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  currencyPairIdx: index('exchange_rates_pair_idx').on(table.sourceCurrency, table.targetCurrency),
  fetchedAtIdx: index('exchange_rates_fetched_idx').on(table.fetchedAt),
}));

// Sub-Orders Table
export const subOrders = pgTable('sub_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id),
  supplierOrderId: varchar('supplier_order_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  // 'pending' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'cancelled'
  costTotal: decimal('cost_total', { precision: 10, scale: 2 }).notNull(),
  exchangeRateUsed: decimal('exchange_rate_used', { precision: 16, scale: 8 }),
  exchangeRateId: uuid('exchange_rate_id').references(() => exchangeRates.id),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  carrierName: varchar('carrier_name', { length: 100 }),
  trackingStatus: varchar('tracking_status', { length: 50 }),
  trackingUpdatedAt: timestamp('tracking_updated_at'),
  estimatedDelivery: timestamp('estimated_delivery'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderIdx: index('sub_orders_order_idx').on(table.orderId),
  supplierIdx: index('sub_orders_supplier_idx').on(table.supplierId),
  statusIdx: index('sub_orders_status_idx').on(table.status),
}));

// Sub-Order Items Table (links order items to sub-orders)
export const subOrderItems = pgTable('sub_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  subOrderId: uuid('sub_order_id').notNull().references(() => subOrders.id, { onDelete: 'cascade' }),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id),
  supplierProductId: varchar('supplier_product_id', { length: 255 }).notNull(),
  costPriceAtOrder: decimal('cost_price_at_order', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  subOrderIdx: index('sub_order_items_sub_order_idx').on(table.subOrderId),
  orderItemIdx: index('sub_order_items_order_item_idx').on(table.orderItemId),
}));

// Sync Jobs Table
export const syncJobs = pgTable('sync_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
  jobType: varchar('job_type', { length: 20 }).notNull(), // 'inventory' | 'price'
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // 'pending' | 'running' | 'completed' | 'failed'
  productsChecked: integer('products_checked').default(0),
  productsUpdated: integer('products_updated').default(0),
  errorCount: integer('error_count').default(0),
  resultSummary: text('result_summary'),
  retryCount: integer('retry_count').notNull().default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index('sync_jobs_supplier_idx').on(table.supplierId),
  statusIdx: index('sync_jobs_status_idx').on(table.status),
  typeIdx: index('sync_jobs_type_idx').on(table.jobType),
  supplierTypeStatusIdx: index('sync_jobs_supplier_type_status_idx').on(
    table.supplierId, table.jobType, table.status
  ),
}));

// Supplier Price History Table
export const supplierPriceHistory = pgTable('supplier_price_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  productSupplierLinkId: uuid('product_supplier_link_id').notNull()
    .references(() => productSupplierLinks.id, { onDelete: 'cascade' }),
  oldCostPrice: decimal('old_cost_price', { precision: 10, scale: 2 }).notNull(),
  newCostPrice: decimal('new_cost_price', { precision: 10, scale: 2 }).notNull(),
  oldDisplayPrice: decimal('old_display_price', { precision: 10, scale: 2 }),
  newDisplayPrice: decimal('new_display_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  linkIdx: index('supplier_price_history_link_idx').on(table.productSupplierLinkId),
  createdAtIdx: index('supplier_price_history_created_idx').on(table.createdAt),
}));

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
  reviews: many(reviews),
  addresses: many(userAddresses),
  sessions: many(sessions),
  accounts: many(accounts),
  wishlistItems: many(wishlistItems),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryToParent',
  }),
  children: many(categories, {
    relationName: 'categoryToParent',
  }),
  products: many(products),
  markupRules: many(markupRules),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  inventory: one(inventory),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  priceHistory: many(priceHistory),
  wishlistItems: many(wishlistItems),
  supplierLinks: many(productSupplierLinks),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  subOrders: many(subOrders),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  subOrderItems: many(subOrderItems),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  changedByUser: one(users, {
    fields: [orderStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  product: one(products, {
    fields: [priceHistory.productId],
    references: [products.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

// Supplier Relations
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  credentials: many(supplierCredentials),
  productLinks: many(productSupplierLinks),
  subOrders: many(subOrders),
  syncJobs: many(syncJobs),
  markupRules: many(markupRules),
}));

export const supplierCredentialsRelations = relations(supplierCredentials, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierCredentials.supplierId],
    references: [suppliers.id],
  }),
}));

export const productSupplierLinksRelations = relations(productSupplierLinks, ({ one, many }) => ({
  product: one(products, {
    fields: [productSupplierLinks.productId],
    references: [products.id],
  }),
  supplier: one(suppliers, {
    fields: [productSupplierLinks.supplierId],
    references: [suppliers.id],
  }),
  priceHistory: many(supplierPriceHistory),
}));

export const markupRulesRelations = relations(markupRules, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [markupRules.supplierId],
    references: [suppliers.id],
  }),
  category: one(categories, {
    fields: [markupRules.categoryId],
    references: [categories.id],
  }),
  product: one(products, {
    fields: [markupRules.productId],
    references: [products.id],
  }),
}));

export const exchangeRatesRelations = relations(exchangeRates, ({ many }) => ({
  subOrders: many(subOrders),
}));

export const subOrdersRelations = relations(subOrders, ({ one, many }) => ({
  order: one(orders, {
    fields: [subOrders.orderId],
    references: [orders.id],
  }),
  supplier: one(suppliers, {
    fields: [subOrders.supplierId],
    references: [suppliers.id],
  }),
  exchangeRate: one(exchangeRates, {
    fields: [subOrders.exchangeRateId],
    references: [exchangeRates.id],
  }),
  items: many(subOrderItems),
}));

export const subOrderItemsRelations = relations(subOrderItems, ({ one }) => ({
  subOrder: one(subOrders, {
    fields: [subOrderItems.subOrderId],
    references: [subOrders.id],
  }),
  orderItem: one(orderItems, {
    fields: [subOrderItems.orderItemId],
    references: [orderItems.id],
  }),
}));

export const syncJobsRelations = relations(syncJobs, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [syncJobs.supplierId],
    references: [suppliers.id],
  }),
}));

export const supplierPriceHistoryRelations = relations(supplierPriceHistory, ({ one }) => ({
  productSupplierLink: one(productSupplierLinks, {
    fields: [supplierPriceHistory.productSupplierLinkId],
    references: [productSupplierLinks.id],
  }),
}));
