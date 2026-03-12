import { getCategories } from '@/features/products/cached-queries';
import { requireAdmin } from '@/lib/auth';
import { ProductForm } from '@/components/admin/product-form';

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-gray-600">Create a new product in your catalog</p>
        </div>

        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
