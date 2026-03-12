import { db } from '@/db';
import { orders, orderItems, products, users } from '@/db/schema';
import { sql, desc, eq, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  // Get sales data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOrders = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      count: sql<number>`COUNT(*)::int`,
      revenue: sql<string>`SUM(${orders.total})`,
    })
    .from(orders)
    .where(gte(orders.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // Top selling products
  const topProducts = await db
    .select({
      productId: products.id,
      productName: products.name,
      totalSold: sql<number>`SUM(${orderItems.quantity})::int`,
      revenue: sql<string>`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .groupBy(products.id, products.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(10);

  // Customer statistics
  const customerStats = await db
    .select({
      totalCustomers: sql<number>`COUNT(DISTINCT ${users.id})::int`,
      activeCustomers: sql<number>`COUNT(DISTINCT CASE WHEN ${users.isActive} THEN ${users.id} END)::int`,
    })
    .from(users)
    .where(eq(users.role, 'customer'));

  const stats = customerStats[0] || { totalCustomers: 0, activeCustomers: 0 };

  return (
    <div>
      {/* Overview Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Orders (30d)</p>
          <p className="text-2xl font-bold text-gray-900">
            {recentOrders.reduce((sum, day) => sum + day.count, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Revenue (30d)</p>
          <p className="text-2xl font-bold text-gray-900">
            ${recentOrders.reduce((sum, day) => sum + parseFloat(day.revenue), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Active Customers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 30 Days)</h2>
        <div className="space-y-2">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          ) : (
            recentOrders.map((day) => (
              <div key={day.date} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">{day.date}</div>
                <div className="flex-1 flex items-center">
                  <div
                    className="bg-teal-500 h-8 rounded"
                    style={{
                      width: `${(parseFloat(day.revenue) / Math.max(...recentOrders.map((d) => parseFloat(d.revenue)))) * 100}%`,
                      minWidth: '2rem',
                    }}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    ${parseFloat(day.revenue).toFixed(2)} ({day.count} orders)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No product data available
                  </td>
                </tr>
              ) : (
                topProducts.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.totalSold}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(product.revenue).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
