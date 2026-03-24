import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy - Zivara',
  description: 'Learn how Zivara collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8 text-gray-700 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Information We Collect
              </h2>
              <p>We collect information you provide directly, including your name, email address, shipping address, and payment information when you create an account or place an order.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                How We Use Your Information
              </h2>
              <p>We use your information to process orders, communicate with you about your purchases, improve our services, and send promotional communications (with your consent).</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Information Sharing
              </h2>
              <p>We do not sell your personal information. We share data only with service providers necessary to fulfill orders (payment processors, shipping carriers) and as required by law.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Data Security
              </h2>
              <p>We implement industry-standard security measures including encryption, secure connections (HTTPS), and access controls to protect your personal information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">5</span>
                Cookies
              </h2>
              <p>We use cookies to maintain your session, remember preferences, and analyze site usage. You can manage cookie preferences through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center text-xs font-bold">6</span>
                Your Rights
              </h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us or through your account settings.</p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-gray-600">For privacy-related inquiries, please <Link href="/contact" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">contact us</Link>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
