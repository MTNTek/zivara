import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { orders, contactMessages } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ pendingOrders: 0, newMessages: 0 });
  }

  const [orderResult, messageResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.status, 'pending')),
    db.select({ count: sql<number>`count(*)::int` }).from(contactMessages).where(eq(contactMessages.status, 'new')),
  ]);

  return NextResponse.json({
    pendingOrders: orderResult[0]?.count ?? 0,
    newMessages: messageResult[0]?.count ?? 0,
  });
}
