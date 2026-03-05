import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Revenue Chart Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>

        {/* Recent Orders Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <TableSkeleton rows={5} cols={5} />
        </div>
      </div>
    </div>
  );
}
