'use server';

import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function toggleCouponStatus(couponId: string, isActive: boolean) {
  try {
    await db.update(coupons).set({ isActive, updatedAt: new Date() }).where(eq(coupons.id, couponId));
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update coupon' };
  }
}

export async function createCouponAction(input: {
  code: string;
  description?: string;
  discountType: string;
  discountValue: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  usageLimit?: number;
  perUserLimit?: number;
  expiresAt?: string;
}) {
  try {
    if (!input.code || !input.discountValue) {
      return { success: false, error: 'Code and value are required' };
    }

    await db.insert(coupons).values({
      code: input.code.toUpperCase(),
      description: input.description || null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount || null,
      maxDiscountAmount: input.maxDiscountAmount || null,
      usageLimit: input.usageLimit ?? null,
      perUserLimit: input.perUserLimit ?? 1,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });

    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create coupon';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return { success: false, error: 'A coupon with this code already exists' };
    }
    return { success: false, error: msg };
  }
}
