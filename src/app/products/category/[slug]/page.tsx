import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getProductsByCategory } from '@/features/products/cached-queries';
import { ProductGrid } from '@/components/product/product-grid';
import { Pagination } from '@/components/ui/pagination';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sortBy?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const page = Number(searchParams.page) || 1;
  const limit = 24;

  const { products, total } = await getProductsByCategory(category.id, {
    page,
    limit,
    sortBy: searchParams.sortBy as any,
    includeSubcategories: true,
  });

  const totalPages = Math.ceil(total / limit);

  // Build breadcrumb trail
  const breadcrumbs: Array<{ name: string; slug: string }> = [];
  let currentCategory = category;
  
  // Note: This is simplified. In a real implementation, you'd need to fetch parent categories
  breadcrumbs.unshift({ name: currentCategory.name, slug: currentCategory.slug });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-teal-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-teal-600">Products</Link>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.slug} className="flex items-center space-x-2">
                <span>/</span>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <Link 
                    href={`/products/category/${crumb.slug}`}
                    className="hover:text-teal-600"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.children.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/products/category/${subcategory.slug}`}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
                >
                  <h3 className="font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                    {subcategory.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {total} {total === 1 ? 'product' : 'products'}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
              <select
                id="sort"
                value={searchParams.sortBy || ''}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    params.set('sortBy', e.target.value);
                  } else {
                    params.delete('sortBy');
                  }
                  params.delete('page');
                  window.location.href = `/products/category/${params.slug}?${params.toString()}`;
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        {products.length > 0 ? (
          <>
            <ProductGrid products={products} />
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products in this category
            </h3>
            <p className="text-gray-600 mb-4">
              Check back later for new products
            </p>
            <Link
              href="/products"
              className="inline-block text-teal-600 hover:text-teal-700 font-semibold"
            >
              Browse All Products →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
