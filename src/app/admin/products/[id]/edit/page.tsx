import { getProductById } from '@/features/products/cached-queries';
import { getCategories } from '@/features/products/cached-queries';
import { ProductForm } from '@/components/admin/product-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-2 text-gray-600">Update product information</p>
        </div>

        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
