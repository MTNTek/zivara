import { db } from '@/db';
import { orders, products, users, inventory, coupons } from '@/db/schema';
import { sql, and, gte, eq, desc, lte } from 'drizzle-orm';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: string;
  activeProducts: number;
  totalUsers: number;
  todayRevenue: string;
  yesterdayRevenue: string;
  weekRevenue: string;
  lastWeekRevenue: string;
  monthRevenue: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: Date;
}

/**
 * Get dashboard statistics including total orders, revenue, and active products
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfDay);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get total orders count
  const totalOrdersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders);
  const totalOrders = totalOrdersResult[0]?.count ?? 0;

  // Get total revenue (all time)
  const totalRevenueResult = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`);
  const totalRevenue = totalRevenueResult[0]?.sum ?? '0';

  // Get active products count
  const activeProductsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true));
  const activeProducts = activeProductsResult[0]?.count ?? 0;

  // Get total users count
  const totalUsersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  const totalUsers = totalUsersResult[0]?.count ?? 0;

  // Get today's revenue
  const todayRevenueResult = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startOfDay),
        sql`${orders.status} != 'cancelled'`
      )
    );
  const todayRevenue = todayRevenueResult[0]?.sum ?? '0';

  // Get yesterday's revenue
  const yesterdayRevenueResult = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startOfYesterday),
        lte(orders.createdAt, startOfDay),
        sql`${orders.status} != 'cancelled'`
      )
    );
  const yesterdayRevenue = yesterdayRevenueResult[0]?.sum ?? '0';

  // Get this week's revenue
  const weekRevenueResult = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startOfWeek),
        sql`${orders.status} != 'cancelled'`
      )
    );
  const weekRevenue = weekRevenueResult[0]?.sum ?? '0';

  // Get last week's revenue
  const lastWeekRevenueResult = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startOfLastWeek),
        lte(orders.createdAt, startOfWeek),
        sql`${orders.status} != 'cancelled'`
      )
    );
  const lastWeekRevenue = lastWeekRevenueResult[0]?.sum ?? '0';

  // Get this month's revenue
  const monthRevenueResult = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startOfMonth),
        sql`${orders.status} != 'cancelled'`
      )
    );
  const monthRevenue = monthRevenueResult[0]?.sum ?? '0';

  return {
    totalOrders,
    totalRevenue,
    activeProducts,
    totalUsers,
    todayRevenue,
    yesterdayRevenue,
    weekRevenue,
    lastWeekRevenue,
    monthRevenue,
  };
}

/**
 * Get recent orders with status and customer information
 */
export async function getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      customerName: users.name,
      customerEmail: sql<string>`COALESCE(${users.email}, ${orders.guestEmail})`,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return recentOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    createdAt: order.createdAt,
  }));
}


export interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
}

/**
 * Get products with low stock (quantity <= threshold)
 */
export async function getLowStockProducts(limit: number = 10): Promise<LowStockProduct[]> {
  const results = await db
    .select({
      id: products.id,
      name: products.name,
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(
      and(
        eq(products.isActive, true),
        sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`
      )
    )
    .orderBy(inventory.quantity)
    .limit(limit);

  return results;
}

/**
 * Get count of pending orders
 */
export async function getPendingOrdersCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, 'pending'));
  return result[0]?.count ?? 0;
}

/**
 * Get daily revenue for the last 7 days (for sparkline charts)
 */
export async function getLast7DaysRevenue(): Promise<number[]> {
  const result = await db.execute<{ revenue: number }>(sql`
    SELECT
      d::date AS day,
      COALESCE(SUM(o.total), 0)::float AS revenue
    FROM generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      '1 day'
    ) AS d
    LEFT JOIN ${orders} o
      ON o.created_at::date = d::date
      AND o.status != 'cancelled'
    GROUP BY d::date
    ORDER BY d::date
  `);
  return Array.from(result).map((r) => Number(r.revenue));
}

/**
 * Get daily order counts for the last 7 days (for sparkline charts)
 */
export async function getLast7DaysOrders(): Promise<number[]> {
  const result = await db.execute<{ count: number }>(sql`
    SELECT
      d::date AS day,
      COALESCE(COUNT(o.id), 0)::int AS count
    FROM generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      '1 day'
    ) AS d
    LEFT JOIN ${orders} o
      ON o.created_at::date = d::date
    GROUP BY d::date
    ORDER BY d::date
  `);
  return Array.from(result).map((r) => Number(r.count));
}

export interface CouponStats {
  activeCoupons: number;
  totalUsages: number;
  totalSavings: number;
}

export async function getCouponStats(): Promise<CouponStats> {
  const [activeResult] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(coupons)
    .where(eq(coupons.isActive, true));

  const [usageResult] = await db.execute<{ total_usages: number; total_savings: number }>(sql`
    SELECT
      COALESCE(SUM(used_count), 0)::int as total_usages,
      COALESCE((SELECT SUM(discount_applied::numeric) FROM coupon_usages), 0)::numeric as total_savings
    FROM coupons
  `);

  return {
    activeCoupons: activeResult?.count ?? 0,
    totalUsages: Number(usageResult?.total_usages ?? 0),
    totalSavings: Number(usageResult?.total_savings ?? 0),
  };
}
