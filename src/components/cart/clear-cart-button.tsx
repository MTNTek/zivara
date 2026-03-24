'use client';

import { useState, useTransition } from 'react';
import { clearCart } from '@/features/cart/actions';
import { useRouter } from 'next/navigation';

export function ClearCartButton() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleClear() {
    const result = await clearCart();
    if (result.success) {
      startTransition(() => router.refresh());
    }
    setShowConfirm(false);
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Clear all items?</span>
        <button
          onClick={handleClear}
          disabled={isPending}
          className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {isPending ? 'Clearing...' : 'Yes, clear'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-gray-500 hover:text-red-600 transition-colors"
    >
      Clear cart
    </button>
  );
}
