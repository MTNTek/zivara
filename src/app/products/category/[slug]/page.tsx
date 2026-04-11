import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  getCategoryBySlug,
  getCategories,
  getProductsByCategory,
} from '@/features/products/cached-queries';
import { ProductGrid } from '@/components/product/product-grid';
import { CategorySidebar } from '@/components/product/category-sidebar';
import { Pagination } from '@/components/ui/pagination';
import { SortDropdown } from '@/components/product/sort-dropdown';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { BackToTop } from '@/components/ui/back-to-top';
import { ScrollRestore } from '@/components/ui/scroll-restore';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
    subcategories?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category Not Found - Zivara' };
  }

  return {
    title: `${category.name} - Zivara`,
    description: category.description || `Shop ${category.name} products at Zivara.`,
    openGraph: {
      title: `${category.name} - Zivara`,
      description: category.description || `Shop ${category.name} products at Zivara.`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const page = Number(sp.page) || 1;
  const limit = 24;
  const subcategorySlugs = sp.subcategories?.split(',').filter(Boolean) || [];

  const queryParams = {
    page,
    limit,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sortBy: sp.sortBy,
    subcategorySlugs: subcategorySlugs.length > 0 ? subcategorySlugs : undefined,
  };

  const [{ products, total }, allCategories, wishlistedIds] = await Promise.all([
    getProductsByCategory(category.id, queryParams),
    getCategories(),
    getWishlistProductIds(),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Build category hierarchy data for sidebar
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  // Get ancestors (breadcrumb path)
  const ancestors: typeof allCategories = [];
  let currentId = category.parentId;
  while (currentId) {
    const parent = categoryMap.get(currentId);
    if (parent) {
      ancestors.unshift(parent);
      currentId = parent.parentId;
    } else {
      break;
    }
  }

  // Get parent category
  const parentCategory = category.parentId ? categoryMap.get(category.parentId) || null : null;

  // Get child categories (subcategories of current)
  const childCategories = allCategories
    .filter((c) => c.parentId === category.id)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  // Build grandchildren map: childId -> grandchildren[]
  const grandchildrenMap: Record<string, { id: string; name: string; slug: string; parentId: string | null }[]> = {};
  for (const child of childCategories) {
    const grandchildren = allCategories
      .filter((c) => c.parentId === child.id)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    if (grandchildren.length > 0) {
      grandchildrenMap[child.id] = grandchildren.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId }));
    }
  }

  // Get sibling categories (same parent)
  const siblingCategories = allCategories
    .filter((c) => c.parentId === category.parentId && c.id !== category.id)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  const currentFilters = {
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sortBy: sp.sortBy,
    subcategories: subcategorySlugs.length > 0 ? subcategorySlugs : undefined,
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com';
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Products', url: `${baseUrl}/products` },
    ...ancestors.map((a) => ({ name: a.name, url: `${baseUrl}/products/category/${a.slug}` })),
    { name: category.name, url: `${baseUrl}/products/category/${category.slug}` },
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: item.name,
              item: item.url,
            })),
          }),
        }}
      />

      <div className="px-4 sm:px-6 lg:px-10 py-4">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-[#565959] mb-3" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <a href="/products" className="hover:text-[#1d4ed8] hover:underline">All Products</a>
            </li>
            {ancestors.map((a) => (
              <li key={a.id} className="flex items-center gap-1">
                <span className="text-[#949494]">›</span>
                <a href={`/products/category/${a.slug}`} className="hover:text-[#1d4ed8] hover:underline">{a.name}</a>
              </li>
            ))}
            <li className="flex items-center gap-1">
              <span className="text-[#949494]">›</span>
              <span className="text-[#0F1111]">{category.name}</span>
            </li>
          </ol>
        </nav>

        {/* Results header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#0F1111]">{category.name}</h1>
          {category.description && (
            <p className="text-[13px] text-[#565959] mt-1">{category.description}</p>
          )}
        </div>

        <div className="flex">
          {/* Left Sidebar - Desktop only */}
          <div className="hidden lg:block pr-5 border-r border-[#e7e7e7]">
            <Suspense fallback={null}>
              <CategorySidebar
                currentCategory={{ id: category.id, name: category.name, slug: category.slug, parentId: category.parentId }}
                parentCategory={parentCategory ? { id: parentCategory.id, name: parentCategory.name, slug: parentCategory.slug, parentId: parentCategory.parentId } : null}
                siblingCategories={siblingCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId }))}
                childCategories={childCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId }))}
                grandchildrenMap={grandchildrenMap}
                ancestors={ancestors.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId }))}
                currentFilters={currentFilters}
                totalResults={total}
                showBrands={category.slug === 'electronics' || ancestors.some((a) => a.slug === 'electronics')}
              />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pl-5">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e7e7e7]">
              <p className="text-[14px] text-[#565959]">
                {total > 0 ? (
                  <>
                    {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of over {total} results for{' '}
                    <span className="font-bold text-[#1d4ed8]">&quot;{category.name}&quot;</span>
                  </>
                ) : (
                  <>No results for <span className="font-bold text-[#1d4ed8]">&quot;{category.name}&quot;</span></>
                )}
              </p>
              <SortDropdown currentSort={sp.sortBy} />
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <>
                <ProductGrid products={products} wishlistedIds={wishlistedIds} />
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-[#0F1111] mb-1">No products found</h3>
                <p className="text-[13px] text-[#565959] mb-6">Try adjusting your filters or browse a different category</p>
                {(sp.minPrice || sp.maxPrice || sp.minRating) && (
                  <a
                    href={`/products/category/${slug}`}
                    className="inline-block bg-[#fbbf24] text-[#0F1111] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#f59e0b] transition-colors"
                  >
                    Clear All Filters
                  </a>
                )}
                {childCategories.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-[#565959] mb-3">Browse subcategories</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {childCategories.slice(0, 8).map((child) => (
                        <a
                          key={child.id}
                          href={`/products/category/${child.slug}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BackToTop />
      <ScrollRestore />
    </div>
  );
}
