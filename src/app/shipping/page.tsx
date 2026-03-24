import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'Shipping & Returns - Zivara',
  description: 'Learn about Zivara shipping options, delivery times, and return policy.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'Shipping & Returns' }]} />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-[#0F1111]">Shipping & Returns</h1>
            <p className="text-sm text-[#565959] mt-1">
              Everything you need to know about delivery and returns
            </p>
          </div>

          {/* Shipping Options */}
          <div className="bg-white rounded-lg p-6 mb-4">
            <h2 className="text-lg font-bold text-[#0F1111] mb-4 flex items-center gap-2">
              <span className="text-xl">🚚</span> Shipping Options
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e7e7e7]">
                    <th className="text-left py-3 pr-4 font-medium text-[#0F1111]">Method</th>
                    <th className="text-left py-3 pr-4 font-medium text-[#0F1111]">Delivery Time</th>
                    <th className="text-left py-3 font-medium text-[#0F1111]">Cost</th>
                  </tr>
                </thead>
                <tbody className="text-[#565959]">
                  <tr className="border-b border-[#e7e7e7]">
                    <td className="py-3 pr-4">Standard Shipping</td>
                    <td className="py-3 pr-4">5-7 business days</td>
                    <td className="py-3">Free on orders over $50</td>
                  </tr>
                  <tr className="border-b border-[#e7e7e7]">
                    <td className="py-3 pr-4">Express Shipping</td>
                    <td className="py-3 pr-4">2-3 business days</td>
                    <td className="py-3">$9.99</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Next Day Delivery</td>
                    <td className="py-3 pr-4">1 business day</td>
                    <td className="py-3">$19.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#565959] mt-4">
              Orders placed before 2:00 PM EST on business days are processed the same day.
              Delivery times are estimates and may vary based on location.
            </p>
          </div>

          {/* Return Policy */}
          <div className="bg-white rounded-lg p-6 mb-4">
            <h2 className="text-lg font-bold text-[#0F1111] mb-4 flex items-center gap-2">
              <span className="text-xl">↩️</span> Return Policy
            </h2>
            <div className="space-y-3 text-sm text-[#565959]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-medium text-[#0F1111]">30-Day Return Window</p>
                  <p>Most items can be returned within 30 days of delivery in their original condition.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-medium text-[#0F1111]">Free Return Shipping</p>
                  <p>We provide prepaid return labels for eligible items.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-medium text-[#0F1111]">Quick Refunds</p>
                  <p>Refunds are processed within 5-7 business days after we receive your return.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exceptions */}
          <div className="bg-white rounded-lg p-6 mb-4">
            <h2 className="text-lg font-bold text-[#0F1111] mb-3">Return Exceptions</h2>
            <ul className="text-sm text-[#565959] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#1d4ed8] mt-1">•</span>
                <span>Electronics have a 15-day return window</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1d4ed8] mt-1">•</span>
                <span>Items must be in original packaging with all accessories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1d4ed8] mt-1">•</span>
                <span>Personalized or custom items are non-returnable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1d4ed8] mt-1">•</span>
                <span>Hygiene-sensitive products (beauty, health) must be unopened</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-sm text-[#565959] mb-3">
              Need help with a return or have shipping questions?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/track"
                className="border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
