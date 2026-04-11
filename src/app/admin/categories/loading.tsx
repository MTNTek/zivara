export default function CategoriesLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className={`h-8 w-48 ${s} rounded`} />
        <div className={`h-10 w-36 ${s} rounded`} />
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-5 w-40 ${s} rounded`} />
                <div className={`h-4 w-24 ${s} rounded`} />
              </div>
              <div className={`h-4 w-16 ${s} rounded`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
