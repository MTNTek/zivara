export default function ReviewsLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-4xl">
        <div className="mb-6 flex gap-2">
          <div className={`h-4 w-12 ${s} rounded`} />
          <div className={`h-4 w-4 ${s} rounded`} />
          <div className={`h-4 w-24 ${s} rounded`} />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className={`h-7 w-64 ${s} rounded mb-2`} />
          <div className={`h-5 w-48 ${s} rounded`} />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className={`h-4 w-32 ${s} rounded mb-2`} />
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className={`h-4 w-4 ${s} rounded`} />
                ))}
              </div>
              <div className={`h-4 w-full ${s} rounded mb-1`} />
              <div className={`h-4 w-3/4 ${s} rounded`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
