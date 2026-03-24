import {
  getOverviewStats,
  getDailyRevenue,
  getOrderStatusBreakdown,
  getRevenueByCategory,
  getTopProducts,
  getReviewStats,
  getTopSearchQueries,
  type TimePeriod,
} from '@/features/admin/analytics-queries';
import AnalyticsClient from './analytics-client';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const params = await searchParams;
  const period = (['7d', '30d', '90d', 'all'].includes(params.period || '')
    ? params.period
    : '30d') as TimePeriod;

  const [stats, dailyRevenue, statusBreakdown, categoryRevenue, topProducts, reviewStats, topSearches] =
    await Promise.all([
      getOverviewStats(period),
      getDailyRevenue(period),
      getOrderStatusBreakdown(period),
      getRevenueByCategory(period),
      getTopProducts(period),
      getReviewStats(period),
      getTopSearchQueries(period),
    ]);

  return (
    <AnalyticsClient
      period={period}
      stats={stats}
      dailyRevenue={dailyRevenue}
      statusBreakdown={statusBreakdown}
      categoryRevenue={categoryRevenue}
      topProducts={topProducts}
      reviewStats={reviewStats}
      topSearches={topSearches}
    />
  );
}
