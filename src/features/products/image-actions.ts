'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { productImages, products, auditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/storage';
import { invalidateProductCache } from '@/lib/cache';

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
      ipAddress: null,
      userAgent: null,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Upload product image
 */
export async function uploadProductImage(formData: FormData) {
  try {
    // Authorization check
    const session = await requireAdmin();

    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const altText = formData.get('altText') as string | null;

    if (!file || !productId) {
      return { success: false, error: 'File and product ID are required' };
    }

    // Validate file
    try {
      validateImageFile(file);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid file',
      };
    }

    // Check if product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Check image count (max 10 per product)
    const existingImages = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
    });

    if (existingImages.length >= 10) {
      return {
        success: false,
        error: 'Maximum of 10 images per product allowed',
      };
    }

    // Upload image
    const uploadResult = await uploadImage(file, `products/${productId}`);

    // Determine if this should be the primary image
    const isPrimary = existingImages.length === 0;

    // Create image record
    const [image] = await db.insert(productImages).values({
      productId,
      imageUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      altText: altText || product.name,
      displayOrder: existingImages.length,
      isPrimary,
    }).returning();

    // Create audit log
    await createAuditLog(
      'UPLOAD_PRODUCT_IMAGE',
      'product_image',
      image.id,
      { productId, imageUrl: uploadResult.url },
      session.user.id
    );

    // Cache invalidation
    invalidateProductCache(productId);
    revalidatePath('/admin/products');
    revalidatePath(`/products/${product.slug}`);

    return { success: true, data: image };
  } catch (error) {
    console.error('Error uploading product image:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to upload image' };
  }
}

/**
 * Delete product image
 */
export async function deleteProductImage(imageId: string) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Get image
    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageId),
    });

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    // Get product for cache invalidation
    const product = await db.query.products.findFirst({
      where: eq(products.id, image.productId),
    });

    // Delete from storage
    try {
      await deleteImage(image.imageUrl);
      await deleteImage(image.thumbnailUrl);
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      // Continue with database deletion even if storage deletion fails
    }

    // If this was the primary image, set another image as primary
    if (image.isPrimary) {
      const otherImages = await db.query.productImages.findMany({
        where: and(
          eq(productImages.productId, image.productId),
          eq(productImages.isPrimary, false)
        ),
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
        limit: 1,
      });

      if (otherImages.length > 0) {
        await db
          .update(productImages)
          .set({ isPrimary: true })
          .where(eq(productImages.id, otherImages[0].id));
      }
    }

    // Delete image record
    await db.delete(productImages).where(eq(productImages.id, imageId));

    // Create audit log
    await createAuditLog(
      'DELETE_PRODUCT_IMAGE',
      'product_image',
      imageId,
      { productId: image.productId, imageUrl: image.imageUrl },
      session.user.id
    );

    // Cache invalidation
    if (product) {
      invalidateProductCache(image.productId);
      revalidatePath('/admin/products');
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product image:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to delete image' };
  }
}

/**
 * Set primary product image
 */
export async function setPrimaryImage(productId: string, imageId: string) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Get image
    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageId),
    });

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    // Verify image belongs to product
    if (image.productId !== productId) {
      return { success: false, error: 'Image does not belong to this product' };
    }

    // Get product for cache invalidation
    const product = await db.query.products.findFirst({
      where: eq(products.id, image.productId),
    });

    // Unset current primary image
    await db
      .update(productImages)
      .set({ isPrimary: false })
      .where(and(
        eq(productImages.productId, image.productId),
        eq(productImages.isPrimary, true)
      ));

    // Set new primary image
    await db
      .update(productImages)
      .set({ isPrimary: true })
      .where(eq(productImages.id, imageId));

    // Create audit log
    await createAuditLog(
      'SET_PRIMARY_IMAGE',
      'product_image',
      imageId,
      { productId: image.productId },
      session.user.id
    );

    // Cache invalidation
    if (product) {
      invalidateProductCache(image.productId);
      revalidatePath('/admin/products');
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting primary image:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to set primary image' };
  }
}

/**
 * Reorder product images
 */
export async function reorderProductImages(
  imageOrders: { id: string; displayOrder: number }[]
) {
  try {
    // Authorization check
    const session = await requireAdmin();

    if (imageOrders.length === 0) {
      return { success: false, error: 'No images to reorder' };
    }

    // Get first image to find product
    const firstImage = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageOrders[0].id),
    });

    if (!firstImage) {
      return { success: false, error: 'Image not found' };
    }

    // Update display order for each image
    for (const { id, displayOrder } of imageOrders) {
      await db
        .update(productImages)
        .set({ displayOrder })
        .where(eq(productImages.id, id));
    }

    // Get product for cache invalidation
    const product = await db.query.products.findFirst({
      where: eq(products.id, firstImage.productId),
    });

    // Create audit log
    await createAuditLog(
      'REORDER_PRODUCT_IMAGES',
      'product_image',
      'bulk',
      { productId: firstImage.productId, orders: imageOrders },
      session.user.id
    );

    // Cache invalidation
    if (product) {
      invalidateProductCache(firstImage.productId);
      revalidatePath('/admin/products');
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error reordering product images:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to reorder images' };
  }
}

/**
 * Update image alt text
 */
export async function updateImageAltText(imageId: string, altText: string) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Get image
    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageId),
    });

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    // Update alt text
    await db
      .update(productImages)
      .set({ altText })
      .where(eq(productImages.id, imageId));

    // Get product for cache invalidation
    const product = await db.query.products.findFirst({
      where: eq(products.id, image.productId),
    });

    // Create audit log
    await createAuditLog(
      'UPDATE_IMAGE_ALT_TEXT',
      'product_image',
      imageId,
      { productId: image.productId, altText },
      session.user.id
    );

    // Cache invalidation
    if (product) {
      invalidateProductCache(image.productId);
      revalidatePath('/admin/products');
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating image alt text:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to update alt text' };
  }
}
