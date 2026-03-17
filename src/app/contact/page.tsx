import type { Metadata } from 'next';
import ContactForm from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us - Zivara',
  description: 'Get in touch with the Zivara team for support, questions, or feedback.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#0F1111] mb-6">Customer Service</h1>

        {/* Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-[#0F1111]">Email Support</h2>
            </div>
            <p className="text-sm text-[#565959] mb-2">Get help with orders, products, or your account.</p>
            <p className="text-sm text-[#007185]">support@zivara.com</p>
            <p className="text-xs text-[#565959] mt-1">Response within 24 hours</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-semibold text-[#0F1111]">Business Hours</h2>
            </div>
            <p className="text-sm text-[#565959] mb-2">Our support team is available:</p>
            <p className="text-sm text-[#0F1111]">Mon - Fri: 9:00 AM - 6:00 PM</p>
            <p className="text-sm text-[#0F1111]">Sat: 10:00 AM - 2:00 PM</p>
            <p className="text-xs text-[#565959] mt-1">All times in EST</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-[#0F1111]">Partnerships</h2>
            </div>
            <p className="text-sm text-[#565959] mb-2">For business and partnership inquiries.</p>
            <p className="text-sm text-[#007185]">partners@zivara.com</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#0F1111] mb-1">Send us a message</h2>
          <p className="text-sm text-[#565959] mb-5">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
          <ContactForm />
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#0F1111] mb-4">Common Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { q: 'Where is my order?', a: 'Track your order from the Orders page in your account.' },
              { q: 'How do I return an item?', a: 'Contact us within 14 days of delivery for a return.' },
              { q: 'How long does shipping take?', a: 'Standard shipping takes 3-7 business days.' },
              { q: 'Can I change my order?', a: 'Orders can be modified within 1 hour of placement.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and cash on delivery.' },
              { q: 'How do I reset my password?', a: 'Use the "Forgot Password" link on the login page.' },
            ].map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3">
                <p className="text-sm font-medium text-[#0F1111]">{faq.q}</p>
                <p className="text-xs text-[#565959] mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
