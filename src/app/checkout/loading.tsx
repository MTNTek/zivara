import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-6 w-36 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-8 w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
