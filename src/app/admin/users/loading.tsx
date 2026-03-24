export default function UsersLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className={`h-8 w-48 ${s} rounded mb-2`} />
              <div className={`h-4 w-40 ${s} rounded`} />
            </div>
            <div className={`h-10 w-36 ${s} rounded-lg`} />
          </div>
        </div>
        <div className="mb-6">
          <div className={`h-10 w-full max-w-md ${s} rounded-lg`} />
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['w-16', 'w-16', 'w-12', 'w-14', 'w-14', 'w-28', 'w-20'].map((w, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <div className={`h-3 ${w} ${s} rounded`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className={`h-4 w-28 ${s} rounded`} /></td>
                    <td className="px-6 py-4"><div className={`h-4 w-40 ${s} rounded`} /></td>
                    <td className="px-6 py-4"><div className={`h-5 w-16 ${s} rounded-full`} /></td>
                    <td className="px-6 py-4"><div className={`h-5 w-14 ${s} rounded-full`} /></td>
                    <td className="px-6 py-4"><div className={`h-4 w-8 ${s} rounded`} /></td>
                    <td className="px-6 py-4"><div className={`h-4 w-24 ${s} rounded`} /></td>
                    <td className="px-6 py-4 text-right"><div className={`h-4 w-20 ${s} rounded ml-auto`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
