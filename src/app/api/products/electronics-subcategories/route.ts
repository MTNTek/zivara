import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Get Electronics category using direct select
    const [electronicsCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, 'electronics'))
      .limit(1);

    if (!electronicsCategory) {
      return NextResponse.json({});
    }

    // Fetch all electronics products
    const electronicsProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
      })
      .from(products)
      .where(
        and(
          eq(products.categoryId, electronicsCategory.id),
          eq(products.isActive, true)
        )
      )
      .orderBy(products.name);

    // Group products by subcategory based on product name patterns
    const grouped: Record<string, Array<{ id: string; name: string; slug: string }>> = {
      smartphones: [],
      laptops: [],
      tablets: [],
      cameras: [],
      headphones: [],
      smartwatches: [],
    };

    electronicsProducts.forEach((product) => {
      const nameLower = product.name.toLowerCase();
      
      if (nameLower.includes('iphone') || nameLower.includes('galaxy') || 
          nameLower.includes('pixel') || nameLower.includes('oneplus') || 
          nameLower.includes('xiaomi') || nameLower.includes('phone')) {
        grouped.smartphones.push(product);
      } else if (nameLower.includes('macbook') || nameLower.includes('laptop') || 
                 nameLower.includes('thinkpad') || nameLower.includes('xps') || 
                 nameLower.includes('spectre') || nameLower.includes('rog')) {
        grouped.laptops.push(product);
      } else if (nameLower.includes('ipad') || nameLower.includes('tablet') || 
                 nameLower.includes('surface pro') || nameLower.includes('fire hd')) {
        grouped.tablets.push(product);
      } else if (nameLower.includes('camera') || nameLower.includes('canon') || 
                 nameLower.includes('sony a') || nameLower.includes('nikon') || 
                 nameLower.includes('fujifilm') || nameLower.includes('gopro')) {
        grouped.cameras.push(product);
      } else if (nameLower.includes('headphone') || nameLower.includes('airpods') || 
                 nameLower.includes('beats') || nameLower.includes('bose') || 
                 nameLower.includes('sennheiser')) {
        grouped.headphones.push(product);
      } else if (nameLower.includes('watch') && !nameLower.includes('camera')) {
        grouped.smartwatches.push(product);
      }
    });

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error fetching electronics subcategories:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
