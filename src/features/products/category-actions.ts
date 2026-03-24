'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { categories, products, auditLogs } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { categorySchema, updateCategorySchema } from './schemas';
import { requireAdmin } from '@/lib/auth';
import { getCategoryDepth } from './queries';
import { invalidateCategoryCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import type { CategoryInput, UpdateCategoryInput } from './schemas';

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
    logger.error('Failed to create audit log', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Validate category hierarchy depth
 */
async function validateCategoryHierarchy(parentId: string | null | undefined): Promise<{ valid: boolean; error?: string }> {
  if (!parentId) {
    return { valid: true }; // Root level category
  }

  const depth = await getCategoryDepth(parentId);
  
  // Max depth is 3 levels (0-indexed: 0, 1, 2)
  // If parent is at depth 2, we can't add a child
  if (depth >= 2) {
    return {
      valid: false,
      error: 'Category hierarchy cannot exceed 3 levels',
    };
  }

  return { valid: true };
}

/**
 * Check if category name is unique within the same parent level
 */
async function isCategoryNameUnique(
  name: string,
  parentId: string | null | undefined,
  excludeId?: string
): Promise<boolean> {
  const conditions = [eq(categories.name, name)];
  
  if (parentId) {
    conditions.push(eq(categories.parentId, parentId));
  } else {
    conditions.push(isNull(categories.parentId));
  }

  const existing = await db.query.categories.findFirst({
    where: and(...conditions),
  });

  // If we're updating, exclude the current category from the check
  if (existing && excludeId && existing.id === excludeId) {
    return true;
  }

  return !existing;
}

/**
 * Create a new category
 */
export async function createCategory(data: CategoryInput) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Validation
    const validated = categorySchema.parse(data);

    // Validate hierarchy depth
    const hierarchyCheck = await validateCategoryHierarchy(validated.parentId);
    if (!hierarchyCheck.valid) {
      return { success: false, error: hierarchyCheck.error };
    }

    // Check unique name within parent level
    const isUnique = await isCategoryNameUnique(validated.name, validated.parentId);
    if (!isUnique) {
      return {
        success: false,
        error: 'A category with this name already exists at this level',
      };
    }

    // Create category
    const [category] = await db.insert(categories).values({
      name: validated.name,
      slug: validated.slug,
      parentId: validated.parentId || null,
      description: validated.description || null,
      imageUrl: validated.imageUrl || null,
      displayOrder: validated.displayOrder,
    }).returning();

    // Create audit log
    await createAuditLog(
      'CREATE_CATEGORY',
      'category',
      category.id,
      { category: validated },
      session.user.id
    );

    // Cache invalidation
    invalidateCategoryCache(category.id);
    revalidatePath('/admin/categories');
    revalidatePath('/products');

    return { success: true, data: category };
  } catch (error) {
    logger.error('Error creating category', { error: error instanceof Error ? error.message : String(error) });
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create category' };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(data: UpdateCategoryInput) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Validation
    const validated = updateCategorySchema.parse(data);
    const { id, ...updateData } = validated;

    // Get existing category
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // If changing parent, validate hierarchy
    if (updateData.parentId !== undefined) {
      // Prevent setting self as parent
      if (updateData.parentId === id) {
        return { success: false, error: 'Category cannot be its own parent' };
      }

      // Validate hierarchy depth
      const hierarchyCheck = await validateCategoryHierarchy(updateData.parentId);
      if (!hierarchyCheck.valid) {
        return { success: false, error: hierarchyCheck.error };
      }

      // Check if the new parent is a descendant of this category
      // (would create a circular reference)
      if (updateData.parentId) {
        let currentId: string | null = updateData.parentId;
        let depth = 0;
        
        while (currentId && depth < 10) {
          if (currentId === id) {
            return {
              success: false,
              error: 'Cannot move category under its own descendant',
            };
          }
          
          const parent: { parentId: string | null } | undefined = await db.query.categories.findFirst({
            where: eq(categories.id, currentId),
            columns: { parentId: true },
          });
          
          currentId = parent?.parentId || null;
          depth++;
        }
      }
    }

    // Check unique name if name or parent is changing
    if (updateData.name !== undefined || updateData.parentId !== undefined) {
      const nameToCheck = updateData.name ?? existingCategory.name;
      const parentToCheck = updateData.parentId !== undefined ? updateData.parentId : existingCategory.parentId;
      
      const isUnique = await isCategoryNameUnique(nameToCheck, parentToCheck, id);
      if (!isUnique) {
        return {
          success: false,
          error: 'A category with this name already exists at this level',
        };
      }
    }

    // Prepare update data
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updateData.name !== undefined) updates.name = updateData.name;
    if (updateData.slug !== undefined) updates.slug = updateData.slug;
    if (updateData.parentId !== undefined) updates.parentId = updateData.parentId;
    if (updateData.description !== undefined) updates.description = updateData.description;
    if (updateData.imageUrl !== undefined) updates.imageUrl = updateData.imageUrl;
    if (updateData.displayOrder !== undefined) updates.displayOrder = updateData.displayOrder;

    // Update category
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();

    // Create audit log
    await createAuditLog(
      'UPDATE_CATEGORY',
      'category',
      id,
      { before: existingCategory, after: updates },
      session.user.id
    );

    // Cache invalidation
    invalidateCategoryCache(id);
    revalidatePath('/admin/categories');
    revalidatePath('/products');

    return { success: true, data: category };
  } catch (error) {
    logger.error('Error updating category', { error: error instanceof Error ? error.message : String(error) });
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to update category' };
  }
}

/**
 * Delete a category and reassign products
 */
export async function deleteCategory(id: string) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Get existing category
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        children: true,
      },
    });

    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Check if category has children
    if (existingCategory.children && existingCategory.children.length > 0) {
      return {
        success: false,
        error: 'Cannot delete category with subcategories. Please delete or move subcategories first.',
      };
    }

    // Get products in this category
    const categoryProducts = await db.query.products.findMany({
      where: eq(products.categoryId, id),
    });

    // Reassign products to parent category or root level
    const newCategoryId = existingCategory.parentId;
    
    if (categoryProducts.length > 0) {
      if (newCategoryId) {
        // Reassign to parent category
        await db
          .update(products)
          .set({ categoryId: newCategoryId, updatedAt: new Date() })
          .where(eq(products.categoryId, id));
      } else {
        // If no parent, we need a default category
        // For now, return an error - in production, you'd have a default "Uncategorized" category
        return {
          success: false,
          error: 'Cannot delete root category with products. Please reassign products first.',
        };
      }
    }

    // Delete category
    await db.delete(categories).where(eq(categories.id, id));

    // Create audit log
    await createAuditLog(
      'DELETE_CATEGORY',
      'category',
      id,
      {
        categoryName: existingCategory.name,
        productsReassigned: categoryProducts.length,
        newCategoryId,
      },
      session.user.id
    );

    // Cache invalidation
    invalidateCategoryCache(id);
    revalidatePath('/admin/categories');
    revalidatePath('/products');

    return {
      success: true,
      data: {
        deletedCategory: existingCategory.name,
        productsReassigned: categoryProducts.length,
      },
    };
  } catch (error) {
    logger.error('Error deleting category', { error: error instanceof Error ? error.message : String(error) });
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to delete category' };
  }
}

/**
 * Reorder categories
 */
export async function reorderCategories(categoryOrders: { id: string; displayOrder: number }[]) {
  try {
    // Authorization check
    const session = await requireAdmin();

    // Update display order for each category
    for (const { id, displayOrder } of categoryOrders) {
      await db
        .update(categories)
        .set({ displayOrder, updatedAt: new Date() })
        .where(eq(categories.id, id));
      
      // Invalidate cache for each category
      invalidateCategoryCache(id);
    }

    // Create audit log
    await createAuditLog(
      'REORDER_CATEGORIES',
      'category',
      'bulk',
      { orders: categoryOrders },
      session.user.id
    );

    // Cache invalidation
    revalidatePath('/admin/categories');
    revalidatePath('/products');

    return { success: true };
  } catch (error) {
    logger.error('Error reordering categories', { error: error instanceof Error ? error.message : String(error) });
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to reorder categories' };
  }
}
