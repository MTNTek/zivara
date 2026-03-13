import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-8xl">📦</div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Product not found
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          This product may have been removed or the link is incorrect.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="rounded-lg bg-teal-600 px-6 py-3 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Browse products
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
