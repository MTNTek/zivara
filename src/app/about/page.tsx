import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Zivara</h1>
        <p className="text-lg text-gray-700 mb-6">
          Zivara is your one-stop online shopping destination, offering thousands of products across
          electronics, fashion, home goods, and more — all at competitive prices with fast, reliable shipping.
        </p>
        <p className="text-gray-600 mb-6">
          Founded with the mission to make quality products accessible to everyone, we work directly with
          trusted brands and suppliers to bring you the best selection at the best value.
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our Promise</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-3">
            <span className="text-teal-500 mt-1">✓</span>
            <span>Quality products from verified sellers</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-teal-500 mt-1">✓</span>
            <span>Free shipping on orders over $50</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-teal-500 mt-1">✓</span>
            <span>30-day hassle-free returns</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-teal-500 mt-1">✓</span>
            <span>Secure checkout with SSL encryption</span>
          </li>
        </ul>
        <div className="mt-10">
          <Link href="/products" className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
