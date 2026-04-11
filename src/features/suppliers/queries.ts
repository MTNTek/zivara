import { db } from '@/db';
import { productSupplierLinks, suppliers, subOrders, subOrderItems } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface ProductSupplierInfo {
  supplierId: string;
  supplierName: string;
  displayLabel: string;
  supplierStatus: string;
}

/**
 * Get the primary supplier info for a single product.
 */
export async function getProductSupplier(productId: string): Promise<ProductSupplierInfo | null> {
  const [link] = await db
    .select({
      supplierId: suppliers.id,
      supplierName: suppliers.name,
      displayLabel: suppliers.displayLabel,
      supplierStatus: suppliers.status,
    })
    .from(productSupplierLinks)
    .innerJoin(suppliers, eq(productSupplierLinks.supplierId, suppliers.id))
    .where(and(eq(productSupplierLinks.productId, productId), eq(productSupplierLinks.isPrimary, true)))
    .limit(1);

  if (link) return { ...link, displayLabel: link.displayLabel || link.supplierName };

  // Fallback: any supplier link
  const [fallback] = await db
    .select({
      supplierId: suppliers.id,
      supplierName: suppliers.name,
      displayLabel: suppliers.displayLabel,
      supplierStatus: suppliers.status,
    })
    .from(productSupplierLinks)
    .innerJoin(suppliers, eq(productSupplierLinks.supplierId, suppliers.id))
    .where(eq(productSupplierLinks.productId, productId))
    .limit(1);

  if (!fallback) return null;
  return { ...fallback, displayLabel: fallback.displayLabel || fallback.supplierName };
}

/**
 * Get primary supplier info for multiple products (batch).
 */
export async function getProductsSuppliers(productIds: string[]): Promise<Map<string, ProductSupplierInfo>> {
  if (productIds.length === 0) return new Map();

  const links = await db
    .select({
      productId: productSupplierLinks.productId,
      supplierId: suppliers.id,
      supplierName: suppliers.name,
      displayLabel: suppliers.displayLabel,
      supplierStatus: suppliers.status,
      isPrimary: productSupplierLinks.isPrimary,
    })
    .from(productSupplierLinks)
    .innerJoin(suppliers, eq(productSupplierLinks.supplierId, suppliers.id))
    .where(inArray(productSupplierLinks.productId, productIds));

  const map = new Map<string, ProductSupplierInfo>();
  for (const link of links) {
    const existing = map.get(link.productId);
    // Prefer primary links
    if (!existing || link.isPrimary) {
      map.set(link.productId, {
        supplierId: link.supplierId,
        supplierName: link.supplierName,
        displayLabel: link.displayLabel || link.supplierName,
        supplierStatus: link.supplierStatus,
      });
    }
  }
  return map;
}

/**
 * Get sub-orders with items for a given parent order.
 */
export async function getOrderSubOrders(orderId: string) {
  const subs = await db.query.subOrders.findMany({
    where: eq(subOrders.orderId, orderId),
    with: {
      supplier: true,
      items: {
        with: {
          orderItem: true,
        },
      },
    },
  });
  return subs;
}
