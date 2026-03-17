'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

const shopCategories = [
  { href: '/products/category/electronics', label: 'Electronics', icon: '💻' },
  { href: '/products/category/mens-fashion', label: "Men's Fashion", icon: '👔' },
  { href: '/products/category/womens-fashion', label: "Women's Fashion", icon: '👗' },
  { href: '/products/category/home-kitchen', label: 'Home & Kitchen', icon: '🏠' },
  { href: '/products/category/beauty-health', label: 'Beauty & Health', icon: '💄' },
  { href: '/products/category/sports-outdoors', label: 'Sports & Outdoors', icon: '⚽' },
  { href: '/products/category/toys-games', label: 'Toys & Games', icon: '🎮' },
  { href: '/products/category/books', label: 'Books', icon: '📚' },
  { href: '/products/category/automotive', label: 'Automotive', icon: '🚗' },
  { href: '/products/category/pet-supplies', label: 'Pet Supplies', icon: '🐾' },
  { href: '/products/category/office-products', label: 'Office Products', icon: '🖊️' },
  { href: '/products/category/garden', label: 'Garden', icon: '🌿' },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const close = () => setIsOpen(false);

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

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={close} />
          <div className="fixed left-0 top-0 bottom-0 w-[280px] bg-white shadow-xl overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-bold">
                  {session ? `Hello, ${session.user.name?.split(' ')[0]}` : 'Hello, Sign in'}
                </span>
              </div>
              <button onClick={close} aria-label="Close menu" className="p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <nav className="flex-1 overflow-y-auto">
              {/* Shop by Category */}
              <div className="py-3">
                <p className="px-4 py-1.5 text-xs font-bold text-[#565959] uppercase tracking-wider">Shop by Category</p>
                <Link href="/products" onClick={close} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F1111] hover:bg-gray-50">
                  <span className="text-lg w-6 text-center">🛍️</span>
                  <span className="font-medium">All Products</span>
                </Link>
                {shopCategories.map((cat) => (
                  <Link key={cat.href} href={cat.href} onClick={close} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F1111] hover:bg-gray-50">
                    <span className="text-lg w-6 text-center">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-gray-200 mx-4" />

              {/* Account */}
              <div className="py-3">
                <p className="px-4 py-1.5 text-xs font-bold text-[#565959] uppercase tracking-wider">Your Account</p>
                {session ? (
                  <>
                    <MenuLink href="/profile" icon="👤" label="Profile" onClick={close} />
                    <MenuLink href="/orders" icon="📦" label="Your Orders" onClick={close} />
                    <MenuLink href="/wishlist" icon="❤️" label="Wishlist" onClick={close} />
                    <MenuLink href="/cart" icon="🛒" label="Cart" onClick={close} />
                    {session.user.role === 'admin' && (
                      <MenuLink href="/admin/dashboard" icon="⚙️" label="Admin Panel" onClick={close} />
                    )}
                  </>
                ) : (
                  <>
                    <MenuLink href="/login" icon="🔑" label="Sign In" onClick={close} />
                    <MenuLink href="/register" icon="✨" label="Create Account" onClick={close} />
                    <MenuLink href="/cart" icon="🛒" label="Cart" onClick={close} />
                  </>
                )}
              </div>

              <div className="h-px bg-gray-200 mx-4" />

              {/* Help */}
              <div className="py-3">
                <p className="px-4 py-1.5 text-xs font-bold text-[#565959] uppercase tracking-wider">Help & Settings</p>
                <MenuLink href="/contact" icon="💬" label="Customer Service" onClick={close} />
                <MenuLink href="/terms" icon="📄" label="Terms of Service" onClick={close} />
                <MenuLink href="/privacy" icon="🔒" label="Privacy Policy" onClick={close} />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F1111] hover:bg-gray-50">
      <span className="text-lg w-6 text-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
