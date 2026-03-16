'use server';

import { eq, and, or, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { markupRules, suppliers, categories, products, productSupplierLinks } from '@/db/schema';
import { recalculateAllPrices } from './price-engine';

export async function createMarkupRule(data: {
  supplierId?: string;
  categoryId?: string;
  productId?: string;
  markupType: 'percentage' | 'fixed';
  markupValue: number;
  priority?: number;
}): Promise<{ success: boolean; ruleId?: string; error?: string }> {
  try {
    // Validate scope references exist
    if (data.supplierId) {
      const [supplier] = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, data.supplierId))
        .limit(1);
      if (!supplier) {
        return { success: false, error: 'Supplier not found' };
      }
    }

    if (data.categoryId) {
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);
      if (!category) {
        return { success: false, error: 'Category not found' };
      }
    }

    if (data.productId) {
      const [product] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, data.productId))
        .limit(1);
      if (!product) {
        return { success: false, error: 'Product not found' };
      }
    }

    // Validate markup value
    if (data.markupValue < 0) {
      return { success: false, error: 'Markup value must be non-negative' };
    }

    if (data.markupType !== 'percentage' && data.markupType !== 'fixed') {
      return { success: false, error: 'Markup type must be "percentage" or "fixed"' };
    }

    const [rule] = await db
      .insert(markupRules)
      .values({
        supplierId: data.supplierId ?? null,
        categoryId: data.categoryId ?? null,
        productId: data.productId ?? null,
        markupType: data.markupType,
        markupValue: String(data.markupValue),
        priority: data.priority ?? 0,
        isActive: true,
      })
      .returning({ id: markupRules.id });

    // Trigger price recalculation for affected products
    const scope: { supplierId?: string; categoryId?: string; productId?: string } = {};
    if (data.productId) scope.productId = data.productId;
    else if (data.categoryId) scope.categoryId = data.categoryId;
    else if (data.supplierId) scope.supplierId = data.supplierId;

    await recalculateAllPrices(scope);

    revalidatePath('/admin/markup-rules');
    return { success: true, ruleId: rule.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateMarkupRule(
  ruleId: string,
  data: Partial<{
    markupType: string;
    markupValue: number;
    priority: number;
    isActive: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch existing rule to determine scope for recalculation
    const [existing] = await db
      .select()
      .from(markupRules)
      .where(eq(markupRules.id, ruleId))
      .limit(1);

    if (!existing) {
      return { success: false, error: 'Markup rule not found' };
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.markupType !== undefined) updateData.markupType = data.markupType;
    if (data.markupValue !== undefined) updateData.markupValue = String(data.markupValue);
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db
      .update(markupRules)
      .set(updateData)
      .where(eq(markupRules.id, ruleId));

    // Trigger price recalculation for affected products
    const scope: { supplierId?: string; categoryId?: string; productId?: string } = {};
    if (existing.productId) scope.productId = existing.productId;
    else if (existing.categoryId) scope.categoryId = existing.categoryId;
    else if (existing.supplierId) scope.supplierId = existing.supplierId;

    await recalculateAllPrices(scope);

    revalidatePath('/admin/markup-rules');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function deleteMarkupRule(
  ruleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db
      .select()
      .from(markupRules)
      .where(eq(markupRules.id, ruleId))
      .limit(1);

    if (!existing) {
      return { success: false, error: 'Markup rule not found' };
    }

    // Check if this is the sole rule covering active products
    // Build conditions to find other rules at the same scope
    const conditions = [];
    if (existing.productId) {
      conditions.push(eq(markupRules.productId, existing.productId));
    } else if (existing.categoryId) {
      conditions.push(eq(markupRules.categoryId, existing.categoryId));
    } else if (existing.supplierId) {
      conditions.push(eq(markupRules.supplierId, existing.supplierId));
    }

    if (conditions.length > 0) {
      // Count other active rules at the same scope (excluding this one)
      const otherRules = await db
        .select({ cnt: count() })
        .from(markupRules)
        .where(
          and(
            ...conditions,
            eq(markupRules.isActive, true),
          )
        );

      const totalActiveRules = otherRules[0]?.cnt ?? 0;

      // If this is the only active rule at this scope, check if there are active products
      if (totalActiveRules <= 1 && existing.isActive) {
        let hasActiveProducts = false;

        if (existing.productId) {
          const [product] = await db
            .select({ isActive: products.isActive })
            .from(products)
            .where(eq(products.id, existing.productId))
            .limit(1);
          hasActiveProducts = product?.isActive ?? false;
        } else if (existing.categoryId) {
          const [result] = await db
            .select({ cnt: count() })
            .from(products)
            .where(and(eq(products.categoryId, existing.categoryId), eq(products.isActive, true)));
          hasActiveProducts = (result?.cnt ?? 0) > 0;
        } else if (existing.supplierId) {
          const [result] = await db
            .select({ cnt: count() })
            .from(productSupplierLinks)
            .innerJoin(products, eq(products.id, productSupplierLinks.productId))
            .where(
              and(
                eq(productSupplierLinks.supplierId, existing.supplierId),
                eq(products.isActive, true)
              )
            );
          hasActiveProducts = (result?.cnt ?? 0) > 0;
        }

        if (hasActiveProducts) {
          return {
            success: false,
            error: 'Cannot delete the only active markup rule covering active products. Assign an alternative rule first.',
          };
        }
      }
    }

    await db.delete(markupRules).where(eq(markupRules.id, ruleId));

    revalidatePath('/admin/markup-rules');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
