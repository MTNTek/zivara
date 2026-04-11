import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlistItems } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ count: 0 });

  const [result] = await db
    .select({ count: count() })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  return NextResponse.json({ count: result?.count ?? 0 });
}
