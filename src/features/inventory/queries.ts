import { db } from '@/db';
import { inventory, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * Get inventory for a specific product
 * 
 * @param productId - Product ID
 * @returns Inventory record or null
 */
export async function getInventoryByProductId(productId: string) {
  try {
    const inventoryRecord = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    return inventoryRecord || null;
  } catch (error) {
    logger.error('Error fetching inventory', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Get inventory with product details
 * 
 * @param productId - Product ID
 * @returns Inventory with product details or null
 */
export async function getInventoryWithProduct(productId: string) {
  try {
    const result = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        quantity: inventory.quantity,
        lowStockThreshold: inventory.lowStockThreshold,
        updatedAt: inventory.updatedAt,
        productName: products.name,
        productSlug: products.slug,
        productPrice: products.price,
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.productId, productId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching inventory with product', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Get all inventory records with product details
 * Useful for admin inventory management
 * 
 * @returns List of inventory records with product details
 */
export async function getAllInventory() {
  try {
    const results = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        quantity: inventory.quantity,
        lowStockThreshold: inventory.lowStockThreshold,
        updatedAt: inventory.updatedAt,
        productName: products.name,
        productSlug: products.slug,
        productPrice: products.price,
        productIsActive: products.isActive,
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .orderBy(products.name);

    return results;
  } catch (error) {
    logger.error('Error fetching all inventory', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
