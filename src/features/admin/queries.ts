import { db } from '@/db';
import { orders, products, users } from '@/db/schema';
import { sql, and, gte, eq, desc } from 'drizzle-orm';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: string;
  activeProducts: number;
  todayRevenue: string;
  weekRevenue: string;
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
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
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
    todayRevenue,
    weekRevenue,
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
