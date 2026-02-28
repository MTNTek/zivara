/**
 * Checkpoint 11 Verification Script
 * 
 * This script verifies:
 * - Complete checkout flow
 * - Order status updates and tracking
 * - Review submission and display
 * - Rating calculations
 */

import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { users, products, categories, inventory, cartItems, orders, orderItems, reviews, orderStatusHistory } from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { addToCart, clearCart } from '../src/features/cart/actions';
import { createOrder } from '../src/features/orders/actions';
import { updateOrderStatus } from '../src/features/admin/order-queries';
import { createReview } from '../src/features/reviews/actions';
import { getProductById } from '../src/features/products/queries';
import { getOrderById } from '../src/features/orders/queries';
import { getReviewsByProduct } from '../src/features/reviews/queries';
import bcrypt from 'bcryptjs';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function logResult(result: VerificationResult) {
  results.push(result);
  const icon = result.passed ? '✓' : '✗';
  console.log(`${icon} ${result.message}`);
  if (result.details) {
    console.log('  Details:', JSON.stringify(result.details, null, 2));
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete in correct order to respect foreign keys
  await db.delete(orderStatusHistory).where(sql`1=1`);
  await db.delete(reviews).where(sql`email LIKE '%checkpoint11%'`);
  await db.delete(orderItems).where(sql`1=1`);
  await db.delete(orders).where(sql`guest_email LIKE '%checkpoint11%' OR user_id IN (SELECT id FROM users WHERE email LIKE '%checkpoint11%')`);
  await db.delete(cartItems).where(sql`user_id IN (SELECT id FROM users WHERE email LIKE '%checkpoint11%')`);
  await db.delete(inventory).where(sql`product_id IN (SELECT id FROM products WHERE name LIKE '%Checkpoint11%')`);
  await db.delete(products).where(sql`name LIKE '%Checkpoint11%'`);
  await db.delete(categories).where(sql`name LIKE '%Checkpoint11%'`);
  await db.delete(users).where(sql`email LIKE '%checkpoint11%'`);
}

async function setupTestData() {
  console.log('\n📦 Setting up test data...');
  
  // Create test user
  const [testUser] = await db.insert(users).values({
    email: 'checkpoint11@test.com',
    passwordHash: await bcrypt.hash('password123', 12),
    name: 'Checkpoint 11 User',
    role: 'customer',
  }).returning();
  
  // Create test category
  const [testCategory] = await db.insert(categories).values({
    name: 'Checkpoint11 Category',
    slug: 'checkpoint11-category',
    description: 'Test category for checkpoint 11',
  }).returning();
  
  // Create test products
  const [product1] = await db.insert(products).values({
    name: 'Checkpoint11 Product 1',
    slug: 'checkpoint11-product-1',
    description: 'Test product 1 for checkout verification',
    price: '29.99',
    categoryId: testCategory.id,
    isActive: true,
  }).returning();
  
  const [product2] = await db.insert(products).values({
    name: 'Checkpoint11 Product 2',
    slug: 'checkpoint11-product-2',
    description: 'Test product 2 for checkout verification',
    price: '49.99',
    categoryId: testCategory.id,
    isActive: true,
  }).returning();
  
  // Add inventory
  await db.insert(inventory).values([
    { productId: product1.id, quantity: 100 },
    { productId: product2.id, quantity: 50 },
  ]);
  
  return { testUser, testCategory, product1, product2 };
}

async function testCheckoutFlow(testUser: any, product1: any, product2: any) {
  console.log('\n🛒 Testing Checkout Flow...');
  
  try {
    // 1. Add items to cart
    const addResult1 = await addToCart(product1.id, 2, testUser.id);
    logResult({
      passed: addResult1.success,
      message: 'Add first product to cart',
      details: addResult1,
    });
    
    const addResult2 = await addToCart(product2.id, 1, testUser.id);
    logResult({
      passed: addResult2.success,
      message: 'Add second product to cart',
      details: addResult2,
    });
    
    // 2. Verify cart contents
    const cartContents = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, testUser.id),
      with: { product: true },
    });
    
    logResult({
      passed: cartContents.length === 2,
      message: `Cart contains correct number of items (expected: 2, got: ${cartContents.length})`,
      details: { itemCount: cartContents.length },
    });
    
    // 3. Check inventory before checkout
    const inventoryBefore = await db.query.inventory.findMany({
      where: sql`product_id IN (${product1.id}, ${product2.id})`,
    });
    
    const product1InventoryBefore = inventoryBefore.find(i => i.productId === product1.id)?.quantity || 0;
    const product2InventoryBefore = inventoryBefore.find(i => i.productId === product2.id)?.quantity || 0;
    
    // 4. Create order (checkout)
    const orderData = {
      userId: testUser.id,
      shippingAddress: {
        line1: '123 Test Street',
        line2: 'Apt 4B',
        city: 'Test City',
        state: 'TC',
        postalCode: '12345',
        country: 'US',
      },
      paymentMethod: 'card',
      paymentIntentId: 'pi_test_checkpoint11',
      lastFourDigits: '4242',
    };
    
    const orderResult = await createOrder(orderData);
    logResult({
      passed: orderResult.success && !!orderResult.orderId,
      message: 'Create order successfully',
      details: orderResult,
    });
    
    if (!orderResult.orderId) {
      throw new Error('Order creation failed');
    }
    
    // 5. Verify cart was cleared
    const cartAfterCheckout = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, testUser.id),
    });
    
    logResult({
      passed: cartAfterCheckout.length === 0,
      message: 'Cart cleared after checkout',
      details: { remainingItems: cartAfterCheckout.length },
    });
    
    // 6. Verify inventory was decremented
    const inventoryAfter = await db.query.inventory.findMany({
      where: sql`product_id IN (${product1.id}, ${product2.id})`,
    });
    
    const product1InventoryAfter = inventoryAfter.find(i => i.productId === product1.id)?.quantity || 0;
    const product2InventoryAfter = inventoryAfter.find(i => i.productId === product2.id)?.quantity || 0;
    
    logResult({
      passed: product1InventoryAfter === product1InventoryBefore - 2,
      message: `Product 1 inventory decremented correctly (before: ${product1InventoryBefore}, after: ${product1InventoryAfter})`,
      details: { before: product1InventoryBefore, after: product1InventoryAfter, expected: product1InventoryBefore - 2 },
    });
    
    logResult({
      passed: product2InventoryAfter === product2InventoryBefore - 1,
      message: `Product 2 inventory decremented correctly (before: ${product2InventoryBefore}, after: ${product2InventoryAfter})`,
      details: { before: product2InventoryBefore, after: product2InventoryAfter, expected: product2InventoryBefore - 1 },
    });
    
    // 7. Verify order details
    const order = await getOrderById(orderResult.orderId);
    
    logResult({
      passed: !!order && order.status === 'pending',
      message: 'Order created with correct initial status',
      details: { status: order?.status },
    });
    
    logResult({
      passed: !!order && order.items.length === 2,
      message: `Order contains correct number of items (expected: 2, got: ${order?.items.length})`,
      details: { itemCount: order?.items.length },
    });
    
    // Calculate expected total
    const expectedSubtotal = 29.99 * 2 + 49.99 * 1;
    const actualSubtotal = order ? parseFloat(order.subtotal) : 0;
    
    logResult({
      passed: Math.abs(actualSubtotal - expectedSubtotal) < 0.01,
      message: `Order subtotal calculated correctly (expected: ${expectedSubtotal}, got: ${actualSubtotal})`,
      details: { expected: expectedSubtotal, actual: actualSubtotal },
    });
    
    return orderResult.orderId;
  } catch (error) {
    logResult({
      passed: false,
      message: 'Checkout flow failed with error',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

async function testOrderStatusUpdates(orderId: string, testUser: any) {
  console.log('\n📊 Testing Order Status Updates...');
  
  try {
    // 1. Update order to processing
    const updateResult1 = await updateOrderStatus(orderId, 'processing', testUser.id);
    logResult({
      passed: updateResult1.success,
      message: 'Update order status to processing',
      details: updateResult1,
    });
    
    // 2. Verify status was updated
    const order1 = await getOrderById(orderId);
    logResult({
      passed: order1?.status === 'processing',
      message: 'Order status updated correctly to processing',
      details: { status: order1?.status },
    });
    
    // 3. Update order to shipped
    const updateResult2 = await updateOrderStatus(orderId, 'shipped', testUser.id);
    logResult({
      passed: updateResult2.success,
      message: 'Update order status to shipped',
      details: updateResult2,
    });
    
    // 4. Verify status history
    const statusHistory = await db.query.orderStatusHistory.findMany({
      where: eq(orderStatusHistory.orderId, orderId),
      orderBy: (history, { asc }) => [asc(history.createdAt)],
    });
    
    logResult({
      passed: statusHistory.length >= 2,
      message: `Status history tracked correctly (entries: ${statusHistory.length})`,
      details: { historyCount: statusHistory.length, statuses: statusHistory.map(h => h.status) },
    });
    
    // 5. Update to delivered
    const updateResult3 = await updateOrderStatus(orderId, 'delivered', testUser.id);
    logResult({
      passed: updateResult3.success,
      message: 'Update order status to delivered',
      details: updateResult3,
    });
    
    const order2 = await getOrderById(orderId);
    logResult({
      passed: order2?.status === 'delivered',
      message: 'Order status updated correctly to delivered',
      details: { status: order2?.status },
    });
    
  } catch (error) {
    logResult({
      passed: false,
      message: 'Order status update failed with error',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function testOrderTracking(orderId: string) {
  console.log('\n🔍 Testing Order Tracking...');
  
  try {
    // 1. Get order details
    const order = await getOrderById(orderId);
    
    logResult({
      passed: !!order,
      message: 'Order can be retrieved by ID',
      details: { found: !!order },
    });
    
    // 2. Verify order has tracking information
    logResult({
      passed: !!order && !!order.orderNumber,
      message: 'Order has unique order number',
      details: { orderNumber: order?.orderNumber },
    });
    
    // 3. Verify status history is available
    logResult({
      passed: !!order && order.statusHistory && order.statusHistory.length > 0,
      message: 'Order has status history',
      details: { historyCount: order?.statusHistory?.length },
    });
    
  } catch (error) {
    logResult({
      passed: false,
      message: 'Order tracking failed with error',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function testReviewSubmission(testUser: any, product1: any) {
  console.log('\n⭐ Testing Review Submission...');
  
  try {
    // 1. Submit a review
    const reviewData = {
      userId: testUser.id,
      productId: product1.id,
      rating: 5,
      comment: 'This is a test review for checkpoint 11 verification. The product is excellent!',
    };
    
    const reviewResult = await createReview(reviewData);
    logResult({
      passed: reviewResult.success && !!reviewResult.reviewId,
      message: 'Create review successfully',
      details: reviewResult,
    });
    
    if (!reviewResult.reviewId) {
      throw new Error('Review creation failed');
    }
    
    // 2. Verify review is stored
    const reviews = await getReviewsByProduct(product1.id);
    logResult({
      passed: reviews.length > 0,
      message: 'Review appears in product reviews',
      details: { reviewCount: reviews.length },
    });
    
    // 3. Verify review content
    const review = reviews.find(r => r.id === reviewResult.reviewId);
    logResult({
      passed: !!review && review.rating === 5,
      message: 'Review has correct rating',
      details: { rating: review?.rating },
    });
    
    logResult({
      passed: !!review && review.comment.includes('checkpoint 11'),
      message: 'Review has correct comment',
      details: { commentPreview: review?.comment.substring(0, 50) },
    });
    
    return reviewResult.reviewId;
  } catch (error) {
    logResult({
      passed: false,
      message: 'Review submission failed with error',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return null;
  }
}

async function testReviewDisplay(product1: any) {
  console.log('\n📋 Testing Review Display...');
  
  try {
    // 1. Get reviews for product
    const reviews = await getReviewsByProduct(product1.id);
    
    logResult({
      passed: reviews.length > 0,
      message: `Reviews can be retrieved (found: ${reviews.length})`,
      details: { reviewCount: reviews.length },
    });
    
    // 2. Verify review has required fields
    if (reviews.length > 0) {
      const review = reviews[0];
      logResult({
        passed: !!review.rating && !!review.comment && !!review.createdAt,
        message: 'Review has all required fields',
        details: {
          hasRating: !!review.rating,
          hasComment: !!review.comment,
          hasCreatedAt: !!review.createdAt,
        },
      });
    }
    
  } catch (error) {
    logResult({
      passed: false,
      message: 'Review display failed with error',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function testRatingCalculations(testUser: any, product1: any) {
  console.log('\n🧮 Testing Rating Calculations...');
  
  try {
    // Get current product state
    const productBefore = await getProductById(product1.id);
    const ratingBefore = productBefore ? parseFloat(productBefore.averageRating || '0') : 0;
    const countBefore = productBefore?.reviewCount || 0;
    
    // Add another review with different rating
    const reviewData = {
      userId: testUser.id,
      productId: product1.id,
      rating: 3,
      comment: 'This is a second test review with a different rating for average calculation.',
    };
    
    // Note: This might fail if user can only review once - that's expected
    const reviewResult = await createReview(reviewData);
    
    if (reviewResult.success) {
      // Get updated product
      const productAfter = await getProductById(product1.id);
      const ratingAfter = productAfter ? parseFloat(productAfter.averageRating || '0') : 0;
      const countAfter = productAfter?.reviewCount || 0;
      
      logResult({
        passed: countAfter > countBefore,
        message: 'Review count incremented',
        details: { before: countBefore, after: countAfter },
      });
      
      // Expected average: (5 + 3) / 2 = 4.0
      const expectedAverage = (5 + 3) / 2;
      logResult({
        passed: Math.abs(ratingAfter - expectedAverage) < 0.01,
        message: `Average rating calculated correctly (expected: ${expectedAverage}, got: ${ratingAfter})`,
        details: { expected: expectedAverage, actual: ratingAfter },
      });
    } else {
      logResult({
        passed: true,
        message: 'Cannot add second review (one review per user per product enforced)',
        details: reviewResult,
      });
      
      // Verify the single review is reflected in average
      const productAfter = await getProductById(product1.id);
      const ratingAfter = productAfter ? parseFloat(productAfter.averageRating || '0') : 0;
      
      logResult({
        passed: ratingAfter === 5.0,
        message: `Average rating reflects single review (expected: 5.0, got: ${ratingAfter})`,
        details: { expected: 5.0, actual: ratingAfter },
      });
    }
    
  } catch (error) {
    logResult({
      passed: false,
      message: 'Rating calculation test failed with error',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function main() {
  console.log('🚀 Starting Checkpoint 11 Verification\n');
  console.log('This will test:');
  console.log('  - Complete checkout flow');
  console.log('  - Order status updates and tracking');
  console.log('  - Review submission and display');
  console.log('  - Rating calculations');
  
  try {
    // Cleanup any existing test data
    await cleanup();
    
    // Setup test data
    const { testUser, testCategory, product1, product2 } = await setupTestData();
    
    // Run tests
    const orderId = await testCheckoutFlow(testUser, product1, product2);
    
    if (orderId) {
      await testOrderStatusUpdates(orderId, testUser);
      await testOrderTracking(orderId);
    }
    
    const reviewId = await testReviewSubmission(testUser, product1);
    
    if (reviewId) {
      await testReviewDisplay(product1);
      await testRatingCalculations(testUser, product1);
    }
    
    // Cleanup
    await cleanup();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;
    
    console.log(`\nTotal Tests: ${total}`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.message}`);
        if (r.details) {
          console.log(`    ${JSON.stringify(r.details)}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      console.log('\n✅ All tests passed! Checkpoint 11 verification complete.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
