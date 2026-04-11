import { describe, it, expect } from 'vitest';
import { resolveMarkupRule } from '../price-engine';

// Helper to create a mock markup rule
function makeRule(overrides: Partial<{
  id: string;
  supplierId: string | null;
  categoryId: string | null;
  productId: string | null;
  markupType: string;
  markupValue: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id ?? 'rule-1',
    supplierId: overrides.supplierId ?? null,
    categoryId: overrides.categoryId ?? null,
    productId: overrides.productId ?? null,
    markupType: overrides.markupType ?? 'percentage',
    markupValue: overrides.markupValue ?? '15',
    priority: overrides.priority ?? 0,
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  };
}

const PRODUCT_ID = 'prod-1';
const CATEGORY_ID = 'cat-1';
const SUPPLIER_ID = 'sup-1';

describe('resolveMarkupRule', () => {
  it('returns null for empty rules array', () => {
    expect(resolveMarkupRule([], PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID)).toBeNull();
  });

  it('returns null when all rules are inactive', () => {
    const rules = [
      makeRule({ id: 'r1', supplierId: SUPPLIER_ID, isActive: false }),
    ];
    expect(resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID)).toBeNull();
  });

  it('selects product-level rule over category and supplier rules', () => {
    const rules = [
      makeRule({ id: 'supplier-rule', supplierId: SUPPLIER_ID }),
      makeRule({ id: 'category-rule', categoryId: CATEGORY_ID }),
      makeRule({ id: 'product-rule', productId: PRODUCT_ID }),
    ];
    const result = resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID);
    expect(result?.id).toBe('product-rule');
  });

  it('selects category-level rule over supplier rule when no product rule', () => {
    const rules = [
      makeRule({ id: 'supplier-rule', supplierId: SUPPLIER_ID }),
      makeRule({ id: 'category-rule', categoryId: CATEGORY_ID }),
    ];
    const result = resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID);
    expect(result?.id).toBe('category-rule');
  });

  it('selects supplier-level rule when no product or category rules', () => {
    const rules = [
      makeRule({ id: 'supplier-rule', supplierId: SUPPLIER_ID }),
    ];
    const result = resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID);
    expect(result?.id).toBe('supplier-rule');
  });

  it('prefers higher priority among same specificity level', () => {
    const rules = [
      makeRule({ id: 'low-priority', productId: PRODUCT_ID, priority: 1 }),
      makeRule({ id: 'high-priority', productId: PRODUCT_ID, priority: 10 }),
    ];
    const result = resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID);
    expect(result?.id).toBe('high-priority');
  });

  it('ignores rules for different product/category/supplier', () => {
    const rules = [
      makeRule({ id: 'other-product', productId: 'other-prod' }),
      makeRule({ id: 'other-category', categoryId: 'other-cat' }),
      makeRule({ id: 'other-supplier', supplierId: 'other-sup' }),
    ];
    const result = resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID);
    expect(result).toBeNull();
  });

  it('filters out inactive rules before resolving', () => {
    const rules = [
      makeRule({ id: 'inactive-product', productId: PRODUCT_ID, isActive: false }),
      makeRule({ id: 'active-supplier', supplierId: SUPPLIER_ID, isActive: true }),
    ];
    const result = resolveMarkupRule(rules, PRODUCT_ID, CATEGORY_ID, SUPPLIER_ID);
    expect(result?.id).toBe('active-supplier');
  });
});
