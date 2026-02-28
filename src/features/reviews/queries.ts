import { db } from '@/db';
import { reviews, users, orderItems, orders } from '@/db/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';

export type ReviewSortOption = 'recent' | 'highest' | 'lowest';

export interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
  };
}

export interface ReviewsResult {
  reviews: ReviewWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get reviews for a product with pagination and sorting
 * Validates: Requirements 8.4, 24.1-24.7
 * 
 * @param productId - ID of the product
 * @param options - Pagination and sorting options
 * @returns Reviews with pagination metadata
 */
export async function getProductReviews(
  productId: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: ReviewSortOption;
  }
): Promise<ReviewsResult> {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 10; // Requirement 24.2: 10 reviews per page
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy || 'recent';

    // Determine sort order (Requirement 24.3)
    let orderBy;
    switch (sortBy) {
      case 'highest':
        orderBy = [desc(reviews.rating), desc(reviews.createdAt)];
        break;
      case 'lowest':
        orderBy = [asc(reviews.rating), desc(reviews.createdAt)];
        break;
      case 'recent':
      default:
        orderBy = [desc(reviews.createdAt)];
        break;
    }

    // Get reviews with user information (Requirements 24.4, 24.5, 24.6)
    const productReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
      orderBy,
      limit,
      offset,
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    return {
      reviews: productReviews as ReviewWithUser[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return {
      reviews: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get a specific review by ID
 * 
 * @param reviewId - ID of the review
 * @returns Review with user information or null
 */
export async function getReviewById(
  reviewId: string
): Promise<ReviewWithUser | null> {
  try {
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
    });

    return review as ReviewWithUser | null;
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
}

/**
 * Get a user's review for a specific product
 * 
 * @param userId - ID of the user
 * @param productId - ID of the product
 * @returns Review or null if not found
 */
export async function getUserReviewForProduct(
  userId: string,
  productId: string
): Promise<ReviewWithUser | null> {
  try {
    const review = await db.query.reviews.findFirst({
      where: sql`${reviews.userId} = ${userId} AND ${reviews.productId} = ${productId}`,
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
    });

    return review as ReviewWithUser | null;
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
}

/**
 * Get all reviews by a user
 * 
 * @param userId - ID of the user
 * @param options - Pagination options
 * @returns User's reviews with pagination
 */
export async function getUserReviews(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<ReviewsResult> {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const userReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: [desc(reviews.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    return {
      reviews: userReviews as ReviewWithUser[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return {
      reviews: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Check if a user has purchased a product
 * 
 * @param userId - ID of the user
 * @param productId - ID of the product
 * @returns True if user has purchased the product
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const purchase = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.productId, productId),
          eq(orders.userId, userId)
        )
      )
      .limit(1);

    return purchase.length > 0;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
}
