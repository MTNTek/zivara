import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Zivara',
  description: 'Learn how Zivara collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, shipping address, and payment information when you create an account or place an order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">How We Use Your Information</h2>
            <p>We use your information to process orders, communicate with you about your purchases, improve our services, and send promotional communications (with your consent).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Information Sharing</h2>
            <p>We do not sell your personal information. We share data only with service providers necessary to fulfill orders (payment processors, shipping carriers) and as required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure connections (HTTPS), and access controls to protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Cookies</h2>
            <p>We use cookies to maintain your session, remember preferences, and analyze site usage. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us or through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Contact</h2>
            <p>For privacy-related inquiries, please <Link href="/contact" className="text-black hover:underline">contact us</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
