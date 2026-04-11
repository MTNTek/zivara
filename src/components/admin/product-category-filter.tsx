'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductCategoryFilterProps {
  categories: Category[];
}

export function ProductCategoryFilter({ categories }: ProductCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  return (
    <select
      value={currentCategory}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set('category', e.target.value);
        } else {
          params.delete('category');
        }
        params.delete('page');
        router.push(`/admin/products?${params.toString()}`);
      }}
      className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  );
}
