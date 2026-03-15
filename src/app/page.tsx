import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/features/products/cached-queries';
import { ProductCard } from '@/components/product/ProductCard';

const allCategories = [
  { name: 'Electronics', icon: '💻', href: '/products/category/electronics', color: 'from-blue-500 to-blue-600' },
  { name: "Men's Fashion", icon: '👔', href: '/products/category/mens-fashion', color: 'from-gray-700 to-gray-800' },
  { name: "Women's Fashion", icon: '👗', href: '/products/category/womens-fashion', color: 'from-pink-500 to-pink-600' },
  { name: 'Home & Kitchen', icon: '🏠', href: '/products/category/home-kitchen', color: 'from-amber-500 to-amber-600' },
  { name: 'Beauty & Health', icon: '💄', href: '/products/category/beauty-health', color: 'from-rose-400 to-rose-500' },
  { name: 'Sports & Outdoors', icon: '⚽', href: '/products/category/sports-outdoors', color: 'from-green-500 to-green-600' },
  { name: 'Toys & Games', icon: '🎮', href: '/products/category/toys-games', color: 'from-purple-500 to-purple-600' },
  { name: 'Books', icon: '📚', href: '/products/category/books', color: 'from-yellow-600 to-yellow-700' },
  { name: 'Automotive', icon: '🚗', href: '/products/category/automotive', color: 'from-red-500 to-red-600' },
  { name: 'Pet Supplies', icon: '🐾', href: '/products/category/pet-supplies', color: 'from-orange-400 to-orange-500' },
  { name: 'Office Products', icon: '🖨️', href: '/products/category/office-products', color: 'from-slate-500 to-slate-600' },
  { name: 'Garden', icon: '🌿', href: '/products/category/garden', color: 'from-emerald-500 to-emerald-600' },
];

export default async function HomePage() {
  const [{ products: featuredProducts }, { products: newestProducts }] = await Promise.all([
    getProducts({ limit: 12, sortBy: 'rating' }),
    getProducts({ limit: 6, sortBy: 'newest' }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative h-[420px] md:h-[480px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80&auto=format&fit=crop"
          alt="Shopping banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative w-full px-6 md:px-12 h-full flex items-center">
          <div className="max-w-xl text-white">
            <p className="text-sm md:text-base uppercase tracking-widest text-teal-300 mb-3">New Season Collection</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              Thousands of products at prices you&apos;ll love. Free shipping on orders over $50.
            </p>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/products?sortBy=newest"
                className="inline-block bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-white/30"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="w-full px-4 md:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {allCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center group"
            >
              <div className="text-3xl mb-1">{cat.icon}</div>
              <h3 className="text-xs font-medium text-gray-700 group-hover:text-teal-600 transition-colors leading-tight">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="w-full px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/products/category/electronics" className="relative rounded-xl overflow-hidden h-48 group">
            <Image
              src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80&auto=format&fit=crop"
              alt="Electronics deals"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs text-teal-300 font-medium">Up to 40% off</p>
              <h3 className="text-xl font-bold">Electronics</h3>
            </div>
          </Link>
          <Link href="/products/category/womens-fashion" className="relative rounded-xl overflow-hidden h-48 group">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80&auto=format&fit=crop"
              alt="Fashion deals"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs text-teal-300 font-medium">New Arrivals</p>
              <h3 className="text-xl font-bold">Fashion</h3>
            </div>
          </Link>
          <Link href="/products/category/home-kitchen" className="relative rounded-xl overflow-hidden h-48 group">
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop"
              alt="Home & Kitchen deals"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs text-teal-300 font-medium">Best Sellers</p>
              <h3 className="text-xl font-bold">Home & Kitchen</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Top Rated Products */}
      <section className="w-full px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Rated Products</h2>
          <Link href="/products?sortBy=rating" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
            View All →
          </Link>
        </div>
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
      </section>

      {/* Value Props */}
      <section className="w-full px-4 md:px-8 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: '🔄', title: 'Easy Returns', desc: '30-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
            { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-5 text-center shadow-sm">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="w-full px-4 md:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link href="/products?sortBy=newest" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {newestProducts.map((product) => (
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
      </section>

      {/* Newsletter */}
      <section className="w-full px-4 md:px-8 pb-10">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Stay in the Loop</h2>
          <p className="text-teal-100 mb-6 max-w-md mx-auto">
            Get the latest deals, new arrivals, and exclusive offers delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
