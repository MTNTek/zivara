# Product and Category Caching Implementation

## Overview

This implementation adds caching to product and category queries using Next.js `unstable_cache` with 5-minute revalidation periods, as specified in Requirement 17.4.

## Architecture

### Cache Utilities (`src/lib/cache.ts`)

The cache utility module provides:

- **Cache Tags**: Organized tags for different data types (products, categories, search)
- **Cache Times**: Configurable revalidation periods (5 minutes for products and categories)
- **Invalidation Functions**: Helper functions to invalidate caches when data changes

### Cached Queries (`src/features/products/cached-queries.ts`)

Cached versions of all product and category query functions:

- `getProducts()` - Cached product listing with filters
- `getProductById()` - Cached individual product lookup
- `getProductBySlug()` - Cached product lookup by slug
- `getProductsByCategory()` - Cached category product listing
- `getCategories()` - Cached category list
- `getCategoryById()` - Cached individual category lookup
- `getCategoryBySlug()` - Cached category lookup by slug
- `getCategoryHierarchy()` - Cached category tree structure

Each cached function:
- Uses `unstable_cache` with appropriate cache keys
- Tags caches for selective invalidation
- Revalidates every 5 minutes (300 seconds)

## Cache Invalidation

Cache invalidation is automatically triggered on all mutations:

### Product Mutations
- `createProduct()` - Invalidates product caches
- `updateProduct()` - Invalidates specific product and general product caches
- `deleteProduct()` - Invalidates specific product and general product caches
- `restoreProduct()` - Invalidates specific product and general product caches
- `bulkUpdateProducts()` - Invalidates each affected product cache
- `updateProductPrice()` - Invalidates specific product cache
- `updateProductDiscount()` - Invalidates specific product cache
- `uploadProductImage()` - Invalidates specific product cache
- `deleteProductImage()` - Invalidates specific product cache
- `setPrimaryImage()` - Invalidates specific product cache
- `reorderProductImages()` - Invalidates specific product cache
- `updateImageAltText()` - Invalidates specific product cache

### Category Mutations
- `createCategory()` - Invalidates category and product caches
- `updateCategory()` - Invalidates specific category, general category, and product caches
- `deleteCategory()` - Invalidates specific category, general category, and product caches
- `reorderCategories()` - Invalidates each affected category cache

## Cache Tags

The following cache tags are used:

- `products` - All product listings
- `product:{id}` - Specific product by ID
- `categories` - All category listings
- `category:{id}` - Specific category by ID
- `product-search` - Product search results

## Usage

### In Server Components

```typescript
import { getProducts, getCategories } from '@/features/products/cached-queries';

// This will be cached for 5 minutes
const { products } = await getProducts({ page: 1, limit: 24 });
const categories = await getCategories();
```

### In Server Actions

```typescript
import { invalidateProductCache } from '@/lib/cache';

// After updating a product
await updateProduct(data);
invalidateProductCache(productId); // Invalidates all related caches
```

## Benefits

1. **Performance**: Reduces database queries by caching frequently accessed data
2. **Scalability**: Handles high traffic by serving cached responses
3. **Consistency**: Automatic cache invalidation ensures data stays fresh
4. **Flexibility**: 5-minute revalidation balances freshness with performance

## Testing

Tests are provided in:
- `src/lib/cache.test.ts` - Tests cache invalidation functions
- `src/features/products/cached-queries.test.ts` - Tests cached query functions

Run tests with:
```bash
npm test -- src/lib/cache.test.ts src/features/products/cached-queries.test.ts
```

## Requirements Satisfied

- ✅ Requirement 17.4: Cache Category and Product data for 5 minutes to reduce Database queries
- ✅ Cache invalidation on mutations ensures data consistency
- ✅ Uses Next.js `unstable_cache` for server-side caching
- ✅ Proper cache segmentation with unique keys per query parameters
