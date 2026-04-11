import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  orders,
  orderItems,
  subOrders,
  subOrderItems,
  productSupplierLinks,
  suppliers,
  exchangeRates,
} from '@/db/schema';
import type { SupplierType, SupplierOrderRequest } from './adapters/types';
import { SupplierRegistry } from './registry';
import { getDecryptedCredentials } from './credentials';
import { getExchangeRate, convert } from './currency';

export interface SubOrderCreation {
  orderId: string;
  supplierId: string;
  items: { orderItemId: string; productId: string; supplierProductId: string; quantity: number }[];
  costTotal: number;
  exchangeRate: number;
  exchangeRateId: string;
}

interface SupplierGroup {
  supplierId: string;
  supplierType: string;
  supplierCurrency: string;
  items: {
    orderItemId: string;
    productId: string;
    supplierProductId: string;
    costPrice: number;
    quantity: number;
  }[];
}

/**
 * Route an order by splitting it into sub-orders grouped by supplier,
 * then forwarding each sub-order to the corresponding supplier adapter.
 */
export async function routeOrder(orderId: string): Promise<{
  subOrders: SubOrderCreation[];
  errors: { supplierId: string; error: string }[];
}> {
  const registry = new SupplierRegistry();

  // Fetch the order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Fetch order items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  if (items.length === 0) {
    return { subOrders: [], errors: [] };
  }

  // For each order item, find the primary supplier link
  const supplierGroups = new Map<string, SupplierGroup>();

  for (const item of items) {
    const [link] = await db
      .select()
      .from(productSupplierLinks)
      .where(
        and(
          eq(productSupplierLinks.productId, item.productId),
          eq(productSupplierLinks.isPrimary, true)
        )
      )
      .limit(1);

    if (!link) {
      continue; // Skip items without a primary supplier link
    }

    // Fetch supplier info if not already in the group
    if (!supplierGroups.has(link.supplierId)) {
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, link.supplierId))
        .limit(1);

      if (!supplier) continue;

      supplierGroups.set(link.supplierId, {
        supplierId: link.supplierId,
        supplierType: supplier.type,
        supplierCurrency: supplier.currency,
        items: [],
      });
    }

    supplierGroups.get(link.supplierId)!.items.push({
      orderItemId: item.id,
      productId: item.productId,
      supplierProductId: link.supplierProductId,
      costPrice: Number(link.costPrice),
      quantity: item.quantity,
    });
  }

  const createdSubOrders: SubOrderCreation[] = [];
  const errors: { supplierId: string; error: string }[] = [];

  // Process each supplier group
  for (const [, group] of supplierGroups) {
    try {
      // Get exchange rate for the supplier's currency
      const exchangeRateResult = await getExchangeRate(group.supplierCurrency, 'USD');
      const rate = exchangeRateResult.rate;

      // Look up the exchange rate record ID
      let exchangeRateId = '';
      if (group.supplierCurrency !== 'USD') {
        const exchangeRateRecords = await db
          .select()
          .from(exchangeRates)
          .where(
            and(
              eq(exchangeRates.sourceCurrency, group.supplierCurrency),
              eq(exchangeRates.targetCurrency, 'USD')
            )
          )
          .limit(1);

        exchangeRateId = exchangeRateRecords.length > 0 ? exchangeRateRecords[0].id : '';
      }

      // Calculate cost total (sum of costPrice * quantity, converted)
      let costTotal = 0;
      for (const item of group.items) {
        costTotal += convert(item.costPrice * item.quantity, group.supplierCurrency, 'USD', rate);
      }
      costTotal = Math.round(costTotal * 100) / 100;

      // Create sub-order record
      const [subOrder] = await db
        .insert(subOrders)
        .values({
          orderId,
          supplierId: group.supplierId,
          status: 'pending',
          costTotal: costTotal.toFixed(2),
          exchangeRateUsed: rate.toFixed(8),
          exchangeRateId: exchangeRateId || null,
        })
        .returning();

      // Create sub-order item records
      for (const item of group.items) {
        await db.insert(subOrderItems).values({
          subOrderId: subOrder.id,
          orderItemId: item.orderItemId,
          supplierProductId: item.supplierProductId,
          costPriceAtOrder: item.costPrice.toFixed(2),
          quantity: item.quantity,
        });
      }

      // Get adapter and credentials, call placeOrder
      const adapter = registry.getAdapter(group.supplierType as SupplierType);
      if (!adapter) {
        // Mark sub-order as failed
        await db
          .update(subOrders)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(subOrders.id, subOrder.id));
        errors.push({
          supplierId: group.supplierId,
          error: `No adapter registered for supplier type: ${group.supplierType}`,
        });
        continue;
      }

      const credentials = await getDecryptedCredentials(group.supplierId);

      const orderRequests: SupplierOrderRequest[] = group.items.map((item) => ({
        supplierProductId: item.supplierProductId,
        quantity: item.quantity,
        shippingAddress: {
          line1: order.shippingAddressLine1,
          line2: order.shippingAddressLine2 ?? undefined,
          city: order.shippingCity,
          state: order.shippingState,
          postalCode: order.shippingPostalCode,
          country: order.shippingCountry,
        },
      }));

      const result = await adapter.placeOrder(credentials, orderRequests);

      if (result.success && result.data) {
        // Success: update sub-order with supplier order ID and set status to 'placed'
        await db
          .update(subOrders)
          .set({
            supplierOrderId: result.data.supplierOrderId,
            status: 'placed',
            estimatedDelivery: result.data.estimatedDeliveryDate ?? null,
            trackingNumber: result.data.trackingNumber ?? null,
            carrierName: result.data.carrierName ?? null,
            updatedAt: new Date(),
          })
          .where(eq(subOrders.id, subOrder.id));
      } else {
        // Failure: mark sub-order as failed
        await db
          .update(subOrders)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(subOrders.id, subOrder.id));
        errors.push({
          supplierId: group.supplierId,
          error: result.error?.message ?? 'Unknown error placing order with supplier',
        });
      }

      createdSubOrders.push({
        orderId,
        supplierId: group.supplierId,
        items: group.items.map((item) => ({
          orderItemId: item.orderItemId,
          productId: item.productId,
          supplierProductId: item.supplierProductId,
          quantity: item.quantity,
        })),
        costTotal,
        exchangeRate: rate,
        exchangeRateId: exchangeRateId || '',
      });
    } catch (err) {
      errors.push({
        supplierId: group.supplierId,
        error: err instanceof Error ? err.message : 'Unknown error during order routing',
      });
    }
  }

  return { subOrders: createdSubOrders, errors };
}

/**
 * Check all sub-order statuses for a given order and update the parent order status:
 * - If ALL sub-orders are 'shipped', set parent to 'shipped'
 * - If ALL sub-orders are 'delivered', set parent to 'delivered'
 * - Otherwise, leave parent order status unchanged
 */
export async function checkSubOrderStatuses(orderId: string): Promise<void> {
  const subOrderRecords = await db
    .select()
    .from(subOrders)
    .where(eq(subOrders.orderId, orderId));

  if (subOrderRecords.length === 0) {
    return;
  }

  const allShipped = subOrderRecords.every((so) => so.status === 'shipped');
  const allDelivered = subOrderRecords.every((so) => so.status === 'delivered');

  if (allDelivered) {
    await db
      .update(orders)
      .set({ status: 'delivered', updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  } else if (allShipped) {
    await db
      .update(orders)
      .set({ status: 'shipped', updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }
  // Otherwise, leave parent order status unchanged
}
