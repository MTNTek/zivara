import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - Zivara',
  description: 'Read the terms and conditions for using Zivara.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Zivara, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Use of Service</h2>
            <p>You must be at least 18 years old to use this service. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Orders and Payments</h2>
            <p>All orders are subject to availability and confirmation. Prices are displayed in USD and may be subject to applicable taxes. We reserve the right to refuse or cancel any order at our discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Shipping and Delivery</h2>
            <p>Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. Free shipping is available on orders over $50.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Returns and Refunds</h2>
            <p>Items may be returned within 30 days of delivery in their original condition. Refunds will be processed to the original payment method within 5-10 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Limitation of Liability</h2>
            <p>Zivara shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the product or service in question.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Contact</h2>
            <p>For questions about these terms, please <Link href="/contact" className="text-teal-600 hover:underline">contact us</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
