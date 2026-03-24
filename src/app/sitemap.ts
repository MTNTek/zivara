import type { MetadataRoute } from 'next';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Prevent static prerendering — sitemap needs live DB data
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/bestsellers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/new-arrivals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/track`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Category pages
  const allCategories = await db
    .select({ slug: categories.slug, updatedAt: categories.updatedAt })
    .from(categories);

  const categoryPages: MetadataRoute.Sitemap = allCategories.map((cat) => ({
    url: `${baseUrl}/products/category/${cat.slug}`,
    lastModified: cat.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Product pages
  const allProducts = await db
    .select({ id: products.id, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.isActive, true));

  const productPages: MetadataRoute.Sitemap = allProducts.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
