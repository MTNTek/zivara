import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { subOrders, suppliers } from '@/db/schema';
import type { SupplierType } from './adapters/types';
import { SupplierRegistry } from './registry';
import { getDecryptedCredentials } from './credentials';
import { checkSubOrderStatuses } from './order-router';

export interface TrackingEvent {
  status: string;
  description: string;
  timestamp: Date;
  location?: string;
  supplierLabel: string;
}

export interface SubOrderTracking {
  supplierId: string;
  supplierLabel: string;
  trackingNumber?: string;
  carrierName?: string;
  status: string;
  events: TrackingEvent[];
}

/**
 * Poll all active sub-orders for tracking updates from their respective suppliers.
 * Active sub-orders are those with status in ('placed', 'processing', 'shipped').
 */
export async function pollTrackingUpdates(): Promise<{
  polled: number;
  updated: number;
  errors: number;
}> {
  const registry = new SupplierRegistry();

  // Query all active sub-orders
  const activeSubOrders = await db
    .select()
    .from(subOrders)
    .where(inArray(subOrders.status, ['placed', 'processing', 'shipped']));

  let polled = 0;
  let updated = 0;
  let errors = 0;

  for (const subOrder of activeSubOrders) {
    // Skip sub-orders without a supplier order ID
    if (!subOrder.supplierOrderId) {
      continue;
    }

    polled++;

    try {
      // Get the supplier record to find its type
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, subOrder.supplierId))
        .limit(1);

      if (!supplier) {
        errors++;
        continue;
      }

      const adapter = registry.getAdapter(supplier.type as SupplierType);
      if (!adapter) {
        errors++;
        continue;
      }

      const credentials = await getDecryptedCredentials(subOrder.supplierId);
      const result = await adapter.getTrackingInfo(credentials, subOrder.supplierOrderId);

      if (result.success && result.data) {
        const tracking = result.data;

        // Update sub-order tracking fields
        const updateData: Record<string, unknown> = {
          trackingNumber: tracking.trackingNumber,
          carrierName: tracking.carrierName,
          trackingStatus: tracking.status,
          trackingUpdatedAt: new Date(),
          updatedAt: new Date(),
        };

        // If tracking status is 'delivered', update sub-order status to 'delivered'
        if (tracking.status === 'delivered') {
          updateData.status = 'delivered';
        }

        await db
          .update(subOrders)
          .set(updateData)
          .where(eq(subOrders.id, subOrder.id));

        // Check if parent order status should be updated
        await checkSubOrderStatuses(subOrder.orderId);

        updated++;
      } else {
        // On failure: skip and continue (retry on next poll)
        errors++;
      }
    } catch {
      // On failure: skip and continue (retry on next poll)
      errors++;
    }
  }

  return { polled, updated, errors };
}

/**
 * Get unified tracking information for all sub-orders of a given order.
 * Returns per-sub-order tracking and a combined chronological timeline.
 */
export async function getUnifiedTracking(orderId: string): Promise<{
  subOrders: SubOrderTracking[];
  combinedTimeline: TrackingEvent[];
}> {
  const registry = new SupplierRegistry();

  // Fetch all sub-orders for the given orderId
  const subOrderRecords = await db
    .select()
    .from(subOrders)
    .where(eq(subOrders.orderId, orderId));

  const subOrderTrackings: SubOrderTracking[] = [];
  const allEvents: TrackingEvent[] = [];

  for (const subOrder of subOrderRecords) {
    // Get the supplier's displayLabel
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, subOrder.supplierId))
      .limit(1);

    const supplierLabel = supplier?.displayLabel ?? supplier?.name ?? 'Unknown Supplier';

    const events: TrackingEvent[] = [];

    // If the sub-order has a supplierOrderId, try to fetch live tracking events
    if (subOrder.supplierOrderId) {
      try {
        if (supplier) {
          const adapter = registry.getAdapter(supplier.type as SupplierType);
          if (adapter) {
            const credentials = await getDecryptedCredentials(subOrder.supplierId);
            const result = await adapter.getTrackingInfo(credentials, subOrder.supplierOrderId);

            if (result.success && result.data) {
              for (const event of result.data.events) {
                events.push({
                  status: event.status,
                  description: event.description,
                  timestamp: event.timestamp,
                  location: event.location,
                  supplierLabel,
                });
              }
            }
          }
        }
      } catch {
        // If fetching live events fails, continue with what we have
      }
    }

    subOrderTrackings.push({
      supplierId: subOrder.supplierId,
      supplierLabel,
      trackingNumber: subOrder.trackingNumber ?? undefined,
      carrierName: subOrder.carrierName ?? undefined,
      status: subOrder.status,
      events,
    });

    allEvents.push(...events);
  }

  // Sort combined timeline chronologically
  const combinedTimeline = allEvents.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  return {
    subOrders: subOrderTrackings,
    combinedTimeline,
  };
}
