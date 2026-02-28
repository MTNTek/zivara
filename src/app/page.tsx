import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories } from '@/features/products/cached-queries';

export default async function HomePage() {
  // Fetch featured products (newest products)
  const { products: featuredProducts } = await getProducts({
    limit: 8,
    sortBy: 'newest',
  });

  // Fetch top categories
  const categories = await getCategories();
  const topCategories = categories.filter(c => !c.parentId).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Zivara
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-50">
              Discover amazing products at unbeatable prices
            </p>
            <Link
              href="/products"
              className="inline-block bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                {category.imageUrl && (
                  <div className="relative w-full h-32 mb-4">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                )}
                <h3 className="text-center font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
                <div className="relative w-full h-64 bg-gray-100">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-teal-600">
                            ${Number(product.discountPrice).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.averageRating && Number(product.averageRating) > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600">
                          {Number(product.averageRating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Products
              </h3>
              <p className="text-gray-600">
                Carefully curated selection of high-quality items
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Competitive pricing on all products
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast Shipping
              </h3>
              <p className="text-gray-600">
                Quick and reliable delivery to your door
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
