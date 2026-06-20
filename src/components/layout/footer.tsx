'use client';

import Link from 'next/link';
import { toast } from '@/lib/toast';
import { subscribeToNewsletter } from '@/features/newsletter/actions';

export function Footer() {
  return (
    <footer className="bg-[#131A22] text-[#DDDDDD]" role="contentinfo">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm py-3 transition-colors"
      >
        Back to top
      </button>

      {/* Main links */}
      <div className="px-6 sm:px-10 lg:px-16 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Get to Know Us */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Get to Know Us</h3>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/deals" className="hover:text-white transition-colors">Today&apos;s Deals</Link></li>
              <li><Link href="/bestsellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Shop</h3>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/products/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products/category/mens-fashion" className="hover:text-white transition-colors">Men&apos;s Fashion</Link></li>
              <li><Link href="/products/category/womens-fashion" className="hover:text-white transition-colors">Women&apos;s Fashion</Link></li>
              <li><Link href="/products/category/home-kitchen" className="hover:text-white transition-colors">Home &amp; Kitchen</Link></li>
              <li><Link href="/products/category/beauty-health" className="hover:text-white transition-colors">Beauty &amp; Health</Link></li>
              <li><Link href="/products/category/sports-outdoors" className="hover:text-white transition-colors">Sports &amp; Outdoors</Link></li>
            </ul>
          </div>

          {/* Your Account */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Your Account</h3>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/profile" className="hover:text-white transition-colors">Your Account</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Your Orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track a Package</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Customer Service</h3>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#3a4553]" />

      {/* Newsletter */}
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-white font-bold text-base mb-1">Stay in the loop</h3>
          <p className="text-[#999] text-[13px] mb-4">Get the latest deals and new arrivals delivered to your inbox.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
              if (input?.value) {
                const result = await subscribeToNewsletter(input.value);
                if (result.success) {
                  input.value = '';
                  toast.success('Subscribed!', result.message || "You'll receive our latest deals.");
                } else {
                  toast.error('Error', result.error || 'Please try again.');
                }
              }
            }}
            className="flex max-w-sm mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2.5 rounded-l-md text-sm bg-white text-[#0F1111] placeholder-gray-400 focus:outline-none"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] text-sm font-medium px-5 py-2.5 rounded-r-md transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#3a4553]" />

      {/* Bottom bar */}
      <div className="bg-[#0F1111] px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Logo + social */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            {/* Logo text */}
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-white font-bold text-xl tracking-wide">Zivara</span>
              <span className="text-[#999] text-[11px] tracking-widest uppercase">Shop Smart</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-[#3a4553] flex items-center justify-center hover:border-white transition-colors">
                <svg className="w-3.5 h-3.5 text-[#ccc]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full border border-[#3a4553] flex items-center justify-center hover:border-white transition-colors">
                <svg className="w-3.5 h-3.5 text-[#ccc]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-[#3a4553] flex items-center justify-center hover:border-white transition-colors">
                <svg className="w-3.5 h-3.5 text-[#ccc]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-[#3a4553] flex items-center justify-center hover:border-white transition-colors">
                <svg className="w-3.5 h-3.5 text-[#ccc]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-4 text-[12px] text-[#999]">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Payment icons */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* Visa */}
            <div className="bg-white rounded px-2 py-1 flex items-center justify-center h-7 w-12">
              <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
                <text x="0" y="13" fontSize="14" fontWeight="bold" fill="#1A1F71" fontFamily="Arial">VISA</text>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded px-1 py-1 flex items-center justify-center h-7 w-12">
              <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-label="Mastercard">
                <circle cx="15" cy="12" r="10" fill="#EB001B"/>
                <circle cx="23" cy="12" r="10" fill="#F79E1B"/>
                <path d="M19 5.3a10 10 0 010 13.4A10 10 0 0119 5.3z" fill="#FF5F00"/>
              </svg>
            </div>
            {/* Amex */}
            <div className="bg-[#2E77BC] rounded px-2 py-1 flex items-center justify-center h-7 w-12">
              <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-label="American Express">
                <text x="1" y="12" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial">AMEX</text>
              </svg>
            </div>
            {/* PayPal */}
            <div className="bg-white rounded px-2 py-1 flex items-center justify-center h-7 w-14">
              <svg viewBox="0 0 60 16" className="h-4 w-auto" aria-label="PayPal">
                <text x="0" y="12" fontSize="11" fontWeight="bold" fill="#003087" fontFamily="Arial">Pay</text>
                <text x="22" y="12" fontSize="11" fontWeight="bold" fill="#009CDE" fontFamily="Arial">Pal</text>
              </svg>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-[12px] text-[#999]">
            &copy; {new Date().getFullYear()} Zivara. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
