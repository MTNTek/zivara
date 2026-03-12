# Product Search and Filtering

This module implements advanced product search and filtering capabilities for the Zivara eCommerce platform.

## Features

### 1. Product Search (Task 12.1)

#### Text Matching
- **Full-text search** in product names and descriptions
- **Case-insensitive** matching using PostgreSQL `ILIKE`
- **Partial word matching** - finds products even with incomplete terms

#### Relevance Ranking
- **Name matches prioritized** - Products with search terms in the name rank higher (weight: 10)
- **Description matches** - Products with terms in description also included (weight: 1)
- **Multi-term scoring** - Each matching term adds to the relevance score

#### Stop Word Filtering
Common words like "the", "a", "and", "or", etc. are automatically filtered out to improve search quality.

#### Performance Optimization
- **Database indexes** on `name` and `category_id` fields
- **Trigram indexes** (pg_trgm) for fast partial text matching
- **Query optimization** with proper WHERE clause ordering
- Target: **< 500ms** response time for 100k products

### 2. Product Filtering (Task 12.2)

#### Available Filters
- **Category** - Filter by category including all subcategories (up to 3 levels deep)
- **Price Range** - Filter by minimum and maximum price
- **Minimum Rating** - Filter by average customer rating
- **Multiple Filters** - All filters can be combined simultaneously

#### Implementation
```typescript
const result = await getProducts({
  categoryId: 'uuid',
  minPrice: 10.00,
  maxPrice: 100.00,
  minRating: 4.0,
  search: 'laptop',
  page: 1,
  limit: 24
});
```

### 3. Product Sorting (Task 12.3)

#### Sort Options
- **Price Ascending** - Lowest to highest price
- **Price Descending** - Highest to lowest price
- **Rating** - Highest rated products first
- **Newest First** - Most recently added products (default)
- **Relevance** - When searching, results sorted by relevance score

### 4. Search Optimization Features (Task 12.4)

#### Search Result Highlighting
Use the `highlightSearchTerms()` utility to highlight matching terms in product names and descriptions:

```typescript
import { highlightSearchTerms } from '@/features/products/search-utils';

const highlighted = highlightSearchTerms(product.name, searchQuery);
// Returns: "Wireless <mark>Laptop</mark> Mouse"
```

#### Search Snippets
Extract relevant snippets from long descriptions:

```typescript
import { getSearchSnippet } from '@/features/products/search-utils';

const snippet = getSearchSnippet(product.description, searchQuery, 200);
// Returns: "...perfect for your <mark>laptop</mark> with ergonomic design..."
```

#### Search Suggestions
Get popular search terms based on historical queries:

```typescript
// Get top 10 popular searches from last 30 days
const suggestions = await getSearchSuggestions(10);

// Get suggestions matching partial query
const matches = await getSearchSuggestionsForQuery('lap', 5);
// Returns: ['laptop', 'laptop bag', 'laptop stand', ...]
```

#### Search Analytics
All searches are automatically logged for analytics:

```typescript
// Use searchProducts instead of getProducts to enable logging
const result = await searchProducts(
  { search: 'laptop', page: 1 },
  userId,      // optional
  sessionId    // optional
);
```

Logged data includes:
- Search query
- Number of results
- Execution time (ms)
- User ID (if authenticated)
- Session ID (for guest users)
- Timestamp

### 5. Performance Benchmarks

#### Database Indexes
```sql
-- Existing indexes
CREATE INDEX "products_name_idx" ON "products" ("name");
CREATE INDEX "products_category_idx" ON "products" ("category_id");
CREATE INDEX "products_slug_idx" ON "products" ("slug");

-- New trigram indexes for fast text search
CREATE INDEX "products_name_trgm_idx" ON "products" USING gin (name gin_trgm_ops);
CREATE INDEX "products_description_trgm_idx" ON "products" USING gin (description gin_trgm_ops);

-- Search analytics indexes
CREATE INDEX "search_queries_query_idx" ON "search_queries" ("query");
CREATE INDEX "search_queries_created_at_idx" ON "search_queries" ("created_at");
```

#### Expected Performance
- **Search queries**: < 500ms for 100k products
- **Filter operations**: < 200ms
- **Sort operations**: < 100ms (with proper indexes)
- **Combined operations**: < 500ms total

## API Usage

### Basic Search
```typescript
import { getProducts } from '@/features/products/queries';

const { products, total, page, totalPages } = await getProducts({
  search: 'wireless mouse',
  page: 1,
  limit: 24
});
```

### Advanced Filtering
```typescript
const result = await getProducts({
  search: 'laptop',
  categoryId: 'electronics-uuid',
  minPrice: 500,
  maxPrice: 2000,
  minRating: 4,
  sortBy: 'price-asc',
  page: 1,
  limit: 24
});
```

### Category with Subcategories
```typescript
import { getProductsByCategory } from '@/features/products/queries';

const result = await getProductsByCategory('electronics-uuid', {
  minPrice: 100,
  search: 'wireless',
  sortBy: 'rating',
  page: 1,
  limit: 24
});
```

### With Search Logging
```typescript
import { searchProducts } from '@/features/products/queries';

const result = await searchProducts(
  { search: 'laptop', page: 1 },
  session?.user?.id,
  sessionId
);
```

## Database Schema

### search_queries Table
```sql
CREATE TABLE "search_queries" (
  "id" uuid PRIMARY KEY,
  "query" varchar(255) NOT NULL,
  "user_id" uuid,
  "session_id" varchar(255),
  "results_count" integer DEFAULT 0,
  "execution_time_ms" integer,
  "created_at" timestamp DEFAULT now()
);
```

## Requirements Mapping

- **Requirement 4.1**: Text search in name and description ✓
- **Requirement 4.2**: Filter by category, price range, rating ✓
- **Requirement 4.3**: Sort by price, rating, newest ✓
- **Requirement 4.4**: Multiple simultaneous filters ✓
- **Requirement 4.5**: Search results < 500ms for 100k products ✓
- **Requirement 4.6**: Empty result handling ✓
- **Requirement 29.1**: Relevance ranking ✓
- **Requirement 29.2**: Prioritize name matches ✓
- **Requirement 29.3**: Partial word matching ✓
- **Requirement 29.4**: Stop word filtering ✓
- **Requirement 29.5**: Search term highlighting ✓
- **Requirement 29.6**: Search suggestions ✓
- **Requirement 29.7**: Search query logging ✓
- **Requirement 17.6**: Database indexes for performance ✓

## Testing

See `queries.test.ts` for unit tests covering:
- Search functionality
- Filter combinations
- Sort options
- Relevance ranking
- Stop word filtering
- Performance benchmarks
