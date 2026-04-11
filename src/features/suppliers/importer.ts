import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  suppliers,
  products,
  productSupplierLinks,
  inventory,
  supplierPriceHistory,
  categories,
} from '@/db/schema';
import type { SupplierType, SupplierProduct } from './adapters/types';
import { SupplierRegistry } from './registry';
import { getDecryptedCredentials } from './credentials';
import { calculateDisplayPrice } from './price-engine';
import { logger } from '@/lib/logger';

export interface ImportResult {
  supplierId: string;
  totalFetched: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { supplierProductId: string; error: string }[];
}

export interface SyncResult {
  supplierId: string;
  checked: number;
  updated: number;
  errors: number;
}

const MAX_BATCH_SIZE = 500;

/**
 * Generate a URL-friendly slug from a product name.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate a supplier product record. Returns an error message if invalid, null if valid.
 */
function validateProduct(product: SupplierProduct): string | null {
  if (!product.name || product.name.trim().length === 0) {
    return 'Missing product name';
  }
  if (product.price <= 0) {
    return `Invalid price: ${product.price}`;
  }
  return null;
}

/**
 * Get or create an "Imported" category for imported products.
 */
async function getImportedCategoryId(): Promise<string> {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, 'imported'))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [created] = await db
    .insert(categories)
    .values({
      name: 'Imported',
      slug: 'imported',
      description: 'Products imported from external suppliers',
    })
    .returning({ id: categories.id });

  return created.id;
}

/**
 * Fetch the supplier record and resolve its adapter and credentials.
 */
async function resolveSupplier(supplierId: string, registry: SupplierRegistry) {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!supplier) {
    throw new Error(`Supplier not found: ${supplierId}`);
  }

  const adapter = registry.getAdapter(supplier.type as SupplierType);
  if (!adapter) {
    throw new Error(`No adapter registered for supplier type: ${supplier.type}`);
  }

  const credentials = await getDecryptedCredentials(supplierId);

  return { supplier, adapter, credentials };
}

/**
 * Import products from a supplier into the local catalog.
 *
 * - Fetches products via the supplier adapter
 * - Creates or updates local product records and product-supplier links
 * - Generates SKUs in format {SUPPLIER_CODE}-{SUPPLIER_PRODUCT_ID}
 * - Handles idempotent imports (updates existing links)
 * - Skips invalid records (missing name, price <= 0)
 * - Batches up to 500 products per import job
 */
export async function importProducts(
  supplierId: string,
  options?: { page?: number; limit?: number; query?: string }
): Promise<ImportResult> {
  const registry = new SupplierRegistry();
  const { supplier, adapter, credentials } = await resolveSupplier(supplierId, registry);

  const effectiveLimit = Math.min(options?.limit ?? MAX_BATCH_SIZE, MAX_BATCH_SIZE);

  const response = await adapter.fetchProducts(credentials, {
    page: options?.page,
    limit: effectiveLimit,
    query: options?.query,
  });

  if (!response.success || !response.data) {
    throw new Error(
      `Failed to fetch products from supplier: ${response.error?.message ?? 'Unknown error'}`
    );
  }

  const fetchedProducts = response.data.products;
  const supplierCode = supplier.type.toUpperCase();
  const defaultCategoryId = await getImportedCategoryId();

  const result: ImportResult = {
    supplierId,
    totalFetched: fetchedProducts.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const sp of fetchedProducts) {
    const validationError = validateProduct(sp);
    if (validationError) {
      result.skipped++;
      result.errors.push({
        supplierProductId: sp.supplierProductId || 'unknown',
        error: validationError,
      });
      continue;
    }

    try {
      // Check if a link already exists for this supplier + supplierProductId
      const [existingLink] = await db
        .select({
          id: productSupplierLinks.id,
          productId: productSupplierLinks.productId,
        })
        .from(productSupplierLinks)
        .where(
          and(
            eq(productSupplierLinks.supplierId, supplierId),
            eq(productSupplierLinks.supplierProductId, sp.supplierProductId)
          )
        )
        .limit(1);

      if (existingLink) {
        // Update existing product and link
        await db
          .update(products)
          .set({
            name: sp.name,
            description: sp.description || '',
            price: String(sp.price),
            isActive: sp.inStock,
            updatedAt: new Date(),
          })
          .where(eq(products.id, existingLink.productId));

        await db
          .update(productSupplierLinks)
          .set({
            costPrice: String(sp.price),
            costCurrency: sp.currency,
            supplierProductUrl: sp.productUrl,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(productSupplierLinks.id, existingLink.id));

        // Update inventory
        if (sp.stockQuantity !== undefined) {
          await db
            .update(inventory)
            .set({
              quantity: sp.stockQuantity,
              updatedAt: new Date(),
            })
            .where(eq(inventory.productId, existingLink.productId));
        }

        result.updated++;
      } else {
        // Create new product
        const sku = `${supplierCode}-${sp.supplierProductId}`;
        const slug = generateSlug(sp.name) + '-' + sp.supplierProductId.slice(0, 8);

        const [newProduct] = await db
          .insert(products)
          .values({
            name: sp.name,
            slug,
            description: sp.description || '',
            price: String(sp.price),
            categoryId: defaultCategoryId,
            sku,
            isActive: sp.inStock,
          })
          .returning({ id: products.id });

        // Create product-supplier link
        await db.insert(productSupplierLinks).values({
          productId: newProduct.id,
          supplierId,
          supplierProductId: sp.supplierProductId,
          costPrice: String(sp.price),
          costCurrency: sp.currency,
          supplierProductUrl: sp.productUrl,
          isPrimary: true,
          lastSyncedAt: new Date(),
        });

        // Create inventory record
        await db.insert(inventory).values({
          productId: newProduct.id,
          quantity: sp.stockQuantity ?? (sp.inStock ? 10 : 0),
        });

        result.created++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Error importing product ${sp.supplierProductId}`, { error: errorMessage });
      result.errors.push({
        supplierProductId: sp.supplierProductId,
        error: errorMessage,
      });
    }
  }

  return result;
}

/**
 * Synchronize inventory for all products linked to a supplier.
 *
 * - Fetches all productSupplierLinks for the supplier
 * - Calls adapter's checkInventory with all supplierProductIds
 * - Updates local inventory: out of stock → quantity 0, isActive false
 * - Back in stock → restore quantity, isActive true
 */
export async function syncInventory(supplierId: string): Promise<SyncResult> {
  const registry = new SupplierRegistry();
  const { adapter, credentials } = await resolveSupplier(supplierId, registry);

  // Fetch all product-supplier links for this supplier
  const links = await db
    .select({
      id: productSupplierLinks.id,
      productId: productSupplierLinks.productId,
      supplierProductId: productSupplierLinks.supplierProductId,
    })
    .from(productSupplierLinks)
    .where(eq(productSupplierLinks.supplierId, supplierId));

  if (links.length === 0) {
    return { supplierId, checked: 0, updated: 0, errors: 0 };
  }

  const supplierProductIds = links.map((l) => l.supplierProductId);

  const response = await adapter.checkInventory(credentials, supplierProductIds);

  if (!response.success || !response.data) {
    throw new Error(
      `Failed to check inventory: ${response.error?.message ?? 'Unknown error'}`
    );
  }

  const result: SyncResult = {
    supplierId,
    checked: response.data.length,
    updated: 0,
    errors: 0,
  };

  // Build a map of supplierProductId → inventory result
  const inventoryMap = new Map(
    response.data.map((item) => [item.productId, item])
  );

  for (const link of links) {
    const inventoryStatus = inventoryMap.get(link.supplierProductId);
    if (!inventoryStatus) continue;

    try {
      if (!inventoryStatus.inStock) {
        // Out of stock: set quantity to 0, mark product unavailable
        await db
          .update(inventory)
          .set({ quantity: 0, updatedAt: new Date() })
          .where(eq(inventory.productId, link.productId));

        await db
          .update(products)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(products.id, link.productId));

        result.updated++;
      } else {
        // In stock: restore quantity and availability
        const newQuantity = inventoryStatus.quantity ?? 10;

        await db
          .update(inventory)
          .set({ quantity: newQuantity, updatedAt: new Date() })
          .where(eq(inventory.productId, link.productId));

        await db
          .update(products)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(products.id, link.productId));

        result.updated++;
      }
    } catch (err) {
      logger.error(`Error syncing inventory for product ${link.supplierProductId}`, { error: err instanceof Error ? err.message : 'Unknown error' });
      result.errors++;
    }
  }

  return result;
}

/**
 * Synchronize prices for all products linked to a supplier.
 *
 * - Fetches current prices via adapter's fetchProducts
 * - Detects cost price changes and updates product-supplier links
 * - Triggers price engine recalculation for changed prices
 * - Flags products for review when cost increases >20%
 * - Records all price changes in supplierPriceHistory
 */
export async function syncPrices(supplierId: string): Promise<SyncResult> {
  const registry = new SupplierRegistry();
  const { adapter, credentials } = await resolveSupplier(supplierId, registry);

  // Fetch all product-supplier links for this supplier
  const links = await db
    .select()
    .from(productSupplierLinks)
    .where(eq(productSupplierLinks.supplierId, supplierId));

  if (links.length === 0) {
    return { supplierId, checked: 0, updated: 0, errors: 0 };
  }

  // Fetch current prices from the supplier
  const response = await adapter.fetchProducts(credentials, {
    limit: MAX_BATCH_SIZE,
  });

  if (!response.success || !response.data) {
    throw new Error(
      `Failed to fetch products for price sync: ${response.error?.message ?? 'Unknown error'}`
    );
  }

  const result: SyncResult = {
    supplierId,
    checked: links.length,
    updated: 0,
    errors: 0,
  };

  // Build a map of supplierProductId → current supplier product data
  const priceMap = new Map(
    response.data.products.map((p) => [p.supplierProductId, p])
  );

  for (const link of links) {
    const currentProduct = priceMap.get(link.supplierProductId);
    if (!currentProduct) continue;

    const oldCostPrice = Number(link.costPrice);
    const newCostPrice = currentProduct.price;

    // Skip if price hasn't changed
    if (oldCostPrice === newCostPrice) continue;

    try {
      // Calculate new display price via price engine
      const priceCalc = await calculateDisplayPrice(
        link.productId,
        supplierId,
        newCostPrice,
        currentProduct.currency
      );

      // Check if cost increase > 20% — flag for review
      const priceIncreasePercent =
        oldCostPrice > 0
          ? ((newCostPrice - oldCostPrice) / oldCostPrice) * 100
          : 0;
      const shouldFlag = priceIncreasePercent > 20;

      // Update the product-supplier link
      await db
        .update(productSupplierLinks)
        .set({
          costPrice: String(newCostPrice),
          costCurrency: currentProduct.currency,
          convertedCostPrice: String(priceCalc.convertedCostPrice),
          markupAmount: String(priceCalc.markupAmount),
          displayPrice: String(priceCalc.displayPrice),
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(productSupplierLinks.id, link.id));

      // Update the product's display price
      await db
        .update(products)
        .set({
          price: String(priceCalc.displayPrice),
          ...(shouldFlag ? { isActive: false } : {}),
          updatedAt: new Date(),
        })
        .where(eq(products.id, link.productId));

      // Record price change in history
      await db.insert(supplierPriceHistory).values({
        productSupplierLinkId: link.id,
        oldCostPrice: String(oldCostPrice),
        newCostPrice: String(newCostPrice),
        oldDisplayPrice: link.displayPrice,
        newDisplayPrice: String(priceCalc.displayPrice),
      });

      result.updated++;
    } catch (err) {
      logger.error(`Error syncing price for product ${link.supplierProductId}`, { error: err instanceof Error ? err.message : 'Unknown error' });
      result.errors++;
    }
  }

  return result;
}
