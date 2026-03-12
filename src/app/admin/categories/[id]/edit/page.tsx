import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { CategoryEditForm } from './category-edit-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Edit Category: {category.name}</h2>
      </div>
      <CategoryEditForm category={category} />
    </div>
  );
}
