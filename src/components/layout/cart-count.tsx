'use client';

import { useCartCount } from '@/hooks/use-cart';

export function CartCount() {
  const { data: count } = useCartCount();

  if (!count || count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}
