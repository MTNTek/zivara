export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-4">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-gray-100 pb-4">
                <div className="h-16 w-16 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
