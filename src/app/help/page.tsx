import Link from 'next/link';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to your Orders page and click on the order to see real-time tracking information.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy on most items. Items must be in original condition with tags attached.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express shipping is available at checkout for 2-3 day delivery.' },
  { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through Stripe with SSL encryption. We never store your card details.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they ship. Go to your Orders page and click Cancel on the order.' },
  { q: 'How do I contact customer support?', a: 'You can reach us via our Contact page, email at support@zivara.com, or call 1-800-ZIVARA.' },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Help Center</h1>
        <p className="text-gray-600 mb-10">Find answers to common questions below, or <Link href="/contact" className="text-teal-600 hover:underline">contact us</Link> for more help.</p>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
