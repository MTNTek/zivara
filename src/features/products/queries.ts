import { db } from '@/db';
import { products, categories, searchQueries } from '@/db/schema';
import { eq, and, gte, lte, or, desc, asc, sql, ilike, inArray } from 'drizzle-orm';
import type { ProductWithDetails, ProductWithImages, Category, ProductQueryParams } from '@/types';

// Common stop words to filter out from search queries
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
  'that', 'these', 'those', 'it', 'its'
]);

/**
 * Process search query by removing stop words and splitting into terms
 */
function processSearchQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 0 && !STOP_WORDS.has(term));
}

/**
 * Build search conditions with relevance ranking
 * Prioritizes exact name matches over description matches
 * Optimized for performance with proper index usage
 */
function buildSearchConditions(searchTerms: string[]) {
  if (searchTerms.length === 0) return null;

  const conditions = [];
  
  // For each term, search in both name and description
  // Using ILIKE for case-insensitive search (PostgreSQL specific)
  for (const term of searchTerms) {
    conditions.push(
      or(
        ilike(products.name, `%${term}%`),
        ilike(products.description, `%${term}%`)
      )!
    );
  }

  return conditions;
}

/**
 * Calculate relevance score for search results
 * Higher score = more relevant (name matches prioritized)
 * Optimized to use indexes where possible
 */
function buildRelevanceScore(searchTerms: string[]) {
  if (searchTerms.length === 0) return sql<number>`0`;

  // Build SQL for relevance scoring
  // Name matches get higher weight (10) than description matches (1)
  // Exact matches get even higher weight (50)
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

/**
 * Get paginated products with optional filters and search
 */
export async function getProducts(params: ProductQueryParams = {}) {
  const {
    page = 1,
    limit = 24,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    search,
    sortBy = 'newest',
  } = params;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  
  conditions.push(eq(products.isActive, true));
  
  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }
  
  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice.toString()));
  }
  
  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice.toString()));
  }
  
  if (minRating !== undefined) {
    conditions.push(gte(products.averageRating, minRating.toString()));
  }

  // Process search query
  const searchTerms = search ? processSearchQuery(search) : [];
  const searchConditions = buildSearchConditions(searchTerms);
  
  if (searchConditions && searchConditions.length > 0) {
    // Add all search conditions (AND logic - all terms must match)
    conditions.push(and(...searchConditions)!);
  }

  // Build order by
  let orderBy;
  
  // If searching, sort by relevance first (unless explicitly sorted otherwise)
  if (searchTerms.length > 0 && sortBy === 'newest') {
    // Use relevance scoring for search results
    const relevanceScore = buildRelevanceScore(searchTerms);
    orderBy = [desc(relevanceScore), desc(products.createdAt)];
  } else {
    switch (sortBy) {
      case 'price-asc':
        orderBy = asc(products.price);
        break;
      case 'price-desc':
        orderBy = desc(products.price);
        break;
      case 'rating':
        orderBy = desc(products.averageRating);
        break;
      case 'newest':
      default:
        orderBy = desc(products.createdAt);
        break;
    }
  }

  // Execute query with search optimization
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const productList = await db.query.products.findMany({
    where: whereClause,
    orderBy,
    limit,
    offset,
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
      category: true,
      inventory: true,
    },
  });

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause);

  return {
    products: productList as ProductWithImages[],
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Get a single product by ID or slug with full details
 */
export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  // UUID v4 pattern check - if not a UUID, treat as slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const product = await db.query.products.findFirst({
    where: isUuid ? eq(products.id, id) : eq(products.slug, id),
    with: {
      category: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
      inventory: true,
    },
  });

  return product as ProductWithDetails | null;
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
      inventory: true,
    },
  });

  return product as ProductWithDetails | null;
}

/**
 * Get products by category (including subcategories)
 */
export async function getProductsByCategory(
  categoryId: string,
  params: { page?: number; limit?: number; sortBy?: string; minPrice?: number; maxPrice?: number; minRating?: number; search?: string } = {}
) {
  const { page = 1, limit = 24, sortBy = 'newest' } = params;
  
  // Get category and all its subcategories
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
    with: {
      children: {
        with: {
          children: true, // Support up to 3 levels
        },
      },
    },
  });

  if (!category) {
    return {
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Collect all category IDs (current + children + grandchildren)
  const categoryIds = [category.id];
  category.children.forEach((child) => {
    categoryIds.push(child.id);
    if (child.children) {
      child.children.forEach((grandchild) => {
        categoryIds.push(grandchild.id);
      });
    }
  });

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  
  conditions.push(eq(products.isActive, true));
  conditions.push(inArray(products.categoryId, categoryIds));
  
  if (params.minPrice !== undefined) {
    conditions.push(gte(products.price, params.minPrice.toString()));
  }
  
  if (params.maxPrice !== undefined) {
    conditions.push(lte(products.price, params.maxPrice.toString()));
  }
  
  if (params.minRating !== undefined) {
    conditions.push(gte(products.averageRating, params.minRating.toString()));
  }

  // Process search query
  const searchTerms = params.search ? processSearchQuery(params.search) : [];
  const searchConditions = buildSearchConditions(searchTerms);
  
  if (searchConditions && searchConditions.length > 0) {
    conditions.push(and(...searchConditions)!);
  }

  // Build order by
  let orderBy;
  
  if (searchTerms.length > 0 && sortBy === 'newest') {
    const relevanceScore = buildRelevanceScore(searchTerms);
    orderBy = [desc(relevanceScore), desc(products.createdAt)];
  } else {
    switch (sortBy) {
      case 'price-asc':
        orderBy = asc(products.price);
        break;
      case 'price-desc':
        orderBy = desc(products.price);
        break;
      case 'rating':
        orderBy = desc(products.averageRating);
        break;
      case 'newest':
      default:
        orderBy = desc(products.createdAt);
        break;
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const productList = await db.query.products.findMany({
    where: whereClause,
    orderBy,
    limit,
    offset,
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
      category: true,
      inventory: true,
    },
  });

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause);

  return {
    products: productList as ProductWithImages[],
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.displayOrder), asc(categories.name)],
  });
}

/**
 * Get category by ID with children
 */
export async function getCategoryById(id: string) {
  // Use direct SQL query to avoid relation ambiguity
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!category) {
    return null;
  }

  // Fetch children separately
  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, category.id))
    .orderBy(categories.displayOrder);

  return {
    ...category,
    children,
  };
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  // Use direct SQL query to avoid relation ambiguity
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    return null;
  }

  // Fetch children separately
  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, category.id))
    .orderBy(categories.displayOrder);

  return {
    ...category,
    children,
  };
}

/**
 * Get category hierarchy (for navigation)
 */
export async function getCategoryHierarchy() {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.displayOrder), asc(categories.name)],
  });

  // Build tree structure
  const categoryMap = new Map<string, Category & { children: Category[] }>();
  const rootCategories: (Category & { children: Category[] })[] = [];

  // First pass: create map
  allCategories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build tree
  allCategories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

/**
 * Check if a product exists
 */
export async function productExists(id: string): Promise<boolean> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    columns: { id: true },
  });
  return !!product;
}

/**
 * Check if a category exists
 */
export async function categoryExists(id: string): Promise<boolean> {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    columns: { id: true },
  });
  return !!category;
}

/**
 * Get category depth (for hierarchy validation)
 */
export async function getCategoryDepth(categoryId: string): Promise<number> {
  let depth = 0;
  let currentId: string | null = categoryId;

  while (currentId && depth < 10) { // Safety limit
    const category: { parentId: string | null } | undefined = await db.query.categories.findFirst({
      where: eq(categories.id, currentId),
      columns: { parentId: true },
    });

    if (!category) break;
    
    if (category.parentId) {
      depth++;
      currentId = category.parentId;
    } else {
      break;
    }
  }

  return depth;
}

/**
 * Log a search query for analytics
 */
export async function logSearchQuery(
  query: string,
  resultsCount: number,
  executionTimeMs: number,
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    await db.insert(searchQueries).values({
      query: query.trim(),
      userId,
      sessionId,
      resultsCount,
      executionTimeMs,
    });
  } catch (error) {
    // Don't fail the search if logging fails
    console.error('Failed to log search query:', error);
  }
}

/**
 * Get popular search suggestions based on logged queries
 * Returns the most frequently searched terms from the last 30 days
 */
export async function getSearchSuggestions(limit: number = 10): Promise<string[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const results = await db
    .select({
      query: searchQueries.query,
      count: sql<number>`count(*)::int`,
    })
    .from(searchQueries)
    .where(
      and(
        gte(searchQueries.createdAt, thirtyDaysAgo),
        gte(searchQueries.resultsCount, 1) // Only include searches that returned results
      )
    )
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return results.map(r => r.query);
}

/**
 * Get search suggestions matching a partial query
 */
export async function getSearchSuggestionsForQuery(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) {
    return [];
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const results = await db
    .select({
      query: searchQueries.query,
      count: sql<number>`count(*)::int`,
    })
    .from(searchQueries)
    .where(
      and(
        ilike(searchQueries.query, `${partialQuery}%`),
        gte(searchQueries.createdAt, thirtyDaysAgo),
        gte(searchQueries.resultsCount, 1)
      )
    )
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return results.map(r => r.query);
}

/**
 * Enhanced getProducts with search logging
 */
export async function searchProducts(
  params: ProductQueryParams,
  userId?: string,
  sessionId?: string
) {
  const startTime = Date.now();
  const result = await getProducts(params);
  const executionTime = Date.now() - startTime;

  // Log search query if search term was provided
  if (params.search) {
    await logSearchQuery(
      params.search,
      result.total,
      executionTime,
      userId,
      sessionId
    );
  }

  return result;
}
