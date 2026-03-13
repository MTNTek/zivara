'use client';

import { useState, useTransition } from 'react';
import { toggleWishlist } from '@/features/wishlist/actions';

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  size?: 'sm' | 'md';
}

export function WishlistButton({ productId, initialWishlisted = false, size = 'sm' }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.success) {
        setWishlisted(result.added);
      }
    });
  };

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-1.5 rounded-full transition-all ${
        isPending ? 'opacity-50' : 'hover:scale-110'
      } ${wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
    >
      <svg
        className={iconSize}
        fill={wishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
