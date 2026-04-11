'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { toast } from '@/lib/toast';
import { subscribeToNewsletter } from '@/features/newsletter/actions';

export function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200" role="contentinfo">
      {/* Back to top — Amazon style */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-blue-700 hover:bg-[#485769] text-white text-sm py-3 transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Content */}
      <div className="bg-white">
        <div className="px-4 sm:px-6 lg:px-10 py-12">
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
                    <Link href="/deals" className="hover:underline transition-colors">
                      Today&apos;s Deals
                    </Link>
                  </li>
                  <li>
                    <Link href="/bestsellers" className="hover:underline transition-colors">
                      Best Sellers
                    </Link>
                  </li>
                  <li>
                    <Link href="/new-arrivals" className="hover:underline transition-colors">
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:underline transition-colors">
                      About Us
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
                    <Link href="/products/category/electronics" className="hover:underline transition-colors">
                      Electronics
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/mens-fashion" className="hover:underline transition-colors">
                      Men&apos;s Fashion
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/womens-fashion" className="hover:underline transition-colors">
                      Women&apos;s Fashion
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/home-kitchen" className="hover:underline transition-colors">
                      Home &amp; Kitchen
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/beauty-health" className="hover:underline transition-colors">
                      Beauty &amp; Health
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/category/sports-outdoors" className="hover:underline transition-colors">
                      Sports &amp; Outdoors
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
                    <Link href="/track" className="hover:underline transition-colors">
                      Track Order
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:underline transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:underline transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="hover:underline transition-colors">
                      Shipping &amp; Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:underline transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:underline transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-800">
        <div className="px-4 sm:px-6 lg:px-10 py-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-white font-bold text-lg mb-1">Stay in the loop</h3>
            <p className="text-blue-200 text-sm mb-4">Get the latest deals and new arrivals delivered to your inbox.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
                if (input && input.value) {
                  const result = await subscribeToNewsletter(input.value);
                  if (result.success) {
                    input.value = '';
                    toast.success('Subscribed!', result.message || 'You\'ll receive our latest deals and updates.');
                  } else {
                    toast.error('Error', result.error || 'Please try again.');
                  }
                }
              }}
              className="flex max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2.5 rounded-l-full text-sm bg-white text-[#0F1111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] text-sm font-medium px-5 py-2.5 rounded-r-full transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo variant="dark" size="sm" />

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
            
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
            {/* Payment methods */}
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* Visa */}
              <svg className="h-6 w-auto text-gray-400" viewBox="0 0 48 32" fill="currentColor" aria-label="Visa">
                <rect width="48" height="32" rx="4" fill="#f3f4f6"/>
                <path d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.2-10.2c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.5 1.4-4.5 3.4 0 1.5 1.3 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.2c.6.3 1.8.5 3 .5 2.8 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.2-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2.1zm6.8-.3h-2.1c-.6 0-1.1.2-1.4.8L30 21h2.8l.6-1.5h3.5l.3 1.5H40l-2.3-10.5h-2.2zm-2.4 6.8l1.1-3 .3-.8.2.7.6 3.1h-2.2zM16.3 10.5L13.6 18l-.3-1.4c-.5-1.7-2-3.5-3.8-4.4l2.4 8.8h2.9l4.3-10.5h-2.8z" fill="#9ca3af"/>
              </svg>
              {/* Mastercard */}
              <svg className="h-6 w-auto" viewBox="0 0 48 32" aria-label="Mastercard">
                <rect width="48" height="32" rx="4" fill="#f3f4f6"/>
                <circle cx="20" cy="16" r="7" fill="#d1d5db"/>
                <circle cx="28" cy="16" r="7" fill="#9ca3af" opacity="0.7"/>
              </svg>
              {/* Amex */}
              <svg className="h-6 w-auto" viewBox="0 0 48 32" aria-label="American Express">
                <rect width="48" height="32" rx="4" fill="#f3f4f6"/>
                <text x="24" y="18" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#9ca3af">AMEX</text>
              </svg>
              {/* PayPal */}
              <svg className="h-6 w-auto" viewBox="0 0 48 32" aria-label="PayPal">
                <rect width="48" height="32" rx="4" fill="#f3f4f6"/>
                <text x="24" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#9ca3af">PayPal</text>
              </svg>
            </div>
            <p>&copy; {new Date().getFullYear()} Zivara. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
