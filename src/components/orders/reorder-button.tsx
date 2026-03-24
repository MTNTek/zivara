'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/features/cart/actions';

interface ReorderItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface ReorderButtonProps {
  items: ReorderItem[];
  orderStatus: string;
}

export function ReorderButton({ items, orderStatus }: ReorderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<'idle' | 'success' | 'partial' | 'error'>('idle');
  const router = useRouter();

  // Only show for delivered or shipped orders
  if (!['delivered', 'shipped'].includes(orderStatus)) return null;

  const handleReorder = () => {
    startTransition(async () => {
      let added = 0;
      let failed = 0;

      for (const item of items) {
        try {
          const res = await addToCart({
            productId: item.productId,
            quantity: item.quantity,
          });
          if (res.success) added++;
          else failed++;
        } catch {
          failed++;
        }
      }

      if (added > 0 && failed === 0) {
        setResult('success');
        setTimeout(() => router.push('/cart'), 1000);
      } else if (added > 0) {
        setResult('partial');
        setTimeout(() => router.push('/cart'), 1500);
      } else {
        setResult('error');
      }
    });
  };

  return (
    <div className="mt-4">
      {result === 'success' && (
        <p className="text-sm text-green-600 font-medium mb-2">✓ All items added to cart. Redirecting...</p>
      )}
      {result === 'partial' && (
        <p className="text-sm text-orange-600 font-medium mb-2">Some items added. Others may be unavailable.</p>
      )}
      {result === 'error' && (
        <p className="text-sm text-red-600 font-medium mb-2">Could not add items. They may be out of stock.</p>
      )}
      <button
        onClick={handleReorder}
        disabled={isPending}
        className="w-full px-4 py-2.5 text-sm font-medium text-[#0F1111] bg-[#fbbf24] border border-[#FCD200] rounded-lg hover:bg-[#f59e0b] disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Adding to cart...' : 'Buy Again'}
      </button>
    </div>
  );
}
