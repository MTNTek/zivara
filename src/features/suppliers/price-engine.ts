import { eq, and, or } from 'drizzle-orm';
import { db } from '@/db';
import { markupRules, productSupplierLinks, products } from '@/db/schema';
import { convert, getExchangeRate } from './currency';

export interface MarkupCalculation {
  costPrice: number;
  costCurrency: string;
  convertedCostPrice: number;
  markupType: 'percentage' | 'fixed';
  markupValue: number;
  markupAmount: number;
  displayPrice: number;
  ruleId: string | null; // null = default 20% rule
}

type MarkupRule = typeof markupRules.$inferSelect;

/**
 * Given an array of markup rules, find the most specific applicable rule.
 * Specificity order: product-level > category-level > supplier-level.
 * Among rules at the same specificity level, prefer higher priority.
 * Only considers active rules. Returns null if no rule matches.
 */
export function resolveMarkupRule(
  rules: MarkupRule[],
  productId: string,
  categoryId: string,
  supplierId: string
): MarkupRule | null {
  const activeRules = rules.filter((r) => r.isActive);
  if (activeRules.length === 0) return null;

  // Product-level rules (most specific)
  const productRules = activeRules
    .filter((r) => r.productId === productId)
    .sort((a, b) => b.priority - a.priority);
  if (productRules.length > 0) return productRules[0];

  // Category-level rules
  const categoryRules = activeRules
    .filter((r) => r.categoryId === categoryId && !r.productId)
    .sort((a, b) => b.priority - a.priority);
  if (categoryRules.length > 0) return categoryRules[0];

  // Supplier-level rules
  const supplierRules = activeRules
    .filter((r) => r.supplierId === supplierId && !r.productId && !r.categoryId)
    .sort((a, b) => b.priority - a.priority);
  if (supplierRules.length > 0) return supplierRules[0];

  return null;
}

/**
 * Calculate the display price for a product from a specific supplier.
 * Converts cost price to USD, fetches applicable markup rules, resolves the best rule,
 * and applies the markup. Returns a full MarkupCalculation object.
 */
export async function calculateDisplayPrice(
  productId: string,
  supplierId: string,
  costPrice: number,
  costCurrency: string
): Promise<MarkupCalculation> {
  // Get exchange rate and convert cost price to USD
  const { rate } = await getExchangeRate(costCurrency, 'USD');
  const convertedCostPrice = convert(costPrice, costCurrency, 'USD', rate);

  // Fetch the product's categoryId
  const productRecord = await db
    .select({ categoryId: products.categoryId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  const categoryId = productRecord[0]?.categoryId ?? '';

  // Fetch applicable markup rules for this product/supplier/category
  const rules = await db
    .select()
    .from(markupRules)
    .where(
      or(
        eq(markupRules.productId, productId),
        eq(markupRules.categoryId, categoryId),
        eq(markupRules.supplierId, supplierId)
      )
    );

  const rule = resolveMarkupRule(rules, productId, categoryId, supplierId);

  // Default 20% percentage markup if no rule found
  const markupType: 'percentage' | 'fixed' = rule
    ? (rule.markupType as 'percentage' | 'fixed')
    : 'percentage';
  const markupValue = rule ? Number(rule.markupValue) : 20;

  let markupAmount: number;
  let displayPrice: number;

  if (markupType === 'percentage') {
    displayPrice = Math.round(convertedCostPrice * (1 + markupValue / 100) * 100) / 100;
    markupAmount = Math.round((displayPrice - convertedCostPrice) * 100) / 100;
  } else {
    displayPrice = Math.round((convertedCostPrice + markupValue) * 100) / 100;
    markupAmount = markupValue;
  }

  return {
    costPrice,
    costCurrency,
    convertedCostPrice,
    markupType,
    markupValue,
    markupAmount,
    displayPrice,
    ruleId: rule?.id ?? null,
  };
}

/**
 * Recalculate display prices for all product-supplier links matching the given scope.
 * Scope can filter by supplierId, categoryId, or productId.
 * Returns counts of updated and errored records.
 */
export async function recalculateAllPrices(
  scope: { supplierId?: string; categoryId?: string; productId?: string }
): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  // Build conditions for fetching links
  const conditions = [];
  if (scope.supplierId) {
    conditions.push(eq(productSupplierLinks.supplierId, scope.supplierId));
  }
  if (scope.productId) {
    conditions.push(eq(productSupplierLinks.productId, scope.productId));
  }

  // Fetch matching links
  let links;
  if (scope.categoryId) {
    // Need to join with products to filter by category
    const rows = await db
      .select({
        id: productSupplierLinks.id,
        productId: productSupplierLinks.productId,
        supplierId: productSupplierLinks.supplierId,
        costPrice: productSupplierLinks.costPrice,
        costCurrency: productSupplierLinks.costCurrency,
      })
      .from(productSupplierLinks)
      .innerJoin(products, eq(products.id, productSupplierLinks.productId))
      .where(
        conditions.length > 0
          ? and(eq(products.categoryId, scope.categoryId), ...conditions)
          : eq(products.categoryId, scope.categoryId)
      );
    links = rows;
  } else {
    links = await db
      .select({
        id: productSupplierLinks.id,
        productId: productSupplierLinks.productId,
        supplierId: productSupplierLinks.supplierId,
        costPrice: productSupplierLinks.costPrice,
        costCurrency: productSupplierLinks.costCurrency,
      })
      .from(productSupplierLinks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  for (const link of links) {
    try {
      const calc = await calculateDisplayPrice(
        link.productId,
        link.supplierId,
        Number(link.costPrice),
        link.costCurrency
      );

      await db
        .update(productSupplierLinks)
        .set({
          convertedCostPrice: String(calc.convertedCostPrice),
          markupAmount: String(calc.markupAmount),
          displayPrice: String(calc.displayPrice),
          updatedAt: new Date(),
        })
        .where(eq(productSupplierLinks.id, link.id));

      updated++;
    } catch (err) {
      console.error(`Failed to recalculate price for link ${link.id}:`, err);
      errors++;
    }
  }

  return { updated, errors };
}
