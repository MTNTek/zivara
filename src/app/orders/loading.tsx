import { OrderListSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <OrderListSkeleton count={5} />
      </div>
    </div>
  );
}
