import { Skeleton } from '@/components/ui/skeleton';

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="divide-y divide-gray-200">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 flex gap-4">
                    <Skeleton className="w-24 h-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-6 w-36 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
