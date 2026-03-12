export function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-56 bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        
        {/* Rating */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
