export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-300">›</span>
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-72 bg-gray-200 rounded animate-pulse mt-2" />
        </div>

        <div className="flex">
          {/* Sidebar skeleton - desktop only */}
          <div className="hidden lg:block w-[220px] flex-shrink-0 space-y-3 pr-5 border-r border-[#e7e7e7]">
            <div className="h-4 w-[70%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[85%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[60%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[90%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[75%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[65%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[80%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[70%] bg-gray-200 rounded animate-pulse" />
            <div className="border-t border-gray-200 my-3" />
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[55%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[70%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[60%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[50%] bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-[65%] bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Products grid skeleton */}
          <div className="flex-1 pl-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-square bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
