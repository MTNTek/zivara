export default function UsersLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="space-y-0 divide-y divide-gray-200">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
