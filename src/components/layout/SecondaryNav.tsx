'use client';

import Link from 'next/link';
import { MegaMenu } from './MegaMenu';

const navLinks = [
  { name: 'Electronics', href: '/products/category/electronics' },
  { name: "Men's Fashion", href: '/products/category/mens-fashion' },
  { name: "Women's Fashion", href: '/products/category/womens-fashion' },
  { name: 'Home & Kitchen', href: '/products/category/home-kitchen' },
  { name: 'Beauty & Health', href: '/products/category/beauty-health' },
  { name: 'Sports & Outdoors', href: '/products/category/sports-outdoors' },
  { name: 'Toys & Games', href: '/products/category/toys-games' },
  { name: 'Books', href: '/products/category/books' },
  { name: 'Automotive', href: '/products/category/automotive' },
  { name: 'Pet Supplies', href: '/products/category/pet-supplies' },
  { name: 'Office Products', href: '/products/category/office-products' },
  { name: 'Garden', href: '/products/category/garden' },
];

export function SecondaryNav() {
  return (
    <>
      {/* Desktop Secondary Navigation */}
      <div className="bg-blue-800 hidden md:block">
        <div className="w-full px-4">
          <nav className="flex items-center gap-6 h-10 text-sm" aria-label="Main navigation">
            <MegaMenu />
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white px-2 py-1 rounded transition-colors whitespace-nowrap hover:bg-white/15"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="bg-blue-800 md:hidden">
        <div className="w-full px-4">
          <div className="py-2">
            <MegaMenu />
          </div>
        </div>
      </div>
    </>
  );
}
