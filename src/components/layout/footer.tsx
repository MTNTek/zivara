'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200" role="contentinfo">
      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-4 transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Content */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Get to Know Us */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Get to Know Us</h3>
              <nav aria-label="About links">
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/products" className="hover:underline transition-colors">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:underline transition-colors">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Shop */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Shop</h3>
              <nav aria-label="Shop links">
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/products/category/mens-fashion" className="hover:underline transition-colors">
                      Men's Fashion
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/womens-fashion" className="hover:underline transition-colors">
                      Women's Fashion
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/home-kitchen" className="hover:underline transition-colors">
                      Home &amp; Kitchen
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Let Us Help You */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Your Account</h3>
              <nav aria-label="Help links">
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/profile" className="hover:underline transition-colors">
                      Your Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="hover:underline transition-colors">
                      Your Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className="hover:underline transition-colors">
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/cart" className="hover:underline transition-colors">
                      Cart
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Customer Service</h3>
              <nav aria-label="Customer service links">
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/orders" className="hover:underline transition-colors">
                      Track Order
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:underline transition-colors">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo variant="dark" size="sm" />
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="text-center text-xs mt-4">
            <p>&copy; {new Date().getFullYear()} Zivara. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
