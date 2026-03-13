'use client';

import { useEffect, useState } from 'react';

export function CartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/cart/count');
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch {
        // silently fail
      }
    }
    fetchCount();

    // Re-fetch on focus (user may have added items in another tab)
    const onFocus = () => fetchCount();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-orange-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}
