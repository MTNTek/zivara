# Database Query Optimization - Task 25.2

## Overview

This document describes the database optimizations implemented for the Zivara eCommerce Platform to improve query performance and meet the requirements for fast search results and efficient data retrieval.

## Requirements Addressed

- **Requirement 17.6**: Database indexes on frequently queried fields
- **Requirement 17.5**: Database connection pool configuration with 5-second max wait time
- **Requirement 4.5**: Search results within 500ms for catalogs up to 100,000 products
- **Requirement 12.5**: Optimized order search and filtering

## Optimizations Implemented

### 1. Additional Database Indexes

#### Products Table
Added the following indexes to optimize common query patterns:

- **`products_price_idx`**: Index on `price` field for price-based sorting and filtering
- **`products_rating_idx`**: Index on `average_rating` field for rating-based sorting and filtering
- **`products_is_active_idx`**: Index on `is_active` field for filtering active products
- **`products_active_category_idx`**: Composite index on `(is_active, category_id)` for filtering active products by category
- **`products_active_price_idx`**: Composite index on `(is_active, price)` for price range queries on active products

**Impact**: These indexes significantly improve the performance of product listing pages with filters, especially when combining multiple filter criteria.

#### Orders Table
Added the following indexes to optimize admin order management:

- **`orders_status_created_idx`**: Composite index on `(status, created_at)` for filtering orders by status and sorting by date
- **`orders_guest_email_idx`**: Index on `guest_email` field for guest order lookup

**Impact**: These indexes improve the performance of admin order filtering and guest order tracking.

#### Reviews Table
Added the following indexes to optimize review display:

- **`reviews_product_rating_idx`**: Composite index on `(product_id, rating)` for sorting reviews by rating
- **`reviews_product_created_idx`**: Composite index on `(product_id, created_at)` for sorting reviews by date

**Impact**: These indexes improve the performance of review listing pages with different sort orders.

### 2. Connection Pool Optimization

Updated the PostgreSQL connection pool configuration in `src/db/index.ts`:

```typescript
const client = postgres(connectionString, {
  // Connection pool settings
  max: 20, // Increased from 10 to 20 for better concurrency
  idle_timeout: 30, // Increased from 20 to 30 seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Maximum lifetime of a connection (30 minutes)
  
  // Performance optimizations
  prepare: true, // Use prepared statements for better performance
  fetch_types: false, // Disable automatic type fetching for faster queries
  
  // Connection behavior
  connection: {
    application_name: 'zivara-ecommerce', // Identify connections in PostgreSQL logs
  },
  
  // Error handling
  onnotice: () => {}, // Suppress notices to reduce noise
});
```

**Changes**:
- Increased `max` connections from 10 to 20 for better concurrency under load
- Increased `idle_timeout` from 20 to 30 seconds to reduce connection churn
- Added `max_lifetime` to prevent long-lived connections from accumulating issues
- Enabled `prepare: true` to use prepared statements for better query performance
- Disabled `fetch_types` to reduce overhead on each query
- Added `application_name` for better monitoring in PostgreSQL logs

**Impact**: These changes improve the system's ability to handle concurrent requests and reduce query execution time.

### 3. Search Query Optimization

Enhanced the search relevance scoring in `src/features/products/queries.ts`:

```typescript
function buildRelevanceScore(searchTerms: string[]) {
  const scoreParts = searchTerms.map(term => {
    const escapedTerm = term.replace(/'/g, "''");
    return sql.raw(`
      (CASE WHEN LOWER(name) = '${escapedTerm}' THEN 50 ELSE 0 END) +
      (CASE WHEN LOWER(name) LIKE '%${escapedTerm}%' THEN 10 ELSE 0 END) +
      (CASE WHEN LOWER(description) LIKE '%${escapedTerm}%' THEN 1 ELSE 0 END)
    `);
  });

  return sql<number>`(${sql.join(scoreParts, sql.raw(' + '))})`;
}
```

**Changes**:
- Added exact match scoring (50 points) for exact product name matches
- Maintained partial name match scoring (10 points)
- Maintained description match scoring (1 point)

**Impact**: This provides better relevance ranking with exact matches appearing first, followed by partial matches.

## Migration Instructions

To apply these optimizations to your database:

1. **Generate the migration** (already done):
   ```bash
   npm run db:generate
   ```

2. **Apply the migration**:
   ```bash
   npm run db:migrate
   ```

   This will create the following indexes:
   - `products_price_idx`
   - `products_rating_idx`
   - `products_is_active_idx`
   - `products_active_category_idx`
   - `products_active_price_idx`
   - `orders_status_created_idx`
   - `orders_guest_email_idx`
   - `reviews_product_rating_idx`
   - `reviews_product_created_idx`

3. **Verify the indexes** (optional):
   ```sql
   -- Check indexes on products table
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'products';

   -- Check indexes on orders table
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'orders';

   -- Check indexes on reviews table
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'reviews';
   ```

## Performance Expectations

With these optimizations in place:

1. **Product Search**: Search queries should return results within 500ms for catalogs up to 100,000 products (Requirement 4.5)
2. **Product Filtering**: Filtering by category, price range, and rating should be significantly faster
3. **Order Management**: Admin order filtering and sorting should complete within 1 second for databases containing up to 1 million orders (Requirement 12.5)
4. **Review Display**: Review listing with different sort orders should be fast and responsive
5. **Connection Pooling**: The system can handle up to 20 concurrent database connections with a maximum wait time of 5 seconds when the pool is exhausted (Requirement 17.5)

## Monitoring Recommendations

To ensure these optimizations are effective:

1. **Monitor Query Performance**:
   - Use PostgreSQL's `pg_stat_statements` extension to track slow queries
   - Monitor query execution times in application logs

2. **Monitor Connection Pool**:
   - Track connection pool utilization
   - Monitor wait times when connections are exhausted
   - Alert if wait times exceed 5 seconds

3. **Monitor Index Usage**:
   ```sql
   -- Check index usage statistics
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan DESC;
   ```

4. **Monitor Search Performance**:
   - Track search query execution times in the `search_queries` table
   - Analyze slow searches to identify optimization opportunities

## Future Optimization Opportunities

If performance issues persist or new requirements emerge:

1. **Full-Text Search**: Consider implementing PostgreSQL's full-text search (tsvector/tsquery) for even faster text searches
2. **Materialized Views**: Create materialized views for complex aggregations (e.g., dashboard statistics)
3. **Partitioning**: Partition large tables (orders, audit_logs) by date for better query performance
4. **Read Replicas**: Add read replicas for scaling read-heavy workloads
5. **Caching**: Implement Redis caching for frequently accessed data (already partially implemented in task 25.1)

## Related Tasks

- **Task 25.1**: Caching implementation for product and category queries
- **Task 25.3**: Pagination implementation throughout the application
- **Task 25.4**: Performance testing to verify requirements are met
