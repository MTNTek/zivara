import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-4" />
          <Skeleton className="h-12 w-full max-w-2xl" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar Skeleton */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </aside>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            {/* Results Header Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <Skeleton className="h-5 w-64" />
            </div>

            {/* Products Skeleton */}
            <ProductGridSkeleton count={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
