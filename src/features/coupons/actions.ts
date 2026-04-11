'use server';

import { db } from '@/db';
import { coupons, couponUsages } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';

export interface CouponValidationResult {
  success: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: string;
    description: string | null;
    minOrderAmount: string | null;
    maxDiscountAmount: string | null;
  };
  discount?: number;
}

/**
 * Validate and calculate discount for a coupon code
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  try {
    if (!code || !code.trim()) {
      return { success: false, error: 'Please enter a coupon code' };
    }

    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code.trim().toUpperCase()),
        eq(coupons.isActive, true),
      ),
    });

    if (!coupon) {
      return { success: false, error: 'Invalid coupon code' };
    }

    // Check date validity
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return { success: false, error: 'This coupon is not yet active' };
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return { success: false, error: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: 'This coupon has reached its usage limit' };
    }

    // Check per-user limit
    const userId = await getCurrentUserId();
    if (userId && coupon.perUserLimit) {
      const userUsageResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(couponUsages)
        .where(and(
          eq(couponUsages.couponId, coupon.id),
          eq(couponUsages.userId, userId),
        ));
      const userUsageCount = userUsageResult[0]?.count ?? 0;
      if (userUsageCount >= coupon.perUserLimit) {
        return { success: false, error: 'You have already used this coupon' };
      }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return {
        success: false,
        error: `Minimum order of $${Number(coupon.minOrderAmount).toFixed(2)} required`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = subtotal * (Number(coupon.discountValue) / 100);
    } else {
      discount = Number(coupon.discountValue);
    }

    // Cap at max discount
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    }

    // Cap at subtotal
    discount = Math.min(discount, subtotal);
    discount = Math.round(discount * 100) / 100;

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
      discount,
    };
  } catch {
    return { success: false, error: 'Failed to validate coupon' };
  }
}

/**
 * Record coupon usage after order is placed
 */
export async function recordCouponUsage(couponId: string, orderId: string, discountApplied: number) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    await tx.insert(couponUsages).values({
      couponId,
      userId: userId || undefined,
      orderId,
      discountApplied: discountApplied.toFixed(2),
    });

    await tx
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1`, updatedAt: new Date() })
      .where(eq(coupons.id, couponId));
  });
}
