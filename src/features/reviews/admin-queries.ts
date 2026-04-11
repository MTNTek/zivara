'use server';

import { db } from '@/db';
import { reviews, users, products } from '@/db/schema';
import { eq, desc, sql, and, ilike, or } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  productName: string | null;
  productId: string | null;
}

export interface ReviewsResult {
  reviews: AdminReview[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: {
    total: number;
    verified: number;
    averageRating: number;
    distribution: Record<number, number>;
  };
}

export async function getAdminReviews(opts: {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}): Promise<ReviewsResult> {
  await requireAdmin();

  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (opts.rating && opts.rating >= 1 && opts.rating <= 5) {
    conditions.push(eq(reviews.rating, opts.rating));
  }
  if (opts.search) {
    conditions.push(
      or(
        ilike(products.name, `%${opts.search}%`),
        ilike(users.name, `%${opts.search}%`),
        ilike(users.email, `%${opts.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      userName: users.name,
      userEmail: users.email,
      productName: products.name,
      productId: products.id,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(products, eq(reviews.productId, products.id));

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(where);

  const total = countResult?.count ?? 0;

  const data = where
    ? await baseQuery.where(where).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset)
    : await baseQuery.orderBy(desc(reviews.createdAt)).limit(limit).offset(offset);

  // Stats (unfiltered)
  const allStats = await db
    .select({
      total: sql<number>`count(*)::int`,
      verified: sql<number>`count(*) filter (where ${reviews.isVerifiedPurchase} = true)::int`,
      avg: sql<string>`COALESCE(avg(${reviews.rating}), 0)`,
    })
    .from(reviews);

  const distResult = await db
    .select({
      rating: reviews.rating,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .groupBy(reviews.rating);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distResult.forEach((r) => { distribution[r.rating] = r.count; });

  return {
    reviews: data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    stats: {
      total: allStats[0]?.total ?? 0,
      verified: allStats[0]?.verified ?? 0,
      averageRating: parseFloat(String(allStats[0]?.avg ?? '0')),
      distribution,
    },
  };
}
