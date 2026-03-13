import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-8xl">🔍</div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Page not found
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-teal-600 px-6 py-3 text-white font-semibold hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Go home
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
