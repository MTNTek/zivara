'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartCount } from '@/hooks/use-cart';
import { useWishlistCount } from '@/hooks/use-wishlist';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: cartCount } = useCartCount();
  const { data: wishlistCount } = useWishlistCount();

  // Hide on admin pages and checkout
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#2563eb]' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      match: (p: string) => p === '/',
      badge: 0,
    },
    {
      href: '/products',
      label: 'Shop',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#2563eb]' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      match: (p: string) => p.startsWith('/products'),
      badge: 0,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#2563eb]' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
      match: (p: string) => p === '/cart',
      badge: cartCount || 0,
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-red-500' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      match: (p: string) => p === '/wishlist',
      badge: wishlistCount || 0,
    },
    {
      href: '/profile',
      label: 'Account',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#2563eb]' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      match: (p: string) => p === '/profile' || p === '/login',
      badge: 0,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden" role="navigation" aria-label="Mobile navigation">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {links.map((link) => {
          const active = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] relative"
            >
              <span className="relative">
                {link.icon(active)}
                {link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] ${active ? 'text-[#2563eb] font-medium' : 'text-gray-500'}`}>
                {link.label}
              </span>
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563eb]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
