import { db } from '@/db';
import { orders } from '@/db/schema';
import { sql, and, gte, lte, eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface OrderStatistics {
  totalRevenue: string;
  averageOrderValue: string;
  totalOrders: number;
}

/**
 * Get order statistics for admin dashboard
 * Validates: Requirement 21.7
 */
export async function getOrderStatistics(filters?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}): Promise<OrderStatistics> {
  try {
    // Build where conditions
    const conditions = [];
    
    // Exclude cancelled orders from revenue calculations
    conditions.push(sql`${orders.status} != 'cancelled'`);
    
    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(orders.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(orders.createdAt, filters.endDate));
    }
    
    if (filters?.userId) {
      conditions.push(eq(orders.userId, filters.userId));
    }

    const whereClause = conditions.length > 0 
      ? (conditions.length > 1 ? and(...conditions) : conditions[0])
      : undefined;

    // Get statistics
    const statsResult = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
        averageOrderValue: sql<string>`COALESCE(AVG(${orders.total}), 0)`,
        totalOrders: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(whereClause);

    const stats = statsResult[0];

    return {
      totalRevenue: stats?.totalRevenue ?? '0',
      averageOrderValue: stats?.averageOrderValue ?? '0',
      totalOrders: stats?.totalOrders ?? 0,
    };
  } catch (error) {
    logger.error('Error fetching order statistics', { error: error instanceof Error ? error.message : String(error) });
    return {
      totalRevenue: '0',
      averageOrderValue: '0',
      totalOrders: 0,
    };
  }
}
