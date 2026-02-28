import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function AdminProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-12 w-full max-w-md" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TableSkeleton rows={10} cols={5} />
        </div>
      </div>
    </div>
  );
}
