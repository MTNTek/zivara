export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse">
      {/* 4 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="h-5 w-52 bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="flex-1 flex items-center ml-2">
                <div
                  className="bg-gray-200 h-8 rounded"
                  style={{ width: `${70 - i * 8}%`, minWidth: '2rem' }}
                />
                <div className="h-4 w-32 bg-gray-200 rounded ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products Table: 4 columns */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {['w-12', 'w-20', 'w-20', 'w-16'].map((w, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className={`h-3 ${w} bg-gray-200 rounded`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><div className="h-4 w-6 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
