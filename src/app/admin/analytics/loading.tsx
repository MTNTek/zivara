export default function AnalyticsLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className={`h-8 w-32 ${s} rounded`} />
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-2">
              <div className={`h-4 w-14 ${s} rounded`} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 ${s} rounded-lg`} />
              <div>
                <div className={`h-3 w-20 ${s} rounded mb-1.5`} />
                <div className={`h-5 w-16 ${s} rounded`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className={`h-5 w-36 ${s} rounded mb-4`} />
          <div className="flex items-end gap-[2px]" style={{ height: 220 }}>
            {[65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85, 45, 70, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div className={`${s} rounded-t`} style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className={`h-5 w-28 ${s} rounded mb-4`} />
          <div className="space-y-3">
            {[80, 60, 40, 30, 15].map((w, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className={`h-3 w-20 ${s} rounded`} />
                  <div className={`h-3 w-14 ${s} rounded`} />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 ${s} rounded-full`} style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className={`h-5 w-40 ${s} rounded mb-4`} />
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {['w-10', 'w-20', 'w-20', 'w-16', 'w-20'].map((w, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className={`h-3 ${w} ${s} rounded`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-4 py-3"><div className={`h-4 w-6 ${s} rounded`} /></td>
                <td className="px-4 py-3"><div className={`h-4 w-40 ${s} rounded`} /></td>
                <td className="px-4 py-3"><div className={`h-4 w-12 ${s} rounded`} /></td>
                <td className="px-4 py-3"><div className={`h-4 w-20 ${s} rounded`} /></td>
                <td className="px-4 py-3"><div className={`h-4 w-16 ${s} rounded`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
