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
            className="rounded-full bg-[#fbbf24] px-6 py-3 text-[#0F1111] font-semibold hover:bg-[#f59e0b] transition-colors border border-[#FCD200]"
          >
            Browse products
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#D5D9D9] bg-white px-6 py-3 text-[#0F1111] font-semibold hover:bg-[#F7FAFA] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
