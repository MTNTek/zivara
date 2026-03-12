import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const [category] = await db
      .insert(categories)
      .values({ name, slug, description: description || null })
      .returning();

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
