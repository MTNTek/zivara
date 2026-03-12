'use server';

import { z } from 'zod';
import { db } from '@/db';
import { inventory, products } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { 
  updateInventorySchema, 
  setLowStockThresholdSchema,
  adjustInventorySchema,
  type UpdateInventoryInput,
  type SetLowStockThresholdInput,
  type AdjustInventoryInput
} from './schemas';

/**
 * Update inventory quantity for a product
 * Validates: Requirements 10.1, 10.6
 * 
 * @param input - Product ID and new quantity
 * @returns Success status with updated inventory or error
 */
export async function updateInventoryQuantity(input: UpdateInventoryInput) {
  try {
    // Validate input
    const validated = updateInventorySchema.parse(input);

    // Check if product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, validated.productId),
    });

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    // Check if inventory record exists
    const existingInventory = await db.query.inventory.findFirst({
      where: eq(inventory.productId, validated.productId),
    });

    let result;
    if (existingInventory) {
      // Update existing inventory
      [result] = await db
        .update(inventory)
        .set({
          quantity: validated.quantity,
          updatedAt: new Date(),
        })
        .where(eq(inventory.productId, validated.productId))
        .returning();
    } else {
      // Create new inventory record
      [result] = await db
        .insert(inventory)
        .values({
          productId: validated.productId,
          quantity: validated.quantity,
          lowStockThreshold: 10, // Default threshold
        })
        .returning();
    }

    return {
      success: true,
      data: result,
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
      error: error instanceof Error ? error.message : 'Failed to update inventory',
    };
  }
}

/**
 * Adjust inventory quantity by a delta (positive or negative)
 * Validates: Requirements 10.2, 10.5, 10.6
 * 
 * @param input - Product ID and adjustment amount
 * @returns Success status with updated inventory or error
 */
export async function adjustInventoryQuantity(input: AdjustInventoryInput) {
  try {
    // Validate input
    const validated = adjustInventorySchema.parse(input);

    // Get current inventory
    const currentInventory = await db.query.inventory.findFirst({
      where: eq(inventory.productId, validated.productId),
    });

    if (!currentInventory) {
      return {
        success: false,
        error: 'Inventory record not found for this product',
      };
    }

    // Calculate new quantity
    const newQuantity = currentInventory.quantity + validated.adjustment;

    // Validate non-negative constraint (Requirement 10.6)
    if (newQuantity < 0) {
      return {
        success: false,
        error: 'Insufficient inventory. Cannot reduce below zero.',
      };
    }

    // Update inventory
    const [result] = await db
      .update(inventory)
      .set({
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(eq(inventory.productId, validated.productId))
      .returning();

    return {
      success: true,
      data: result,
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
      error: error instanceof Error ? error.message : 'Failed to adjust inventory',
    };
  }
}

/**
 * Set low stock threshold for a product
 * Validates: Requirement 10.1
 * 
 * @param input - Product ID and threshold value
 * @returns Success status with updated inventory or error
 */
export async function setLowStockThreshold(input: SetLowStockThresholdInput) {
  try {
    // Validate input
    const validated = setLowStockThresholdSchema.parse(input);

    // Check if inventory record exists
    const existingInventory = await db.query.inventory.findFirst({
      where: eq(inventory.productId, validated.productId),
    });

    if (!existingInventory) {
      return {
        success: false,
        error: 'Inventory record not found for this product',
      };
    }

    // Update threshold
    const [result] = await db
      .update(inventory)
      .set({
        lowStockThreshold: validated.threshold,
        updatedAt: new Date(),
      })
      .where(eq(inventory.productId, validated.productId))
      .returning();

    return {
      success: true,
      data: result,
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
      error: error instanceof Error ? error.message : 'Failed to set low stock threshold',
    };
  }
}

/**
 * Get low stock products (quantity <= threshold)
 * For admin notifications
 * 
 * @returns List of products with low stock
 */
export async function getLowStockProducts() {
  try {
    const lowStockItems = await db
      .select({
        productId: inventory.productId,
        productName: products.name,
        quantity: inventory.quantity,
        lowStockThreshold: inventory.lowStockThreshold,
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`);

    return {
      success: true,
      data: lowStockItems,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get low stock products',
    };
  }
}

/**
 * Check if a product is in stock
 * Validates: Requirement 10.3
 * 
 * @param productId - Product ID to check
 * @returns Boolean indicating if product is in stock
 */
export async function isProductInStock(productId: string): Promise<boolean> {
  try {
    const inventoryRecord = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    return inventoryRecord ? inventoryRecord.quantity > 0 : false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if sufficient inventory is available for a quantity
 * Validates: Requirement 10.7
 * 
 * @param productId - Product ID to check
 * @param requestedQuantity - Quantity requested
 * @returns Object with availability status and available quantity
 */
export async function checkInventoryAvailability(
  productId: string,
  requestedQuantity: number
): Promise<{ available: boolean; availableQuantity: number }> {
  try {
    const inventoryRecord = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    });

    if (!inventoryRecord) {
      return { available: false, availableQuantity: 0 };
    }

    return {
      available: inventoryRecord.quantity >= requestedQuantity,
      availableQuantity: inventoryRecord.quantity,
    };
  } catch (error) {
    return { available: false, availableQuantity: 0 };
  }
}
