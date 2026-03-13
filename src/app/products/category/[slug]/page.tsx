import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCategoryBySlug } from '@/features/products/queries';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    redirect('/products');
  }

  redirect(`/products?categoryId=${category.id}`);
}
