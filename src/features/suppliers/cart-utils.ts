import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  cartItems,
  products,
  productSupplierLinks,
  suppliers,
} from '@/db/schema';

export interface CartItemWithSupplier {
  cartItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  supplierId?: string;
  supplierLabel?: string;
  supplierStatus?: string;
}

export interface SupplierCartGroup {
  supplierId: string;
  supplierLabel: string;
  items: CartItemWithSupplier[];
  subtotal: number;
}

export interface CheckoutValidation {
  validItems: CartItemWithSupplier[];
  unavailableItems: CartItemWithSupplier[];
  recalculatedTotal: number;
  errors: string[];
}

const PLATFORM_SUPPLIER_ID = 'platform';
const PLATFORM_SUPPLIER_LABEL = 'Platform';

/**
 * Group cart items by their primary supplier.
 * Items without a supplier link go into a "Platform" group.
 */
export function groupCartBySupplier(cartItems: CartItemWithSupplier[]): SupplierCartGroup[] {
  const groupMap = new Map<string, SupplierCartGroup>();

  for (const item of cartItems) {
    const supplierId = item.supplierId ?? PLATFORM_SUPPLIER_ID;
    const supplierLabel = item.supplierLabel ?? PLATFORM_SUPPLIER_LABEL;

    if (!groupMap.has(supplierId)) {
      groupMap.set(supplierId, {
        supplierId,
        supplierLabel,
        items: [],
        subtotal: 0,
      });
    }

    const group = groupMap.get(supplierId)!;
    group.items.push(item);
    group.subtotal = Math.round((group.subtotal + item.price * item.quantity) * 100) / 100;
  }

  return Array.from(groupMap.values());
}

/**
 * Validate checkout by checking supplier availability.
 * Removes unavailable items and recalculates totals.
 */
export async function validateCheckout(cartItems: CartItemWithSupplier[]): Promise<CheckoutValidation> {
  const validItems: CartItemWithSupplier[] = [];
  const unavailableItems: CartItemWithSupplier[] = [];
  const errors: string[] = [];

  for (const item of cartItems) {
    if (item.supplierStatus === 'unavailable') {
      unavailableItems.push(item);
      errors.push(
        `"${item.productName}" is unavailable because the supplier "${item.supplierLabel ?? 'Unknown'}" is currently unavailable. Please remove it from your cart.`
      );
    } else {
      validItems.push(item);
    }
  }

  const recalculatedTotal = validItems.reduce(
    (total, item) => Math.round((total + item.price * item.quantity) * 100) / 100,
    0
  );

  return {
    validItems,
    unavailableItems,
    recalculatedTotal,
    errors,
  };
}

/**
 * Fetch cart items enriched with primary supplier info.
 * Joins cartItems with products, productSupplierLinks (isPrimary = true), and suppliers.
 */
export async function getCartItemsWithSupplier(
  userId?: string,
  sessionId?: string
): Promise<CartItemWithSupplier[]> {
  if (!userId && !sessionId) {
    return [];
  }

  // Build the where condition based on userId or sessionId
  const whereCondition = userId
    ? eq(cartItems.userId, userId)
    : eq(cartItems.sessionId, sessionId!);

  // Fetch cart items with product info
  const rows = await db
    .select({
      cartItemId: cartItems.id,
      productId: cartItems.productId,
      productName: products.name,
      quantity: cartItems.quantity,
      price: cartItems.priceAtAdd,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(whereCondition);

  // Enrich each cart item with primary supplier info
  const enrichedItems: CartItemWithSupplier[] = [];

  for (const row of rows) {
    // Look up the primary supplier link for this product
    const [link] = await db
      .select({
        supplierId: productSupplierLinks.supplierId,
      })
      .from(productSupplierLinks)
      .where(
        and(
          eq(productSupplierLinks.productId, row.productId),
          eq(productSupplierLinks.isPrimary, true)
        )
      )
      .limit(1);

    let supplierId: string | undefined;
    let supplierLabel: string | undefined;
    let supplierStatus: string | undefined;

    if (link) {
      const [supplier] = await db
        .select({
          id: suppliers.id,
          displayLabel: suppliers.displayLabel,
          name: suppliers.name,
          status: suppliers.status,
        })
        .from(suppliers)
        .where(eq(suppliers.id, link.supplierId))
        .limit(1);

      if (supplier) {
        supplierId = supplier.id;
        supplierLabel = supplier.displayLabel ?? supplier.name;
        supplierStatus = supplier.status;
      }
    }

    enrichedItems.push({
      cartItemId: row.cartItemId,
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      price: Number(row.price),
      supplierId,
      supplierLabel,
      supplierStatus,
    });
  }

  return enrichedItems;
}
