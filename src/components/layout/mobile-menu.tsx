'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-white"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
              <span className="font-bold text-lg">
                {session ? `Hello, ${session.user.name?.split(' ')[0]}` : 'Hello, Guest'}
              </span>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="py-2">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Shop</p>
                <MenuLink href="/products" label="All Products" onClick={() => setIsOpen(false)} />
                <MenuLink href="/products/category/electronics" label="Electronics" onClick={() => setIsOpen(false)} />
                <MenuLink href="/products/category/fashion" label="Fashion" onClick={() => setIsOpen(false)} />
                <MenuLink href="/products/category/home-kitchen" label="Home & Kitchen" onClick={() => setIsOpen(false)} />
                <MenuLink href="/products/category/books" label="Books" onClick={() => setIsOpen(false)} />
                <MenuLink href="/products/category/sports-outdoors" label="Sports & Outdoors" onClick={() => setIsOpen(false)} />
              </div>

              <div className="border-b border-gray-200 pb-2 mb-2">
                <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Your Account</p>
                {session ? (
                  <>
                    <MenuLink href="/profile" label="Profile" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/orders" label="Orders" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/wishlist" label="Wishlist" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/cart" label="Cart" onClick={() => setIsOpen(false)} />
                    {session.user.role === 'admin' && (
                      <MenuLink href="/admin/dashboard" label="Admin Dashboard" onClick={() => setIsOpen(false)} />
                    )}
                  </>
                ) : (
                  <>
                    <MenuLink href="/login" label="Sign In" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/register" label="Create Account" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/cart" label="Cart" onClick={() => setIsOpen(false)} />
                  </>
                )}
              </div>

              <div>
                <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Help</p>
                <MenuLink href="/contact" label="Contact Us" onClick={() => setIsOpen(false)} />
                <MenuLink href="/terms" label="Terms of Service" onClick={() => setIsOpen(false)} />
                <MenuLink href="/privacy" label="Privacy Policy" onClick={() => setIsOpen(false)} />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      {label}
    </Link>
  );
}
