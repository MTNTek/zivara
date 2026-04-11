export default function InventoryLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Search skeleton */}
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse mb-4" />

      {/* Table skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
