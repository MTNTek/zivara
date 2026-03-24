import Link from 'next/link';
import { RecentlyViewed } from '@/components/product/recently-viewed';

const popularCategories = [
  { href: '/products/category/electronics', label: 'Electronics', icon: '💻' },
  { href: '/products/category/mens-fashion', label: "Men's Fashion", icon: '👔' },
  { href: '/products/category/womens-fashion', label: "Women's Fashion", icon: '👗' },
  { href: '/products/category/home-kitchen', label: 'Home & Kitchen', icon: '🏠' },
  { href: '/products/category/beauty-health', label: 'Beauty & Health', icon: '💄' },
  { href: '/products/category/sports-outdoors', label: 'Sports & Outdoors', icon: '⚽' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-4 text-7xl">🔍</div>
          <h1 className="mb-2 text-2xl font-bold text-[#0F1111]">
            Looking for something?
          </h1>
          <p className="mb-6 text-sm text-[#565959]">
            We couldn&apos;t find the page you were looking for. It may have been moved or no longer exists.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mb-8">
            <Link
              href="/"
              className="rounded-full bg-[#fbbf24] px-6 py-2.5 text-sm font-medium text-[#0F1111] hover:bg-[#f59e0b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:ring-offset-2"
            >
              Go to Homepage
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-[#D5D9D9] bg-white px-6 py-2.5 text-sm font-medium text-[#0F1111] hover:bg-[#F7FAFA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
            >
              Browse Products
            </Link>
          </div>

          <div className="border-t border-[#e7e7e7] pt-6">
            <p className="text-xs font-bold text-[#565959] uppercase tracking-wider mb-3">Popular Categories</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F3F3] hover:bg-[#e7e7e7] rounded-full text-xs text-[#0F1111] transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4 text-xs text-[#565959]">
          <Link href="/deals" className="hover:text-[#1d4ed8] hover:underline">Deals</Link>
          <Link href="/bestsellers" className="hover:text-[#1d4ed8] hover:underline">Best Sellers</Link>
          <Link href="/new-arrivals" className="hover:text-[#1d4ed8] hover:underline">New Arrivals</Link>
          <Link href="/contact" className="hover:text-[#1d4ed8] hover:underline">Help</Link>
        </div>

        <div className="mt-8 max-w-4xl mx-auto">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
}
