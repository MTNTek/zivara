'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { inventory, products, auditLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Get all products with inventory for admin management
 */
export async function getInventoryList(options?: {
  page?: number;
  limit?: number;
  filter?: 'all' | 'low' | 'out';
  search?: string;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  try {
    // Get products with inventory
    const rows = await db.query.products.findMany({
      with: {
        inventory: true,
        images: { limit: 1, columns: { thumbnailUrl: true, imageUrl: true } },
        category: { columns: { name: true } },
      },
      orderBy: (p, { asc }) => [asc(p.name)],
      limit,
      offset,
    });

    let filtered = rows;

    if (options?.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      );
    }

    if (options?.filter === 'low') {
      filtered = filtered.filter(
        (p) =>
          p.inventory &&
          p.inventory.quantity > 0 &&
          p.inventory.quantity <= p.inventory.lowStockThreshold
      );
    } else if (options?.filter === 'out') {
      filtered = filtered.filter(
        (p) => !p.inventory || p.inventory.quantity === 0
      );
    }

    return { success: true, data: filtered };
  } catch (error) {
    logger.error('Error fetching inventory', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to fetch inventory', data: [] };
  }
}

/**
 * Quick stock adjustment for a single product
 */
export async function adjustStock(
  productId: string,
  newQuantity: number,
  reason?: string
) {
  try {
    const session = await requireAdmin();

    if (newQuantity < 0) {
      return { success: false, error: 'Quantity cannot be negative' };
    }

    // Upsert inventory record
    const existing = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    if (existing) {
      await db
        .update(inventory)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(inventory.productId, productId));
    } else {
      await db.insert(inventory).values({
        productId,
        quantity: newQuantity,
      });
    }

    // Audit log
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: 'ADJUST_STOCK',
      entityType: 'inventory',
      entityId: productId,
      changes: JSON.stringify({
        previousQuantity: existing?.quantity ?? 0,
        newQuantity,
        reason: reason || 'Manual adjustment',
      }),
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    logger.error('Error adjusting stock', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to adjust stock' };
  }
}

/**
 * Update low stock threshold for a product
 */
export async function updateLowStockThreshold(
  productId: string,
  threshold: number
) {
  try {
    await requireAdmin();

    if (threshold < 0) {
      return { success: false, error: 'Threshold cannot be negative' };
    }

    const existing = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    if (existing) {
      await db
        .update(inventory)
        .set({ lowStockThreshold: threshold, updatedAt: new Date() })
        .where(eq(inventory.productId, productId));
    } else {
      await db.insert(inventory).values({
        productId,
        quantity: 0,
        lowStockThreshold: threshold,
      });
    }

    revalidatePath('/admin/inventory');
    return { success: true };
  } catch (error) {
    logger.error('Error updating threshold', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to update threshold' };
  }
}

/**
 * Adjust inventory by a relative amount (positive to add, negative to subtract)
 * Used by order creation and cancellation
 */
export async function adjustInventoryQuantity({
  productId,
  adjustment,
}: {
  productId: string;
  adjustment: number;
}) {
  try {
    const existing = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    const currentQty = existing?.quantity ?? 0;
    const newQty = Math.max(0, currentQty + adjustment);

    if (existing) {
      await db
        .update(inventory)
        .set({ quantity: newQty, updatedAt: new Date() })
        .where(eq(inventory.productId, productId));
    } else {
      await db.insert(inventory).values({
        productId,
        quantity: newQty,
      });
    }

    return { success: true, newQuantity: newQty };
  } catch (error) {
    logger.error('Error adjusting inventory', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to adjust inventory' };
  }
}

/**
 * Check if requested quantity is available in inventory
 * Used by cart actions before adding/updating items
 */
export async function checkInventoryAvailability(
  productId: string,
  requestedQuantity: number
) {
  try {
    const record = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    const available = record ? record.quantity : 0;

    return {
      available: available >= requestedQuantity,
      availableQuantity: available,
      currentStock: available,
      requestedQuantity,
    };
  } catch (error) {
    logger.error('Error checking inventory', { error: error instanceof Error ? error.message : String(error) });
    // Fail open — allow the purchase if inventory check fails
    return { available: true, availableQuantity: 0, currentStock: 0, requestedQuantity };
  }
}

/**
 * Set inventory to an absolute quantity (used by tests and sync)
 */
export async function updateInventoryQuantity({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) {
  try {
    const existing = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    if (existing) {
      await db
        .update(inventory)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(inventory.productId, productId));
    } else {
      await db.insert(inventory).values({ productId, quantity });
    }

    return { success: true };
  } catch (error) {
    logger.error('Error updating inventory quantity', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Failed to update inventory' };
  }
}
