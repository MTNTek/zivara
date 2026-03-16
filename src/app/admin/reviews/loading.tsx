export default function ReviewsLoading() {
  return (
    <div className="animate-pulse">
      {/* 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Total Reviews', 'Verified Reviews', 'Average Rating'].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Reviews Table: 7 columns */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['w-16', 'w-20', 'w-14', 'w-20', 'w-14', 'w-12', 'w-16'].map((w, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className={`h-3 ${w} bg-gray-200 rounded`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-36 bg-gray-200 rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                    <div className="h-4 w-6 bg-gray-200 rounded" />
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-200 rounded ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
