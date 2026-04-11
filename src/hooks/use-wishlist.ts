'use client';

import { useQuery } from '@tanstack/react-query';

export const WISHLIST_COUNT_KEY = ['wishlist', 'count'] as const;

async function fetchWishlistCount(): Promise<number> {
  const res = await fetch('/api/wishlist/count');
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export function useWishlistCount() {
  return useQuery({
    queryKey: WISHLIST_COUNT_KEY,
    queryFn: fetchWishlistCount,
    initialData: 0,
  });
}
