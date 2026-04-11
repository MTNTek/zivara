export default function ContactLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-5xl">
        <div className={`h-8 w-48 ${s} rounded mb-2`} />
        <div className={`h-4 w-72 ${s} rounded mb-8`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-5">
              <div className={`h-5 w-32 ${s} rounded mb-2`} />
              <div className={`h-3 w-full ${s} rounded mb-1`} />
              <div className={`h-3 w-3/4 ${s} rounded`} />
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className={`h-6 w-40 ${s} rounded mb-6`} />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`h-10 ${s} rounded`} />
              <div className={`h-10 ${s} rounded`} />
            </div>
            <div className={`h-10 ${s} rounded`} />
            <div className={`h-32 ${s} rounded`} />
            <div className={`h-10 w-32 ${s} rounded`} />
          </div>
        </div>
      </div>
    </div>
  );
}
