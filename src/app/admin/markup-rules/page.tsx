import { db } from '@/db';
import { markupRules, suppliers, categories, products } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { MarkupRulesClient } from './markup-rules-client';

export const dynamic = 'force-dynamic';

export default async function AdminMarkupRulesPage() {
  await requireAdmin();

  const allRules = await db.select().from(markupRules).orderBy(desc(markupRules.createdAt));
  const allSuppliers = await db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers);
  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);
  const allProducts = await db.select({ id: products.id, name: products.name }).from(products);

  // Build lookup maps for display names
  const supplierMap = Object.fromEntries(allSuppliers.map((s) => [s.id, s.name]));
  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]));
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p.name]));

  const rulesWithNames = allRules.map((rule) => ({
    id: rule.id,
    supplierId: rule.supplierId,
    categoryId: rule.categoryId,
    productId: rule.productId,
    supplierName: rule.supplierId ? supplierMap[rule.supplierId] ?? 'Unknown' : null,
    categoryName: rule.categoryId ? categoryMap[rule.categoryId] ?? 'Unknown' : null,
    productName: rule.productId ? productMap[rule.productId] ?? 'Unknown' : null,
    markupType: rule.markupType as 'percentage' | 'fixed',
    markupValue: Number(rule.markupValue),
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
  }));

  const supplierOptions = allSuppliers.map((s) => ({ id: s.id, name: s.name }));
  const categoryOptions = allCategories.map((c) => ({ id: c.id, name: c.name }));
  const productOptions = allProducts.map((p) => ({ id: p.id, name: p.name }));

  return (
    <MarkupRulesClient
      rules={rulesWithNames}
      suppliers={supplierOptions}
      categories={categoryOptions}
      products={productOptions}
    />
  );
}
