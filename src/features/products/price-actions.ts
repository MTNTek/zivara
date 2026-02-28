'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { products, priceHistory, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { invalidateProductCache } from '@/lib/cache';

/**
 * Schema for price update
 */
export const updatePriceSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal with max 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Price must be positive'),
});

/**
 * Schema for discount pricing
 */
export const updateDiscountSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  discountPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Discount price must be a valid decimal with max 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Discount price must be positive')
    .nullable(),
  discountStartDate: z.string().datetime().nullable(),
  discountEndDate: z.string().datetime().nullable(),
}).refine((data) => {
  // If discount price is set, start and end dates must be provided
  if (data.discountPrice && (!data.discountStartDate || !data.discountEndDate)) {
    return false;
  }
  return true;
}, {
  message: 'Discount start and end dates are required when setting a discount price',
  path: ['discountStartDate'],
}).refine((data) => {
  // End date must be after start date
  if (data.discountStartDate && data.discountEndDate) {
    return new Date(data.discountEndDate) > new Date(data.discountStartDate);
  }
  return true;
}, {
  message: 'Discount end date must be after start date',
  path: ['discountEndDate'],
});

export type UpdatePriceInput = z.infer<typeof updatePriceSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;

/**
 * Create audit log entry
 */
async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  changes: any,
  userId?: string | null
) {
  try {
    await db.insert(auditLogs).values({
      userId: userId || null,
      action,
      entityType,
      entityId,
      changes: JSON.stringify(changes),
      ipAddress: null,
      userAgent: null,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Update product price
 * Creates a price history entry with timestamp
 */
export async function updateProductPrice(data: UpdatePriceInput) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Validation
    const validated = updatePriceSchema.parse(data);

    // Get existing product
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, validated.productId),
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Check if price is actually changing
    if (existingProduct.price === validated.price) {
      return { success: false, error: 'New price is the same as current price' };
    }

    // Update product price
    const [product] = await db
      .update(products)
      .set({
        price: validated.price,
        updatedAt: new Date(),
      })
      .where(eq(products.id, validated.productId))
      .returning();

    // Create price history entry with timestamp
    await db.insert(priceHistory).values({
      productId: validated.productId,
      price: validated.price,
      effectiveDate: new Date(),
    });

    // Create audit log
    await createAuditLog(
      'UPDATE_PRICE',
      'product',
      validated.productId,
      {
        oldPrice: existingProduct.price,
        newPrice: validated.price,
      },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(validated.productId);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: {
        product,
        oldPrice: existingProduct.price,
        newPrice: validated.price,
      },
    };
  } catch (error) {
    console.error('Error updating product price:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update product price' };
  }
}

/**
 * Update product discount pricing
 * Validates discount price is less than original price
 */
export async function updateProductDiscount(data: UpdateDiscountInput) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Validation
    const validated = updateDiscountSchema.parse(data);

    // Get existing product
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, validated.productId),
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Validate discount price is less than original price
    if (validated.discountPrice) {
      const discountPrice = parseFloat(validated.discountPrice);
      const originalPrice = parseFloat(existingProduct.price);

      if (discountPrice >= originalPrice) {
        return {
          success: false,
          error: 'Discount price must be less than original price',
        };
      }
    }

    // Update product discount
    const [product] = await db
      .update(products)
      .set({
        discountPrice: validated.discountPrice,
        discountStartDate: validated.discountStartDate
          ? new Date(validated.discountStartDate)
          : null,
        discountEndDate: validated.discountEndDate
          ? new Date(validated.discountEndDate)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, validated.productId))
      .returning();

    // Create audit log
    await createAuditLog(
      'UPDATE_DISCOUNT',
      'product',
      validated.productId,
      {
        oldDiscount: {
          price: existingProduct.discountPrice,
          startDate: existingProduct.discountStartDate,
          endDate: existingProduct.discountEndDate,
        },
        newDiscount: {
          price: validated.discountPrice,
          startDate: validated.discountStartDate,
          endDate: validated.discountEndDate,
        },
      },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(validated.productId);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Error updating product discount:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update product discount' };
  }
}

/**
 * Get price history for a product
 */
export async function getProductPriceHistory(productId: string) {
  try {
    const history = await db.query.priceHistory.findMany({
      where: eq(priceHistory.productId, productId),
      orderBy: (priceHistory, { desc }) => [desc(priceHistory.effectiveDate)],
    });

    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching price history:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to fetch price history' };
  }
}

/**
 * Check if a product's discount is currently active
 */
export function isDiscountActive(
  discountPrice: string | null,
  discountStartDate: Date | null,
  discountEndDate: Date | null
): boolean {
  if (!discountPrice || !discountStartDate || !discountEndDate) {
    return false;
  }

  const now = new Date();
  return now >= discountStartDate && now <= discountEndDate;
}

/**
 * Get the effective price for a product (discount price if active, otherwise regular price)
 */
export function getEffectivePrice(
  price: string,
  discountPrice: string | null,
  discountStartDate: Date | null,
  discountEndDate: Date | null
): string {
  if (isDiscountActive(discountPrice, discountStartDate, discountEndDate)) {
    return discountPrice!;
  }
  return price;
}

/**
 * Get pricing display information for a product
 */
export function getPricingDisplay(
  price: string,
  discountPrice: string | null,
  discountStartDate: Date | null,
  discountEndDate: Date | null
): {
  effectivePrice: string;
  originalPrice: string | null;
  hasActiveDiscount: boolean;
  discountPercentage: number | null;
} {
  const hasActiveDiscount = isDiscountActive(discountPrice, discountStartDate, discountEndDate);

  if (hasActiveDiscount && discountPrice) {
    const originalPriceNum = parseFloat(price);
    const discountPriceNum = parseFloat(discountPrice);
    const discountPercentage = Math.round(((originalPriceNum - discountPriceNum) / originalPriceNum) * 100);

    return {
      effectivePrice: discountPrice,
      originalPrice: price,
      hasActiveDiscount: true,
      discountPercentage,
    };
  }

  return {
    effectivePrice: price,
    originalPrice: null,
    hasActiveDiscount: false,
    discountPercentage: null,
  };
}
