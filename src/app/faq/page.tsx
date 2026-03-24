import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { FAQSearch } from '@/components/ui/faq-search';

export const metadata: Metadata = {
  title: 'FAQ - Zivara',
  description: 'Frequently asked questions about shopping at Zivara. Find answers about orders, shipping, returns, and more.',
};

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How do I track my order?',
        a: 'You can track your order by visiting the Track Order page and entering your order number and email address. If you have an account, you can also view order status from your Orders page.',
      },
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping typically takes 5-7 business days. Express shipping is available at checkout for 2-3 business day delivery. Delivery times may vary based on your location.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'We offer free standard shipping on orders over $50. Orders under $50 have a flat shipping rate calculated at checkout.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'You can request changes or cancellation within 1 hour of placing your order by contacting our customer service team. Once an order has been shipped, it cannot be cancelled.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 30 days of delivery for most items in their original condition. Some categories like electronics have a 15-day return window.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Go to your Orders page, select the order containing the item you want to return, and click "Request Return". Follow the instructions to print a return label.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive your returned item. The refund will be credited to your original payment method.',
      },
    ],
  },
  {
    category: 'Account & Payment',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign In" at the top of the page, then select "Create Account". You can register with your email address and a password.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment processing.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. All payments are processed through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your full card details on our servers.',
      },
    ],
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'Are your products authentic?',
        a: 'Yes, all products sold on Zivara are 100% authentic. We work directly with authorized suppliers and brands to ensure product quality.',
      },
      {
        q: 'How do I leave a product review?',
        a: 'After purchasing and receiving a product, visit the product page and scroll to the reviews section. You must be signed in and have purchased the item to leave a review.',
      },
      {
        q: 'What if an item is out of stock?',
        a: 'If an item is currently out of stock, you can add it to your wishlist to be notified when it becomes available again.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'FAQ' }]} />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-[#0F1111]">Frequently Asked Questions</h1>
            <p className="text-sm text-[#565959] mt-1">
              Find answers to common questions about shopping at Zivara
            </p>
          </div>

          <FAQSearch faqs={faqs} />

          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-sm text-[#565959] mb-3">
              Still have questions? We&apos;re here to help.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#fbbf24] hover:bg-[#f59e0b] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
