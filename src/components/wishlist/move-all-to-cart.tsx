'use client';

import { useState, useTransition } from 'react';
import { addToCart } from '@/features/cart/actions';
import { useRouter } from 'next/navigation';

interface Props {
  productIds: string[];
}

export function MoveAllToCart({ productIds }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ added: number; failed: number } | null>(null);
  const router = useRouter();

  async function handleMoveAll() {
    let added = 0;
    let failed = 0;

    for (const id of productIds) {
      try {
        const res = await addToCart({ productId: id, quantity: 1 });
        if (res.success) added++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setResult({ added, failed });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleMoveAll}
        disabled={isPending || productIds.length === 0}
        className="px-4 py-2 bg-[#fbbf24] text-[#0F1111] rounded-full text-sm font-semibold hover:bg-[#f59e0b] transition-colors border border-[#FCD200] disabled:opacity-50"
      >
        {isPending ? 'Adding...' : `Add All to Cart (${productIds.length})`}
      </button>
      {result && (
        <span className="text-sm text-gray-600">
          {result.added} added{result.failed > 0 ? `, ${result.failed} failed` : ''}
        </span>
      )}
    </div>
  );
}
