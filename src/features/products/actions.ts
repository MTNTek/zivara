'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { products, priceHistory, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { productSchema, updateProductSchema } from './schemas';
import { requireAdmin } from '@/lib/auth';
import { invalidateProductCache } from '@/lib/cache';
import type { ProductInput, UpdateProductInput } from './schemas';

/**
 * Create audit log entry
 */
async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  changes: Record<string, unknown>,
  userId?: string | null
) {
  try {
    await db.insert(auditLogs).values({
      userId: userId || null,
      action,
      entityType,
      entityId,
      changes: JSON.stringify(changes),
      ipAddress: null, // Could be extracted from headers in API routes
      userAgent: null,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failure shouldn't break the operation
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: ProductInput) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Validation
    const validated = productSchema.parse(data);

    // Create product
    const [product] = await db.insert(products).values({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      discountPrice: validated.discountPrice || null,
      discountStartDate: validated.discountStartDate ? new Date(validated.discountStartDate) : null,
      discountEndDate: validated.discountEndDate ? new Date(validated.discountEndDate) : null,
      categoryId: validated.categoryId,
      sku: validated.sku || null,
      isActive: validated.isActive,
    }).returning();

    // Create initial price history entry
    await db.insert(priceHistory).values({
      productId: product.id,
      price: validated.price,
    });

    // Create audit log
    await createAuditLog(
      'CREATE_PRODUCT',
      'product',
      product.id,
      { product: validated },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(product.id);
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return { success: true, data: product };
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create product' };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(data: UpdateProductInput) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Validation
    const validated = updateProductSchema.parse(data);
    const { id, ...updateData } = validated;

    // Get existing product
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Prepare update data
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updateData.name !== undefined) updates.name = updateData.name;
    if (updateData.slug !== undefined) updates.slug = updateData.slug;
    if (updateData.description !== undefined) updates.description = updateData.description;
    if (updateData.categoryId !== undefined) updates.categoryId = updateData.categoryId;
    if (updateData.sku !== undefined) updates.sku = updateData.sku;
    if (updateData.isActive !== undefined) updates.isActive = updateData.isActive;
    if (updateData.discountPrice !== undefined) updates.discountPrice = updateData.discountPrice;
    if (updateData.discountStartDate !== undefined) {
      updates.discountStartDate = updateData.discountStartDate ? new Date(updateData.discountStartDate) : null;
    }
    if (updateData.discountEndDate !== undefined) {
      updates.discountEndDate = updateData.discountEndDate ? new Date(updateData.discountEndDate) : null;
    }

    // Handle price change
    if (updateData.price !== undefined && updateData.price !== existingProduct.price) {
      updates.price = updateData.price;
      
      // Create price history entry
      await db.insert(priceHistory).values({
        productId: id,
        price: updateData.price,
      });
    }

    // Update product
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    // Create audit log
    await createAuditLog(
      'UPDATE_PRODUCT',
      'product',
      id,
      { before: existingProduct, after: updates },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(id);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return { success: true, data: product };
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to update product' };
  }
}

/**
 * Delete a product (soft delete - mark as inactive)
 */
export async function deleteProduct(id: string) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Get existing product
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Soft delete - mark as inactive
    const [product] = await db
      .update(products)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    // Create audit log
    await createAuditLog(
      'DELETE_PRODUCT',
      'product',
      id,
      { productName: existingProduct.name },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(id);
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return { success: true, data: product };
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to delete product' };
  }
}

/**
 * Restore a soft-deleted product
 */
export async function restoreProduct(id: string) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Get existing product
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Restore - mark as active
    const [product] = await db
      .update(products)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    // Create audit log
    await createAuditLog(
      'RESTORE_PRODUCT',
      'product',
      id,
      { productName: existingProduct.name },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(id);
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return { success: true, data: product };
  } catch (error) {
    console.error('Error restoring product:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to restore product' };
  }
}

/**
 * Bulk update products
 */
export async function bulkUpdateProducts(
  productIds: string[],
  updates: Partial<ProductInput>
) {
  try {
    // Validate input
    const { bulkProductUpdateSchema } = await import('@/features/admin/schemas');
    const validated = bulkProductUpdateSchema.parse({ productIds, updates });
    
    // Authorization check
    const session = await requireAdmin();

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.updates.isActive !== undefined) updateData.isActive = validated.updates.isActive;
    if (validated.updates.categoryId !== undefined) updateData.categoryId = validated.updates.categoryId;
    if (validated.updates.discountPrice !== undefined) updateData.discountPrice = validated.updates.discountPrice;
    if (validated.updates.discountStartDate !== undefined) updateData.discountStartDate = validated.updates.discountStartDate;
    if (validated.updates.discountEndDate !== undefined) updateData.discountEndDate = validated.updates.discountEndDate;

    // Update all products
    const updatedProducts = [];
    for (const id of validated.productIds) {
      const [product] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();
      
      if (product) {
        updatedProducts.push(product);
        
        // Create audit log for each product
        await createAuditLog(
          'BULK_UPDATE_PRODUCT',
          'product',
          id,
          { updates: updateData },
          session.user.id
        );
        
        // Invalidate cache for each product
        invalidateProductCache(id);
      }
    }

    // Cache invalidation
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      data: {
        updated: updatedProducts.length,
        products: updatedProducts,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    
    console.error('Error bulk updating products:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to bulk update products' };
  }
}
