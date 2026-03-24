'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MobileBottomNav } from './mobile-bottom-nav';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { CompareDrawer } from '@/components/product/compare-drawer';
import { ScrollProgress } from '@/components/ui/scroll-progress';

const AUTH_ROUTES = ['/login', '/register', '/reset-password'];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isAuthPage) {
    return (
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    );
  }

  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="main-content" tabIndex={-1} className="pb-14 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <CookieConsent />
      <CompareDrawer />
    </>
  );
}
