import { db } from '@/db';
import { orders, orderItems, products, categories, users, reviews, searchQueries } from '@/db/schema';
import { sql, desc, eq, gte, and } from 'drizzle-orm';

export type TimePeriod = '7d' | '30d' | '90d' | 'all';

function getStartDate(period: TimePeriod): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  d.setDate(d.getDate() - days);
  return d;
}

export interface OverviewStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  totalProductsSold: number;
  cancelledOrders: number;
  fulfillmentRate: number;
}

export async function getOverviewStats(period: TimePeriod): Promise<OverviewStats> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(orders.createdAt, startDate) : undefined;
  const nonCancelled = sql`${orders.status} != 'cancelled'`;

  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`COUNT(*)::int`,
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${nonCancelled} THEN ${orders.total}::numeric ELSE 0 END), 0)::numeric`,
      cancelledOrders: sql<number>`COUNT(CASE WHEN ${orders.status} = 'cancelled' THEN 1 END)::int`,
      deliveredOrders: sql<number>`COUNT(CASE WHEN ${orders.status} = 'delivered' THEN 1 END)::int`,
    })
    .from(orders)
    .where(dateFilter);

  const [itemStats] = await db
    .select({
      totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(dateFilter ? and(dateFilter, nonCancelled) : nonCancelled);

  const customerDateFilter = startDate ? gte(users.createdAt, startDate) : undefined;
  const [customerStats] = await db
    .select({
      totalCustomers: sql<number>`COUNT(*)::int`,
    })
    .from(users)
    .where(eq(users.role, 'customer'));

  const [newCustomerStats] = await db
    .select({
      newCustomers: sql<number>`COUNT(*)::int`,
    })
    .from(users)
    .where(customerDateFilter ? and(eq(users.role, 'customer'), customerDateFilter) : eq(users.role, 'customer'));

  const totalOrders = orderStats?.totalOrders ?? 0;
  const totalRevenue = Number(orderStats?.totalRevenue ?? 0);
  const nonCancelledOrders = totalOrders - (orderStats?.cancelledOrders ?? 0);

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue: nonCancelledOrders > 0 ? totalRevenue / nonCancelledOrders : 0,
    totalCustomers: customerStats?.totalCustomers ?? 0,
    newCustomers: newCustomerStats?.newCustomers ?? 0,
    totalProductsSold: itemStats?.totalSold ?? 0,
    cancelledOrders: orderStats?.cancelledOrders ?? 0,
    fulfillmentRate: totalOrders > 0
      ? ((orderStats?.deliveredOrders ?? 0) / totalOrders) * 100
      : 0,
  };
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export async function getDailyRevenue(period: TimePeriod): Promise<DailyRevenue[]> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(orders.createdAt, startDate) : undefined;
  const nonCancelled = sql`${orders.status} != 'cancelled'`;

  const rows = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<number>`COALESCE(SUM(${orders.total}::numeric), 0)::numeric`,
      orders: sql<number>`COUNT(*)::int`,
    })
    .from(orders)
    .where(dateFilter ? and(dateFilter, nonCancelled) : nonCancelled)
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  return rows.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
    orders: r.orders,
  }));
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
}

export async function getOrderStatusBreakdown(period: TimePeriod): Promise<OrderStatusBreakdown[]> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(orders.createdAt, startDate) : undefined;

  return db
    .select({
      status: orders.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(orders)
    .where(dateFilter)
    .groupBy(orders.status)
    .orderBy(desc(sql`COUNT(*)`));
}

export interface CategoryRevenue {
  categoryName: string;
  revenue: number;
  unitsSold: number;
}

export async function getRevenueByCategory(period: TimePeriod): Promise<CategoryRevenue[]> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(orders.createdAt, startDate) : undefined;
  const nonCancelled = sql`${orders.status} != 'cancelled'`;

  const condition = dateFilter ? and(dateFilter, nonCancelled) : nonCancelled;

  const rows = await db
    .select({
      categoryName: sql<string>`COALESCE(${categories.name}, 'Uncategorized')`,
      revenue: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase}::numeric), 0)::numeric`,
      unitsSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(condition)
    .groupBy(categories.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase}::numeric)`))
    .limit(10);

  return rows.map((r) => ({
    categoryName: r.categoryName,
    revenue: Number(r.revenue),
    unitsSold: r.unitsSold,
  }));
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export async function getTopProducts(period: TimePeriod, limit = 10): Promise<TopProduct[]> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(orders.createdAt, startDate) : undefined;
  const nonCancelled = sql`${orders.status} != 'cancelled'`;
  const condition = dateFilter ? and(dateFilter, nonCancelled) : nonCancelled;

  const rows = await db
    .select({
      productId: sql<string>`COALESCE(${products.id}::text, '')`,
      productName: sql<string>`COALESCE(${products.name}, ${orderItems.productName})`,
      totalSold: sql<number>`SUM(${orderItems.quantity})::int`,
      revenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase}::numeric)::numeric`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(condition)
    .groupBy(products.id, products.name, orderItems.productName)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    totalSold: r.totalSold,
    revenue: Number(r.revenue),
  }));
}

export interface RecentReviewStat {
  totalReviews: number;
  averageRating: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export async function getReviewStats(period: TimePeriod): Promise<RecentReviewStat> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(reviews.createdAt, startDate) : undefined;

  const [stats] = await db
    .select({
      totalReviews: sql<number>`COUNT(*)::int`,
      averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::numeric`,
      fiveStar: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 5 THEN 1 END)::int`,
      fourStar: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 4 THEN 1 END)::int`,
      threeStar: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 3 THEN 1 END)::int`,
      twoStar: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 2 THEN 1 END)::int`,
      oneStar: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 1 THEN 1 END)::int`,
    })
    .from(reviews)
    .where(dateFilter);

  return {
    totalReviews: stats?.totalReviews ?? 0,
    averageRating: Number(stats?.averageRating ?? 0),
    fiveStar: stats?.fiveStar ?? 0,
    fourStar: stats?.fourStar ?? 0,
    threeStar: stats?.threeStar ?? 0,
    twoStar: stats?.twoStar ?? 0,
    oneStar: stats?.oneStar ?? 0,
  };
}

export interface TopSearchQuery {
  query: string;
  count: number;
  avgResults: number;
}

export async function getTopSearchQueries(period: TimePeriod, limit = 10): Promise<TopSearchQuery[]> {
  const startDate = getStartDate(period);
  const dateFilter = startDate ? gte(searchQueries.createdAt, startDate) : undefined;

  const rows = await db
    .select({
      query: searchQueries.query,
      count: sql<number>`COUNT(*)::int`,
      avgResults: sql<number>`COALESCE(AVG(${searchQueries.resultsCount}), 0)::int`,
    })
    .from(searchQueries)
    .where(dateFilter)
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  return rows.map((r) => ({
    query: r.query,
    count: r.count,
    avgResults: r.avgResults,
  }));
}
