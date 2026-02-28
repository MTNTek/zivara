'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Zivara home">
            <span className="text-2xl font-bold text-teal-600">Zivara</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`font-medium transition-colors ${
                isActive('/products') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
              }`}
              aria-current={isActive('/products') ? 'page' : undefined}
            >
              Products
            </Link>
            <Link
              href="/orders"
              className={`font-medium transition-colors ${
                isActive('/orders') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
              }`}
              aria-current={isActive('/orders') ? 'page' : undefined}
            >
              Orders
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2" role="navigation" aria-label="User actions">
            <Link
              href="/cart"
              className="relative p-3 text-gray-700 hover:text-teal-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Shopping cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            <Link
              href="/profile"
              className="p-3 text-gray-700 hover:text-teal-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="User profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium min-h-[44px] flex items-center"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 text-gray-700 hover:text-teal-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2" aria-label="Mobile navigation">
              <Link
                href="/"
                className={`font-medium transition-colors py-3 px-2 rounded-md min-h-[44px] flex items-center ${
                  isActive('/') ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`font-medium transition-colors py-3 px-2 rounded-md min-h-[44px] flex items-center ${
                  isActive('/products') ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive('/products') ? 'page' : undefined}
              >
                Products
              </Link>
              <Link
                href="/orders"
                className={`font-medium transition-colors py-3 px-2 rounded-md min-h-[44px] flex items-center ${
                  isActive('/orders') ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive('/orders') ? 'page' : undefined}
              >
                Orders
              </Link>
              <Link
                href="/cart"
                className="font-medium text-gray-700 py-3 px-2 rounded-md min-h-[44px] flex items-center hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart
              </Link>
              <Link
                href="/profile"
                className="font-medium text-gray-700 py-3 px-2 rounded-md min-h-[44px] flex items-center hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/login"
                className="font-medium text-teal-600 py-3 px-2 rounded-md min-h-[44px] flex items-center hover:bg-teal-50 border border-teal-600 text-center justify-center mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
