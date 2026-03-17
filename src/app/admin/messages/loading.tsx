export default function MessagesLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-l-transparent">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-full bg-gray-200 rounded mb-1" />
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
