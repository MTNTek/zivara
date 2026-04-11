'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminDeleteReview } from '@/features/reviews/admin-actions';

export function ReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    startTransition(async () => {
      const result = await adminDeleteReview(reviewId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete review');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
