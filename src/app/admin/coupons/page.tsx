import type { Metadata } from 'next';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { CouponsClient } from './coupons-client';

export const metadata: Metadata = {
  title: 'Manage Coupons - Admin',
};

export default async function AdminCouponsPage() {
  const allCoupons = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">{allCoupons.length} coupon{allCoupons.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <CouponsClient coupons={allCoupons.map(c => ({
        ...c,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        maxDiscountAmount: c.maxDiscountAmount,
        startsAt: c.startsAt?.toISOString() ?? null,
        expiresAt: c.expiresAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))} />
    </div>
  );
}
