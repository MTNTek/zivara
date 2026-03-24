'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SCROLL_KEY_PREFIX = 'zivara-scroll-';

/**
 * Saves scroll position when leaving a page and restores it when returning.
 * Useful for product listing pages so users don't lose their place.
 */
export function useScrollRestore() {
  const pathname = usePathname();

  useEffect(() => {
    const key = SCROLL_KEY_PREFIX + pathname;

    // Restore scroll position on mount
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const y = parseInt(saved, 10);
      // Small delay to let the page render
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    }

    // Save scroll position on unmount / navigation
    const saveScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    window.addEventListener('beforeunload', saveScroll);

    return () => {
      saveScroll();
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, [pathname]);
}
