import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service - Zivara',
  description: 'Read the terms and conditions for using Zivara.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8 text-gray-700 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Acceptance of Terms
              </h2>
              <p>By accessing and using Zivara, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Use of Service
              </h2>
              <p>You must be at least 18 years old to use this service. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Orders and Payments
              </h2>
              <p>All orders are subject to availability and confirmation. Prices are displayed in USD and may be subject to applicable taxes. We reserve the right to refuse or cancel any order at our discretion.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Shipping and Delivery
              </h2>
              <p>Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. Free shipping is available on orders over $50.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">5</span>
                Returns and Refunds
              </h2>
              <p>Items may be returned within 30 days of delivery in their original condition. Refunds will be processed to the original payment method within 5-10 business days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">6</span>
                Limitation of Liability
              </h2>
              <p>Zivara shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the product or service in question.</p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-gray-600">For questions about these terms, please <Link href="/contact" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">contact us</Link>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
