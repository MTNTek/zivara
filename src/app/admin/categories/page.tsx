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

  return (
    <div>
      {/* Actions */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">Manage product categories and hierarchy</p>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Link>
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
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              allCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.productCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="text-teal-600 hover:text-teal-900 mr-4"
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
