import { db } from '@/db';
import { categories } from '@/db/schema';
import { sql } from 'drizzle-orm';
import Link from 'next/link';
import { CategoryDeleteButton } from '@/components/admin/category-delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      parentId: categories.parentId,
      productCount: sql<number>`(
        SELECT COUNT(*)::int 
        FROM products 
        WHERE category_id = ${categories.id}
      )`,
    })
    .from(categories)
    .orderBy(categories.name);

  // Build hierarchy: top-level first, then children indented
  const parentMap = new Map<string | null, typeof allCategories>();
  for (const cat of allCategories) {
    const key = cat.parentId;
    if (!parentMap.has(key)) parentMap.set(key, []);
    parentMap.get(key)!.push(cat);
  }

  type FlatCat = (typeof allCategories)[number] & { depth: number };
  const flat: FlatCat[] = [];
  function walk(parentId: string | null, depth: number) {
    const children = parentMap.get(parentId) || [];
    for (const c of children) {
      flat.push({ ...c, depth });
      walk(c.id, depth + 1);
    }
  }
  walk(null, 0);

  const totalProducts = allCategories.reduce((s, c) => s + c.productCount, 0);
  const topLevel = allCategories.filter((c) => !c.parentId).length;
  const subCategories = allCategories.length - topLevel;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">Manage product categories and hierarchy</p>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Total Categories</p>
          <p className="text-2xl font-bold text-gray-900">{allCategories.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{topLevel} top-level · {subCategories} sub</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Avg Products/Category</p>
          <p className="text-2xl font-bold text-gray-900">
            {allCategories.length > 0 ? Math.round(totalProducts / allCategories.length) : 0}
          </p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {flat.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              flat.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center" style={{ paddingLeft: `${category.depth * 24}px` }}>
                      {category.depth > 0 && (
                        <span className="text-gray-300 mr-2">└</span>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.productCount > 0 ? (
                      <span className="font-medium text-gray-900">{category.productCount}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.depth === 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.depth === 0 ? 'Parent' : 'Sub'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="text-black hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <CategoryDeleteButton id={category.id} name={category.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
