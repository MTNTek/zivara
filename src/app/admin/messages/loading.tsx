export default function MessagesLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className={`h-8 w-48 ${s} rounded`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className={`h-3 w-12 ${s} rounded mb-2`} />
            <div className={`h-7 w-10 ${s} rounded`} />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-l-transparent">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-4 w-24 ${s} rounded`} />
              <div className={`h-3 w-32 ${s} rounded`} />
              <div className={`h-4 w-12 ${s} rounded-full`} />
            </div>
            <div className={`h-4 w-48 ${s} rounded mb-2`} />
            <div className={`h-3 w-full ${s} rounded mb-1`} />
            <div className={`h-3 w-3/4 ${s} rounded`} />
            <div className={`h-3 w-28 ${s} rounded mt-3`} />
          </div>
        ))}
      </div>
    </div>
  );
}
