import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'About Us - Zivara',
  description: 'Learn about Zivara — your trusted online marketplace for quality products at great prices.',
};

const values = [
  {
    icon: '🛡️',
    title: 'Quality Guaranteed',
    description: 'Every product is sourced from verified suppliers and undergoes quality checks before reaching you.',
  },
  {
    icon: '🚚',
    title: 'Fast Delivery',
    description: 'We partner with reliable carriers to get your orders delivered quickly and safely.',
  },
  {
    icon: '💰',
    title: 'Best Prices',
    description: 'Our direct supplier relationships let us offer competitive prices across all categories.',
  },
  {
    icon: '🤝',
    title: 'Customer First',
    description: 'Our dedicated support team is here to help with any questions or concerns.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'About Us' }]} />

        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="bg-white rounded-lg p-8 mb-6 text-center">
            <h1 className="text-3xl font-bold text-[#0F1111] mb-3">About Zivara</h1>
            <p className="text-[#565959] leading-relaxed max-w-xl mx-auto">
              Zivara is your trusted online marketplace, bringing together quality products
              from verified suppliers at prices you&apos;ll love. We believe shopping online
              should be simple, reliable, and enjoyable.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-lg p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-[#0F1111] mb-1">{v.title}</h3>
                <p className="text-sm text-[#565959] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-[#0F1111] mb-4 text-center">Zivara by the Numbers</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#2563eb]">1000+</p>
                <p className="text-xs text-[#565959] mt-1">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2563eb]">12+</p>
                <p className="text-xs text-[#565959] mt-1">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2563eb]">24/7</p>
                <p className="text-xs text-[#565959] mt-1">Support</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-lg font-bold text-[#0F1111] mb-2">Ready to start shopping?</h2>
            <p className="text-sm text-[#565959] mb-4">
              Browse our collection and find something you love.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
