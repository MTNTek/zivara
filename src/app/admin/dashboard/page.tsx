import { getDashboardStats, getRecentOrders, getLowStockProducts, getPendingOrdersCount, getLast7DaysRevenue, getLast7DaysOrders, getCouponStats, type RecentOrder, type LowStockProduct } from '@/features/admin/queries';
import { Sparkline } from '@/components/admin/sparkline';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStockProducts, pendingCount, revenueSparkline, ordersSparkline, couponStats] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(10),
    getLowStockProducts(8),
    getPendingOrdersCount(),
    getLast7DaysRevenue(),
    getLast7DaysOrders(),
    getCouponStats(),
  ]);

  return (
    <div>
      {/* Welcome Message */}
      <div className="mb-6">
        <p className="text-gray-600">Welcome to the Zivara admin panel</p>
      </div>

      {/* Alert Banners */}
      {(pendingCount > 0 || lowStockProducts.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {pendingCount > 0 && (
            <Link href="/admin/orders?status=pending" className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-lg text-sm hover:bg-yellow-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{pendingCount} pending order{pendingCount !== 1 ? 's' : ''}</span>
              <span>need attention</span>
            </Link>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">{lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''}</span>
              <span>running low on stock</span>
            </div>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <div className="mt-2">
                <Sparkline data={ordersSparkline} color="#2563eb" />
                <p className="text-[10px] text-gray-400 mt-0.5">Last 7 days</p>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${parseFloat(stats.totalRevenue).toFixed(2)}</p>
              <div className="mt-2">
                <Sparkline data={revenueSparkline} color="#16a34a" />
                <p className="text-[10px] text-gray-400 mt-0.5">Last 7 days</p>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Products + Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products / Users</p>
              <div className="mt-2 flex items-baseline gap-3">
                <div>
                  <span className="text-3xl font-bold text-gray-900">{stats.activeProducts}</span>
                  <span className="text-xs text-gray-500 ml-1">products</span>
                </div>
                <span className="text-gray-300">|</span>
                <div>
                  <span className="text-3xl font-bold text-gray-900">{stats.totalUsers}</span>
                  <span className="text-xs text-gray-500 ml-1">users</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today&apos;s Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${parseFloat(stats.todayRevenue).toFixed(2)}</p>
              {(() => {
                const today = parseFloat(stats.todayRevenue);
                const yesterday = parseFloat(stats.yesterdayRevenue);
                if (yesterday === 0) return null;
                const pctChange = ((today - yesterday) / yesterday) * 100;
                const isUp = pctChange >= 0;
                return (
                  <p className={`text-xs mt-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {isUp ? '↑' : '↓'} {Math.abs(pctChange).toFixed(0)}% vs yesterday
                  </p>
                );
              })()}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Week's Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${parseFloat(stats.weekRevenue).toFixed(2)}</p>
              {(() => {
                const thisWeek = parseFloat(stats.weekRevenue);
                const lastWeek = parseFloat(stats.lastWeekRevenue);
                if (lastWeek === 0) return null;
                const pctChange = ((thisWeek - lastWeek) / lastWeek) * 100;
                const isUp = pctChange >= 0;
                return (
                  <p className={`text-xs mt-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {isUp ? '↑' : '↓'} {Math.abs(pctChange).toFixed(0)}% vs last week
                  </p>
                );
              })()}
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Month's Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${parseFloat(stats.monthRevenue).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Link href="/admin/products/new" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow group text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Add Product</span>
        </Link>
        <Link href="/admin/orders?status=pending" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow group text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-200 transition-colors">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Pending Orders</span>
        </Link>
        <Link href="/admin/inventory" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow group text-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-red-200 transition-colors">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Inventory</span>
        </Link>
        <Link href="/admin/analytics" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow group text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Analytics</span>
        </Link>
        <Link href="/admin/messages" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow group text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Messages</span>
        </Link>
        <Link href="/admin/coupons" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow group text-center">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-200 transition-colors">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Coupons</span>
          {couponStats.activeCoupons > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">{couponStats.activeCoupons} active</p>
          )}
        </Link>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/products" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <p className="text-sm text-gray-600">Manage product catalog</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
              <p className="text-sm text-gray-600">Process and manage orders</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <p className="text-sm text-gray-600">Manage user accounts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: RecentOrder) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`} className="text-black hover:text-blue-800 font-medium">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.customerName || 'Guest'}</div>
                        <div className="text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Low Stock Alerts</h2>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {lowStockProducts.length}
              </span>
            </div>
            <Link href="/admin/inventory" className="text-sm text-blue-600 hover:text-blue-800">
              Manage inventory →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product: LowStockProduct) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.lowStockThreshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.quantity === 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
