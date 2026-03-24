'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function BackToResults() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  // Determine back link based on referrer context
  const backLinks: Record<string, { href: string; label: string }> = {
    deals: { href: '/deals', label: 'Back to Deals' },
    bestsellers: { href: '/bestsellers', label: 'Back to Best Sellers' },
    'new-arrivals': { href: '/new-arrivals', label: 'Back to New Arrivals' },
    wishlist: { href: '/wishlist', label: 'Back to Wishlist' },
    search: { href: '/products', label: 'Back to Results' },
  };

  const link = from ? backLinks[from] : null;
  if (!link) return null;

  return (
    <Link
      href={link.href}
      className="inline-flex items-center gap-1 text-[12px] text-[#2563eb] hover:text-[#1d4ed8] hover:underline mb-2"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {link.label}
    </Link>
  );
}
