import { NextRequest, NextResponse } from 'next/server';
import { getSearchSuggestionsForQuery } from '@/features/products/queries';
import { db } from '@/db';
import { products } from '@/db/schema';
import { ilike, eq, and, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [], products: [] });
  }

  // Get search term suggestions and matching products in parallel
  const [suggestions, matchingProducts] = await Promise.all([
    getSearchSuggestionsForQuery(q, 5),
    db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        discountPrice: products.discountPrice,
      })
      .from(products)
      .where(and(ilike(products.name, `%${q}%`), eq(products.isActive, true)))
      .orderBy(sql`LENGTH(${products.name})`)
      .limit(5),
  ]);

  return NextResponse.json({ suggestions, products: matchingProducts });
}
