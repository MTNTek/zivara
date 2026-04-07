'use server';

import { db } from '@/db';
import { orders, orderStatusHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserId, requireAdmin } from '@/lib/auth';
import { createRefund } from '@/lib/payment';
import { adjustInventoryQuantity } from '@/features/inventory/actions';
import { logger } from '@/lib/logger';

/**
 * Customer requests a return for a delivered order
 */
export async function requestReturn(orderId: string, reason: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Authentication required' };

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) return { success: false, error: 'Order not found' };
    if (order.userId !== userId) return { success: false, error: 'Not authorized' };
    if (order.status !== 'delivered') {
      return { success: false, error: 'Only delivered orders can be returned' };
    }

    // Check 30-day return window
    const deliveredDaysAgo = (Date.now() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (deliveredDaysAgo > 30) {
      return { success: false, error: 'Return window has expired (30 days)' };
    }

    await db.transaction(async (tx) => {
      await tx.update(orders)
        .set({ status: 'return_requested', updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await tx.insert(orderStatusHistory).values({
        orderId,
        status: 'return_requested',
        notes: `Return requested: ${reason}`,
        changedBy: userId,
      });
    });

    return { success: true };
  } catch (error) {
    logger.error('Return request failed', { orderId, error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to submit return request' };
  }
}

/**
 * Admin approves a return and issues refund
 */
export async function approveReturn(orderId: string) {
  try {
    const session = await requireAdmin();

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });

    if (!order) return { success: false, error: 'Order not found' };
    if (order.status !== 'return_requested') {
      return { success: false, error: 'Order is not in return_requested status' };
    }

    // Issue refund via Stripe
    if (order.paymentIntentId) {
      const refundResult = await createRefund(
        order.paymentIntentId,
        undefined, // full refund
        'requested_by_customer'
      );

      if (!refundResult.success) {
        return { success: false, error: `Refund failed: ${refundResult.error}` };
      }
    }

    await db.transaction(async (tx) => {
      // Mark as returned
      await tx.update(orders)
        .set({ status: 'returned', updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await tx.insert(orderStatusHistory).values({
        orderId,
        status: 'returned',
        notes: 'Return approved and refund issued',
        changedBy: session.user.id,
      });

      // Restore inventory
      for (const item of order.items) {
        await adjustInventoryQuantity({
          productId: item.productId,
          adjustment: item.quantity,
        });
      }
    });

    return { success: true };
  } catch (error) {
    logger.error('Approve return failed', { orderId, error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to approve return' };
  }
}

/**
 * Admin rejects a return request
 */
export async function rejectReturn(orderId: string, reason: string) {
  try {
    const session = await requireAdmin();

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) return { success: false, error: 'Order not found' };
    if (order.status !== 'return_requested') {
      return { success: false, error: 'Order is not in return_requested status' };
    }

    await db.transaction(async (tx) => {
      // Revert to delivered
      await tx.update(orders)
        .set({ status: 'delivered', updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await tx.insert(orderStatusHistory).values({
        orderId,
        status: 'delivered',
        notes: `Return rejected: ${reason}`,
        changedBy: session.user.id,
      });
    });

    return { success: true };
  } catch (error) {
    logger.error('Reject return failed', { orderId, error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to reject return' };
  }
}

/**
 * Admin issues a manual refund (without return)
 */
export async function issueRefund(orderId: string, amount?: number, reason?: string) {
  try {
    const session = await requireAdmin();

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) return { success: false, error: 'Order not found' };
    if (!order.paymentIntentId) return { success: false, error: 'No payment to refund' };

    const refundResult = await createRefund(
      order.paymentIntentId,
      amount,
      'requested_by_customer'
    );

    if (!refundResult.success) {
      return { success: false, error: `Refund failed: ${refundResult.error}` };
    }

    const isFullRefund = !amount || amount >= Number(order.total);

    if (isFullRefund) {
      await db.update(orders)
        .set({ status: 'refunded', updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }

    await db.insert(orderStatusHistory).values({
      orderId,
      status: isFullRefund ? 'refunded' : order.status,
      notes: reason || `Refund of $${(amount || Number(order.total)).toFixed(2)} issued`,
      changedBy: session.user.id,
    });

    return { success: true };
  } catch (error) {
    logger.error('Issue refund failed', { orderId, error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to issue refund' };
  }
}
