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
                    <Link href="/about" className="hover:underline transition-colors">
                      About Zivara
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:underline transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/press" className="hover:underline transition-colors">
                      Press Releases
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Make Money with Us */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Make Money with Us</h3>
              <nav aria-label="Seller links">
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/sell" className="hover:underline transition-colors">
                      Sell on Zivara
                    </Link>
                  </li>
                  <li>
                    <Link href="/affiliate" className="hover:underline transition-colors">
                      Become an Affiliate
                    </Link>
                  </li>
                  <li>
                    <Link href="/advertise" className="hover:underline transition-colors">
                      Advertise Your Products
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Let Us Help You */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Let Us Help You</h3>
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
                    <Link href="/help" className="hover:underline transition-colors">
                      Help
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
                    <Link href="/returns" className="hover:underline transition-colors">
                      Returns & Refunds
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
              <Link href="/cookies" className="hover:underline">
                Cookies
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
