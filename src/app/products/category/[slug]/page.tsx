import { redirect } from 'next/navigation';
import { getCategoryBySlug } from '@/features/products/queries';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    redirect('/products');
  }

  redirect(`/products?categoryId=${category.id}`);
}
