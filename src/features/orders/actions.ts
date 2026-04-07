'use server';

import { z } from 'zod';
import { db } from '@/db';
import { orders, orderItems, orderStatusHistory, cartItems, users } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { 
  checkoutSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  type CheckoutInput,
  type UpdateOrderStatusInput,
  type CancelOrderInput
} from './schemas';
import { validateCartInventory } from '@/features/cart/actions';
import { logger } from '@/lib/logger';
import { adjustInventoryQuantity } from '@/features/inventory/actions';
import { getCurrentUserId } from '@/lib/auth';
import { 
  createPaymentIntent, 
  handlePaymentWithTimeout,
  getCardLast4Digits 
} from '@/lib/payment';
import {
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendDeliveryConfirmationEmail,
} from '@/lib/email';
import { logAdminAction } from '@/lib/audit';
import { validateCoupon, recordCouponUsage } from '@/features/coupons/actions';

/**
 * Helper function to get user email by ID
 */
async function getUserEmail(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true },
  });
  return user?.email || null;
}

/**
 * Generate a unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create an order from cart with inventory management and Stripe payment
 * Validates: Requirements 6.1, 6.2, 6.3, 6.6, 10.2, 16.4, 30.1-30.7
 * 
 * @param input - Checkout data
 * @returns Success status with order ID or error
 */
export async function createOrder(input: CheckoutInput) {
  try {
    // Validate input
    const validated = checkoutSchema.parse(input);

    // Get current user ID
    const userId = await getCurrentUserId();
    
    // For guest checkout, require email
    if (!userId && !validated.guestEmail) {
      return {
        success: false,
        error: 'Email is required for guest checkout',
      };
    }

    // Validate cart and inventory (Requirement 6.1)
    const cartValidation = await validateCartInventory();
    if (!cartValidation.success) {
      return {
        success: false,
        error: cartValidation.error,
      };
    }

    const cartItemsList = cartValidation.data as Array<{
      productId: string;
      quantity: number;
      product: { name: string; price: string };
    }>;

    // Calculate totals
    const subtotal = cartItemsList.reduce((sum, item) => {
      const price = parseFloat(item.product.price);
      return sum + (price * item.quantity);
    }, 0);

    // Validate and apply coupon discount
    let couponId: string | undefined;
    let discount = 0;
    if (validated.couponId && validated.couponCode) {
      const couponResult = await validateCoupon(validated.couponCode, subtotal);
      if (couponResult.success && couponResult.coupon && couponResult.discount !== undefined) {
        couponId = couponResult.coupon.id;
        discount = couponResult.discount;
      }
      // If coupon is invalid at checkout time, proceed without discount (don't block order)
    }

    const tax = (subtotal - discount) * 0.1; // 10% tax on discounted subtotal
    const shipping = subtotal >= 50 ? 0 : 5.00;
    const total = subtotal - discount + tax + shipping;

    // Create or retrieve payment intent (Requirements 30.1, 30.2)
    let paymentIntentId = validated.paymentIntentId;
    let lastFourDigits: string | null = null;

    if (!paymentIntentId) {
      const paymentResult = await createPaymentIntent(
        total,
        'usd',
        {
          userId: userId || 'guest',
          guestEmail: validated.guestEmail || '',
        }
      );

      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Failed to create payment intent',
        };
      }

      paymentIntentId = paymentResult.data!.id;
    }

    // Handle payment with timeout (Requirements 30.4, 30.7)
    const paymentCheck = await handlePaymentWithTimeout(paymentIntentId, 30000);
    
    if (!paymentCheck.success) {
      return {
        success: false,
        error: paymentCheck.error,
        timedOut: paymentCheck.timedOut,
      };
    }

    const paymentIntent = paymentCheck.data!;

    // Verify payment is successful (Requirement 30.3)
    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'Payment not completed. Please complete payment before creating order.',
        paymentStatus: paymentIntent.status,
      };
    }

    // Get last 4 digits of card (Requirements 30.5, 30.6)
    if (paymentIntent.payment_method) {
      lastFourDigits = await getCardLast4Digits(
        typeof paymentIntent.payment_method === 'string' 
          ? paymentIntent.payment_method 
          : paymentIntent.payment_method.id
      );
    }

    // Start transaction (Requirement 16.4)
    const result = await db.transaction(async (tx) => {
      // Create order
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          userId: userId || undefined,
          guestEmail: validated.guestEmail,
          status: 'pending',
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          shipping: shipping.toFixed(2),
          discount: discount.toFixed(2),
          couponId: couponId || undefined,
          total: total.toFixed(2),
          shippingAddressLine1: validated.shippingAddress.line1,
          shippingAddressLine2: validated.shippingAddress.line2,
          shippingCity: validated.shippingAddress.city,
          shippingState: validated.shippingAddress.state,
          shippingPostalCode: validated.shippingAddress.postalCode,
          shippingCountry: validated.shippingAddress.country,
          paymentMethod: validated.paymentMethod,
          paymentIntentId: paymentIntentId,
          lastFourDigits: lastFourDigits || undefined,
        })
        .returning();

      // Create order items and decrease inventory (Requirement 10.2)
      for (const cartItem of cartItemsList) {
        const price = parseFloat(cartItem.product.price);
        const itemSubtotal = price * cartItem.quantity;

        // Create order item
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: cartItem.productId,
          productName: cartItem.product.name,
          quantity: cartItem.quantity,
          priceAtPurchase: price.toFixed(2),
          subtotal: itemSubtotal.toFixed(2),
        });

        // Decrease inventory (Requirement 10.2)
        const inventoryResult = await adjustInventoryQuantity({
          productId: cartItem.productId,
          adjustment: -cartItem.quantity,
        });

        if (!inventoryResult.success) {
          // Rollback transaction if inventory update fails
          throw new Error(`Failed to update inventory for product ${cartItem.product.name}`);
        }
      }

      // Create initial status history
      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        status: 'pending',
        notes: 'Order created',
        changedBy: userId || undefined,
      });

      // Clear cart (Requirement 6.3)
      if (userId) {
        await tx.delete(cartItems).where(eq(cartItems.userId, userId));
      }

      return order;
    });

    // Record coupon usage if a coupon was applied
    if (couponId && discount > 0) {
      recordCouponUsage(couponId, result.id, discount).catch((err) => {
        logger.error('Failed to record coupon usage', { orderId: result.id, couponId, error: String(err) });
      });
    }

    // Send order confirmation email (Requirements 28.2, 6.7)
    // Don't block order creation if email fails
    const customerEmail = result.guestEmail || (userId ? await getUserEmail(userId) : null);
    if (customerEmail) {
      const orderItemsData = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, result.id),
      });

      sendOrderConfirmationEmail({
        orderNumber: result.orderNumber,
        customerEmail: customerEmail,
        orderDate: new Date(result.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        items: orderItemsData.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.priceAtPurchase,
        })),
        subtotal: result.subtotal,
        tax: result.tax,
        shipping: result.shipping,
        total: result.total,
        shippingAddress: {
          line1: result.shippingAddressLine1,
          line2: result.shippingAddressLine2 || undefined,
          city: result.shippingCity,
          state: result.shippingState,
          postalCode: result.shippingPostalCode,
          country: result.shippingCountry,
        },
        trackingUrl: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/track/${result.orderNumber}`,
      }).catch((error) => {
        logger.error('Failed to send order confirmation email', { orderNumber: result.orderNumber, error: String(error) });
      });
    }

    return {
      success: true,
      data: {
        orderId: result.id,
        orderNumber: result.orderNumber,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}

/**
 * Update order status with validation
 * Validates: Requirements 7.2, 7.3, 7.6, 23.3
 * 
 * @param input - Order ID and new status
 * @returns Success status
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  try {
    // Validate input
    const validated = updateOrderStatusSchema.parse(input);

    // Get current user ID (admin only)
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get order
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, validated.orderId),
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Validate status transitions (Requirement 7.6, 23.3)
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': ['return_requested'],
      'return_requested': ['returned', 'delivered'], // returned = approved, delivered = rejected
      'returned': ['refunded'],
      'refunded': [],
      'cancelled': [],
    };

    const allowedStatuses = validTransitions[order.status] || [];
    if (!allowedStatuses.includes(validated.status)) {
      return {
        success: false,
        error: `Cannot change order status from ${order.status} to ${validated.status}`,
      };
    }

    // Update order status in transaction (Requirement 7.2, 7.3)
    await db.transaction(async (tx) => {
      // Update order
      await tx
        .update(orders)
        .set({
          status: validated.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, validated.orderId));

      // Add status history (Requirement 7.2, 23.3)
      await tx.insert(orderStatusHistory).values({
        orderId: validated.orderId,
        status: validated.status,
        notes: validated.notes,
        changedBy: userId,
      });
    });

    // Log admin action (Requirement 26.7)
    await logAdminAction(
      userId,
      'update_order_status',
      'order',
      validated.orderId,
      {
        previousStatus: order.status,
        newStatus: validated.status,
        notes: validated.notes,
      }
    );

    // Send email notifications based on status change (Requirements 28.3, 28.4, 7.4)
    // Don't block status update if email fails
    const customerEmail = order.guestEmail || (order.userId ? await getUserEmail(order.userId) : null);
    
    if (customerEmail) {
      if (validated.status === 'shipped') {
        // Send shipping notification (Requirement 28.3)
        sendShippingNotificationEmail({
          orderNumber: order.orderNumber,
          customerEmail: customerEmail,
          trackingNumber: order.trackingNumber || undefined,
          carrierName: order.carrierName || undefined,
          estimatedDeliveryDate: order.estimatedDeliveryDate
            ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : undefined,
          trackingUrl: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/track/${order.orderNumber}`,
        }).catch((error) => {
          logger.error('Failed to send shipping notification email', { orderNumber: order.orderNumber, error: String(error) });
        });
      } else if (validated.status === 'delivered') {
        // Send delivery confirmation (Requirement 28.4)
        sendDeliveryConfirmationEmail({
          orderNumber: order.orderNumber,
          customerEmail: customerEmail,
          deliveryDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          trackingUrl: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/track/${order.orderNumber}`,
        }).catch((error) => {
          logger.error('Failed to send delivery confirmation email', { orderNumber: order.orderNumber, error: String(error) });
        });
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    };
  }
}

/**
 * Cancel an order and restore inventory
 * Validates: Requirements 7.6, 7.7, 10.5, 16.4
 * 
 * @param input - Order ID
 * @returns Success status
 */
export async function cancelOrder(input: CancelOrderInput) {
  try {
    // Validate input
    const validated = cancelOrderSchema.parse(input);

    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get order with items
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, validated.orderId),
      with: {
        items: true,
      },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Check if user owns the order
    if (order.userId !== userId) {
      return {
        success: false,
        error: 'You do not have permission to cancel this order',
      };
    }

    // Check if order can be cancelled (Requirement 7.6)
    if (order.status !== 'pending') {
      return {
        success: false,
        error: 'Only pending orders can be cancelled',
      };
    }

    // Cancel order and restore inventory in transaction (Requirement 16.4)
    await db.transaction(async (tx) => {
      // Update order status
      await tx
        .update(orders)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, validated.orderId));

      // Restore inventory for each item (Requirement 10.5, 7.7)
      for (const item of order.items) {
        const inventoryResult = await adjustInventoryQuantity({
          productId: item.productId,
          adjustment: item.quantity, // Positive adjustment to restore
        });

        if (!inventoryResult.success) {
          throw new Error(`Failed to restore inventory for product ${item.productName}`);
        }
      }

      // Add status history
      await tx.insert(orderStatusHistory).values({
        orderId: validated.orderId,
        status: 'cancelled',
        notes: 'Order cancelled by customer',
        changedBy: userId,
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel order',
    };
  }
}

/**
 * Create a payment intent for checkout
 * Validates: Requirements 30.1, 30.2
 * 
 * @returns Payment intent client secret
 */
export async function createCheckoutPaymentIntent() {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();

    // Validate cart and get totals
    const cartValidation = await validateCartInventory();
    if (!cartValidation.success) {
      return {
        success: false,
        error: cartValidation.error,
      };
    }

    const cartItemsList = cartValidation.data as Array<{
      productId: string;
      quantity: number;
      product: { name: string; price: string };
    }>;

    // Calculate totals
    const subtotal = cartItemsList.reduce((sum, item) => {
      const price = parseFloat(item.product.price);
      return sum + (price * item.quantity);
    }, 0);

    const tax = subtotal * 0.1;
    const shipping = subtotal >= 50 ? 0 : 5.00;
    const total = subtotal + tax + shipping;

    // Create payment intent
    const paymentResult = await createPaymentIntent(
      total,
      'usd',
      {
        userId: userId || 'guest',
      }
    );

    if (!paymentResult.success) {
      return {
        success: false,
        error: paymentResult.error,
      };
    }

    return {
      success: true,
      data: {
        clientSecret: paymentResult.data!.client_secret,
        paymentIntentId: paymentResult.data!.id,
        amount: total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

/**
 * Get order status history
 * Validates: Requirements 7.2, 23.1, 23.3
 * 
 * @param orderId - Order ID
 * @returns Order status history
 */
export async function getOrderStatusHistory(orderId: string) {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();

    // Get order to verify ownership
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Check if user owns the order (or is admin)
    if (order.userId && order.userId !== userId) {
      return {
        success: false,
        error: 'You do not have permission to view this order',
      };
    }

    // Get status history
    const history = await db.query.orderStatusHistory.findMany({
      where: eq(orderStatusHistory.orderId, orderId),
      orderBy: [asc(orderStatusHistory.createdAt)],
    });

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get order status history',
    };
  }
}
