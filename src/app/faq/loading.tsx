export default function FAQLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className={`h-4 w-20 ${s} rounded mb-4`} />
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className={`h-7 w-64 ${s} rounded mb-2`} />
            <div className={`h-4 w-80 ${s} rounded`} />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 mb-4">
              <div className={`h-5 w-40 ${s} rounded mb-4`} />
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="border-b border-[#e7e7e7] last:border-0 pb-4 last:pb-0">
                    <div className={`h-4 w-3/4 ${s} rounded`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
