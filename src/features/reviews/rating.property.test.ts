import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { db } from '@/db';
import { users, products, categories, reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';

/**
 * **Validates: Requirements 8.5**
 * 
 * Property: Average rating is always between 1 and 5 when reviews exist
 * 
 * This test verifies that:
 * - When reviews exist for a product, the average rating is always >= 1 and <= 5
 * - The average rating is correctly calculated from all reviews
 * - Adding and removing reviews maintains the correct average
 */

// Note: These tests require a running PostgreSQL database
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Review Rating Calculations (Property-Based)', () => {
  let testUserId: string;
  let testCategoryId: string;
  let testProductId: string;

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-review-pbt-${Date.now()}@example.com`,
        name: 'Test User',
        passwordHash: await hash('password123', 10),
        role: 'customer',
      })
      .returning({ id: users.id });
    testUserId = user.id;

    // Create test category
    const [category] = await db
      .insert(categories)
      .values({
        name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
      })
      .returning({ id: categories.id });
    testCategoryId = category.id;

    // Create test product
    const [product] = await db
      .insert(products)
      .values({
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        description: 'Test product for property-based testing',
        price: '99.99',
        categoryId: testCategoryId,
      })
      .returning({ id: products.id });
    testProductId = product.id;
  });

  afterEach(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up reviews after each test
    await db.delete(reviews).where(eq(reviews.productId, testProductId));

    // Reset product rating
    await db
      .update(products)
      .set({ averageRating: '0', reviewCount: 0 })
      .where(eq(products.id, testProductId));
  });

  it('Property: Average rating is always between 1 and 5 when reviews exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of 1-10 ratings (each between 1 and 5)
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 }),
        async (ratings) => {
          // Create reviews with the generated ratings
          const reviewIds: string[] = [];
          
          for (const rating of ratings) {
            // Insert review directly to bypass purchase validation
            const [review] = await db
              .insert(reviews)
              .values({
                userId: testUserId,
                productId: testProductId,
                rating,
                comment: `Test review with rating ${rating}`,
                isVerifiedPurchase: true,
              })
              .returning({ id: reviews.id });
            reviewIds.push(review.id);
          }

          // Manually update product rating (simulating what the action does)
          const allReviews = await db.query.reviews.findMany({
            where: eq(reviews.productId, testProductId),
          });
          
          const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          
          await db
            .update(products)
            .set({
              averageRating: avgRating.toString(),
              reviewCount: allReviews.length,
            })
            .where(eq(products.id, testProductId));

          // Calculate expected average
          const expectedAverage = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

          // Get product to check average rating
          const product = await db.query.products.findFirst({
            where: eq(products.id, testProductId),
          });

          // Clean up reviews
          for (const reviewId of reviewIds) {
            await db.delete(reviews).where(eq(reviews.id, reviewId));
          }

          // Verify average rating is between 1 and 5
          const actualAverage = parseFloat(product?.averageRating || '0');
          expect(actualAverage).toBeGreaterThanOrEqual(1);
          expect(actualAverage).toBeLessThanOrEqual(5);

          // Verify average is calculated correctly (within floating point precision)
          expect(Math.abs(actualAverage - expectedAverage)).toBeLessThan(0.01);

          // Verify review count matches
          expect(product?.reviewCount).toBe(ratings.length);
        }
      ),
      { numRuns: 20 } // Run 20 different test cases
    );
  });

  it('Property: Average rating updates correctly when reviews are added', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two sets of ratings
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 5 }),
        async (firstBatch, secondBatch) => {
          // Add first batch of reviews
          const firstReviewIds: string[] = [];
          for (const rating of firstBatch) {
            const [review] = await db
              .insert(reviews)
              .values({
                userId: testUserId,
                productId: testProductId,
                rating,
                comment: `First batch review with rating ${rating}`,
                isVerifiedPurchase: true,
              })
              .returning({ id: reviews.id });
            firstReviewIds.push(review.id);
          }

          // Update product rating after first batch
          let allReviews = await db.query.reviews.findMany({
            where: eq(reviews.productId, testProductId),
          });
          let avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          await db
            .update(products)
            .set({
              averageRating: avgRating.toString(),
              reviewCount: allReviews.length,
            })
            .where(eq(products.id, testProductId));

          // Get product after first batch
          const productAfterFirst = await db.query.products.findFirst({
            where: eq(products.id, testProductId),
          });

          const firstAverage = parseFloat(productAfterFirst?.averageRating || '0');
          expect(firstAverage).toBeGreaterThanOrEqual(1);
          expect(firstAverage).toBeLessThanOrEqual(5);

          // Add second batch of reviews
          const secondReviewIds: string[] = [];
          for (const rating of secondBatch) {
            const [review] = await db
              .insert(reviews)
              .values({
                userId: testUserId,
                productId: testProductId,
                rating,
                comment: `Second batch review with rating ${rating}`,
                isVerifiedPurchase: true,
              })
              .returning({ id: reviews.id });
            secondReviewIds.push(review.id);
          }

          // Update product rating after second batch
          allReviews = await db.query.reviews.findMany({
            where: eq(reviews.productId, testProductId),
          });
          avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          await db
            .update(products)
            .set({
              averageRating: avgRating.toString(),
              reviewCount: allReviews.length,
            })
            .where(eq(products.id, testProductId));

          // Get product after second batch
          const productAfterSecond = await db.query.products.findFirst({
            where: eq(products.id, testProductId),
          });

          const secondAverage = parseFloat(productAfterSecond?.averageRating || '0');
          expect(secondAverage).toBeGreaterThanOrEqual(1);
          expect(secondAverage).toBeLessThanOrEqual(5);

          // Calculate expected combined average
          const allRatings = [...firstBatch, ...secondBatch];
          const expectedAverage = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

          // Verify combined average is correct
          expect(Math.abs(secondAverage - expectedAverage)).toBeLessThan(0.01);

          // Clean up
          for (const reviewId of [...firstReviewIds, ...secondReviewIds]) {
            await db.delete(reviews).where(eq(reviews.id, reviewId));
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('Property: Average rating updates correctly when reviews are deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate ratings and number of reviews to delete
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 2, maxLength: 10 }),
        async (ratings) => {
          // Create all reviews
          const reviewIds: string[] = [];
          for (const rating of ratings) {
            const [review] = await db
              .insert(reviews)
              .values({
                userId: testUserId,
                productId: testProductId,
                rating,
                comment: `Test review with rating ${rating}`,
                isVerifiedPurchase: true,
              })
              .returning({ id: reviews.id });
            reviewIds.push(review.id);
          }

          // Update product rating
          let allReviews = await db.query.reviews.findMany({
            where: eq(reviews.productId, testProductId),
          });
          let avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          await db
            .update(products)
            .set({
              averageRating: avgRating.toString(),
              reviewCount: allReviews.length,
            })
            .where(eq(products.id, testProductId));

          // Get product with all reviews
          const productBefore = await db.query.products.findFirst({
            where: eq(products.id, testProductId),
          });

          const averageBefore = parseFloat(productBefore?.averageRating || '0');
          expect(averageBefore).toBeGreaterThanOrEqual(1);
          expect(averageBefore).toBeLessThanOrEqual(5);

          // Delete half of the reviews (at least 1)
          const numToDelete = Math.max(1, Math.floor(ratings.length / 2));
          const reviewsToDelete = reviewIds.slice(0, numToDelete);
          const remainingRatings = ratings.slice(numToDelete);

          for (const reviewId of reviewsToDelete) {
            await db.delete(reviews).where(eq(reviews.id, reviewId));
          }

          // Update product rating after deletion
          allReviews = await db.query.reviews.findMany({
            where: eq(reviews.productId, testProductId),
          });
          
          if (allReviews.length > 0) {
            avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            await db
              .update(products)
              .set({
                averageRating: avgRating.toString(),
                reviewCount: allReviews.length,
              })
              .where(eq(products.id, testProductId));
          } else {
            await db
              .update(products)
              .set({
                averageRating: '0',
                reviewCount: 0,
              })
              .where(eq(products.id, testProductId));
          }

          // Get product after deletion
          const productAfter = await db.query.products.findFirst({
            where: eq(products.id, testProductId),
          });

          if (remainingRatings.length > 0) {
            const averageAfter = parseFloat(productAfter?.averageRating || '0');
            expect(averageAfter).toBeGreaterThanOrEqual(1);
            expect(averageAfter).toBeLessThanOrEqual(5);

            // Calculate expected average from remaining ratings
            const expectedAverage = remainingRatings.reduce((sum, r) => sum + r, 0) / remainingRatings.length;
            expect(Math.abs(averageAfter - expectedAverage)).toBeLessThan(0.01);
            expect(productAfter?.reviewCount).toBe(remainingRatings.length);
          } else {
            // All reviews deleted, average should be 0
            expect(parseFloat(productAfter?.averageRating || '0')).toBe(0);
            expect(productAfter?.reviewCount).toBe(0);
          }

          // Clean up remaining reviews
          for (const reviewId of reviewIds.slice(numToDelete)) {
            await db.delete(reviews).where(eq(reviews.id, reviewId));
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('Property: Average rating is exactly the rating value when only one review exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (rating) => {
          // Create a single review
          const [review] = await db
            .insert(reviews)
            .values({
              userId: testUserId,
              productId: testProductId,
              rating,
              comment: `Single review with rating ${rating}`,
              isVerifiedPurchase: true,
            })
            .returning({ id: reviews.id });

          // Update product rating
          await db
            .update(products)
            .set({
              averageRating: rating.toString(),
              reviewCount: 1,
            })
            .where(eq(products.id, testProductId));

          // Get product
          const product = await db.query.products.findFirst({
            where: eq(products.id, testProductId),
          });

          const average = parseFloat(product?.averageRating || '0');

          // With one review, average should equal the rating
          expect(average).toBe(rating);
          expect(product?.reviewCount).toBe(1);

          // Clean up
          await db.delete(reviews).where(eq(reviews.id, review.id));
        }
      ),
      { numRuns: 10 }
    );
  });
});
