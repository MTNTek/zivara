'use client';

import { useWishlistCount } from '@/hooks/use-wishlist';

export function WishlistCount() {
  const { data: count } = useWishlistCount();

  if (!count || count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}
