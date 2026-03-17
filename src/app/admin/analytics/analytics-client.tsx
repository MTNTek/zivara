'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type {
  OverviewStats,
  DailyRevenue,
  OrderStatusBreakdown,
  CategoryRevenue,
  TopProduct,
  RecentReviewStat,
  TimePeriod,
} from '@/features/admin/analytics-queries';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString('en-US');
}

interface Props {
  period: TimePeriod;
  stats: OverviewStats;
  dailyRevenue: DailyRevenue[];
  statusBreakdown: OrderStatusBreakdown[];
  categoryRevenue: CategoryRevenue[];
  topProducts: TopProduct[];
  reviewStats: RecentReviewStat;
}

export default function AnalyticsClient({
  period,
  stats,
  dailyRevenue,
  statusBreakdown,
  categoryRevenue,
  topProducts,
  reviewStats,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPeriod(p: TimePeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', p);
    router.push(`/admin/analytics?${params.toString()}`);
  }

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);
  const totalStatusOrders = statusBreakdown.reduce((s, b) => s + b.count, 0);
  const maxCategoryRevenue = Math.max(...categoryRevenue.map((c) => c.revenue), 1);

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div>
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`$${fmt(stats.totalRevenue)}`} icon="revenue" color="blue" />
        <StatCard label="Total Orders" value={fmtInt(stats.totalOrders)} icon="orders" color="indigo" />
        <StatCard label="Avg Order Value" value={`$${fmt(stats.averageOrderValue)}`} icon="avg" color="green" />
        <StatCard label="Products Sold" value={fmtInt(stats.totalProductsSold)} icon="products" color="purple" />
        <StatCard label="Total Customers" value={fmtInt(stats.totalCustomers)} icon="customers" color="cyan" />
        <StatCard label="New Customers" value={fmtInt(stats.newCustomers)} icon="new" color="teal" />
        <StatCard label="Fulfillment Rate" value={`${stats.fulfillmentRate.toFixed(1)}%`} icon="fulfillment" color="emerald" />
        <StatCard label="Cancelled Orders" value={fmtInt(stats.cancelledOrders)} icon="cancelled" color="red" />
      </div>

      {/* Revenue Chart + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          {dailyRevenue.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No revenue data for this period</p>
          ) : (
            <div className="relative">
              {/* Y-axis labels */}
              <div className="flex items-end gap-[2px]" style={{ height: 220 }}>
                {dailyRevenue.map((d, i) => {
                  const h = (d.revenue / maxRevenue) * 200;
                  return (
                    <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                      <div className="hidden group-hover:block absolute -top-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {d.date}: ${fmt(d.revenue)} ({d.orders} orders)
                      </div>
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-colors min-h-[2px]"
                        style={{ height: Math.max(h, 2) }}
                      />
                    </div>
                  );
                })}
              </div>
              {/* X-axis labels (show every nth) */}
              <div className="flex gap-[2px] mt-2">
                {dailyRevenue.map((d, i) => {
                  const showLabel = dailyRevenue.length <= 14 || i % Math.ceil(dailyRevenue.length / 7) === 0;
                  return (
                    <div key={i} className="flex-1 text-center">
                      {showLabel && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
          {statusBreakdown.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map((s) => {
                const pct = totalStatusOrders > 0 ? (s.count / totalStatusOrders) * 100 : 0;
                const color = STATUS_COLORS[s.status] || '#6b7280';
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{STATUS_LABELS[s.status] || s.status}</span>
                      <span className="text-gray-500">{s.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-gray-100 text-sm text-gray-500">
                Total: {fmtInt(totalStatusOrders)} orders
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Revenue + Review Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue by Category */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          {categoryRevenue.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No category data available</p>
          ) : (
            <div className="space-y-3">
              {categoryRevenue.map((c, i) => {
                const pct = (c.revenue / maxCategoryRevenue) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{c.categoryName}</span>
                      <span className="text-gray-500">${fmt(c.revenue)} · {fmtInt(c.unitsSold)} units</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h2>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-900">{reviewStats.averageRating.toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating) ? 'text-[#de7921]' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{fmtInt(reviewStats.totalReviews)} reviews</p>
          </div>
          <div className="space-y-2">
            {[
              { label: '5 star', count: reviewStats.fiveStar, color: '#10b981' },
              { label: '4 star', count: reviewStats.fourStar, color: '#34d399' },
              { label: '3 star', count: reviewStats.threeStar, color: '#fbbf24' },
              { label: '2 star', count: reviewStats.twoStar, color: '#f97316' },
              { label: '1 star', count: reviewStats.oneStar, color: '#ef4444' },
            ].map((r) => {
              const pct = reviewStats.totalReviews > 0 ? (r.count / reviewStats.totalReviews) * 100 : 0;
              return (
                <div key={r.label} className="flex items-center gap-2 text-sm">
                  <span className="w-12 text-gray-600">{r.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: r.color }} />
                  </div>
                  <span className="w-8 text-right text-gray-500">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No product data available</td>
                </tr>
              ) : (
                topProducts.map((p, i) => {
                  const totalRev = topProducts.reduce((s, x) => s + x.revenue, 0);
                  const share = totalRev > 0 ? (p.revenue / totalRev) * 100 : 0;
                  return (
                    <tr key={p.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">#{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{fmtInt(p.totalSold)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">${fmt(p.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-gray-500 w-12 text-right">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    cyan: 'bg-cyan-50',
    teal: 'bg-teal-50',
    emerald: 'bg-emerald-50',
    red: 'bg-red-50',
  };
  const iconColorMap: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    cyan: 'text-cyan-600',
    teal: 'text-teal-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
  };

  const iconPaths: Record<string, string> = {
    revenue: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    orders: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    avg: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    customers: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    new: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    fulfillment: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    cancelled: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgMap[color] || 'bg-gray-50'}`}>
          <svg className={`w-5 h-5 ${iconColorMap[color] || 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon] || iconPaths.revenue} />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
