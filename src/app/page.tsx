import Link from 'next/link';
import { getProducts } from '@/features/products/cached-queries';
import { ProductCard } from '@/components/product/ProductCard';

export default async function HomePage() {
  // Fetch featured products
  const { products: featuredProducts } = await getProducts({
    limit: 12,
    sortBy: 'newest',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative w-full px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to Zivara
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Discover amazing products at unbeatable prices
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#032854] hover:bg-[#021d3d] text-white px-8 py-3 rounded font-bold transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="w-full px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Electronics', icon: '💻', href: '/products/category/electronics' },
            { name: 'Fashion', icon: '👕', href: '/products/category/mens-fashion' },
            { name: 'Home & Kitchen', icon: '🏠', href: '/products/category/home-kitchen' },
            { name: 'Books', icon: '📚', href: '/products/category/books' },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="font-bold text-gray-900">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals Banner */}
      <section className="w-full px-4 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Today's Deals
          </h2>
          <p className="text-gray-600">
            Don't miss out on our special offers
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full px-4 py-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                discountPrice={product.discountPrice}
                imageUrl={product.images?.[0]?.imageUrl}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount || 0}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link
              href="/products"
              className="inline-block text-[#007185] hover:text-[#febd69] hover:underline font-medium"
            >
              See more products →
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="w-full px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
            <p className="mb-4">On orders over $50</p>
            <Link href="/products" className="text-sm underline hover:no-underline">
              Shop Now →
            </Link>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">New Arrivals</h3>
            <p className="mb-4">Check out the latest products</p>
            <Link href="/products?sortBy=newest" className="text-sm underline hover:no-underline">
              Explore →
            </Link>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Best Sellers</h3>
            <p className="mb-4">Most popular items</p>
            <Link href="/products?sortBy=rating" className="text-sm underline hover:no-underline">
              View All →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
