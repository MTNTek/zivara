export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header + Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-2">
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 8 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg" />
              <div>
                <div className="h-3 w-20 bg-gray-200 rounded mb-1.5" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
          <div className="flex items-end gap-[2px]" style={{ height: 220 }}>
            {[65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85, 45, 70, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div className="bg-gray-200 rounded-t" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[80, 60, 40, 30, 15].map((w, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-14 bg-gray-200 rounded" />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Revenue + Review Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="h-5 w-44 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[90, 70, 55, 40, 30].map((w, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
          <div className="flex flex-col items-center mb-4">
            <div className="h-10 w-12 bg-gray-200 rounded mb-1" />
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-3 w-20 bg-gray-200 rounded mt-1" />
          </div>
          <div className="space-y-2">
            {[80, 60, 30, 15, 8].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-12 h-3 bg-gray-200 rounded" />
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
                </div>
                <div className="w-8 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {['w-10', 'w-20', 'w-20', 'w-16', 'w-20'].map((w, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className={`h-3 ${w} bg-gray-200 rounded`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-4 py-3"><div className="h-4 w-6 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
