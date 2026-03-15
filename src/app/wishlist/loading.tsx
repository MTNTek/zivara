export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-gray-200 mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded mb-1" />
              <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
