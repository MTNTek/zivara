import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-teal-400 mb-4">Zivara</h2>
            <p className="text-sm">
              Your trusted destination for quality products at great prices.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <nav aria-label="Shop links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products" className="hover:text-teal-400 transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?sortBy=newest" className="hover:text-teal-400 transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products?sortBy=rating" className="hover:text-teal-400 transition-colors">
                    Best Sellers
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <nav aria-label="Customer service links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/orders" className="hover:text-teal-400 transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-teal-400 transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-teal-400 transition-colors">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <nav aria-label="Account links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:text-teal-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-teal-400 transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-teal-400 transition-colors">
                    Profile
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Zivara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
