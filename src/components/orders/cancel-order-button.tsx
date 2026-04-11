'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelOrder } from '@/features/orders/actions';

interface CancelOrderButtonProps {
  orderId: string;
  orderStatus: string;
}

export function CancelOrderButton({ orderId, orderStatus }: CancelOrderButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only show for pending orders
  if (orderStatus !== 'pending') return null;

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrder({ orderId });
      if (result.success) {
        setShowConfirm(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to cancel order');
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-red-800 font-medium mb-2">Cancel this order?</p>
        <p className="text-xs text-red-600 mb-3">
          This action cannot be undone. Your items will be released back to inventory.
        </p>
        {error && (
          <p className="text-xs text-red-700 bg-red-100 rounded px-2 py-1 mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Cancelling...' : 'Yes, cancel order'}
          </button>
          <button
            onClick={() => { setShowConfirm(false); setError(null); }}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Keep order
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
    >
      Cancel Order
    </button>
  );
}
