'use server';

import { eq, and, ne, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { suppliers, supplierCredentials, products, productSupplierLinks } from '@/db/schema';
import type { SupplierType } from './adapters/types';
import { SupplierRegistry } from './registry';
import { encryptCredential } from './credentials';
import { scheduleSyncJob } from './sync-scheduler';

const SUPPORTED_TYPES: SupplierType[] = [
  'amazon',
  'noon',
  'trendyol',
  'aliexpress',
  'cj_dropshipping',
  'custom',
];

export async function createSupplier(data: {
  name: string;
  type: SupplierType;
  baseUrl?: string;
  currency: string;
  displayLabel?: string;
}): Promise<{ success: boolean; supplierId?: string; error?: string }> {
  try {
    // Validate supported type
    if (!SUPPORTED_TYPES.includes(data.type)) {
      return { success: false, error: `Unsupported supplier type: ${data.type}` };
    }

    // Validate unique name
    const [existing] = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.name, data.name))
      .limit(1);

    if (existing) {
      return { success: false, error: `A supplier with the name "${data.name}" already exists` };
    }

    const [supplier] = await db
      .insert(suppliers)
      .values({
        name: data.name,
        type: data.type,
        baseUrl: data.baseUrl,
        currency: data.currency,
        displayLabel: data.displayLabel,
        status: 'inactive',
      })
      .returning({ id: suppliers.id });

    revalidatePath('/admin/suppliers');
    return { success: true, supplierId: supplier.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateSupplier(
  supplierId: string,
  data: Partial<{ name: string; displayLabel: string; baseUrl: string; currency: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // If name is being updated, check uniqueness
    if (data.name) {
      const [existing] = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.name, data.name))
        .limit(1);

      if (existing && existing.id !== supplierId) {
        return { success: false, error: `A supplier with the name "${data.name}" already exists` };
      }
    }

    await db
      .update(suppliers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId));

    revalidatePath('/admin/suppliers');
    revalidatePath(`/admin/suppliers/${supplierId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function activateSupplier(
  supplierId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const registry = new SupplierRegistry();
    const result = await registry.verifyConnectivity(supplierId);

    if (result.healthy) {
      // verifyConnectivity already sets status to 'active' on success
      // Restore visibility for products linked to this supplier
      const linkedProducts = await db
        .select({ productId: productSupplierLinks.productId })
        .from(productSupplierLinks)
        .where(eq(productSupplierLinks.supplierId, supplierId));

      const productIds = linkedProducts.map((lp) => lp.productId);
      if (productIds.length > 0) {
        await db
          .update(products)
          .set({ isActive: true })
          .where(inArray(products.id, productIds));
      }

      revalidatePath('/admin/suppliers');
      revalidatePath(`/admin/suppliers/${supplierId}`);
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function deactivateSupplier(
  supplierId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(suppliers)
      .set({
        status: 'inactive',
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId));

    // Hide products sourced exclusively from this supplier
    // Find products linked to this supplier
    const linkedProducts = await db
      .select({ productId: productSupplierLinks.productId })
      .from(productSupplierLinks)
      .where(eq(productSupplierLinks.supplierId, supplierId));

    const productIds = linkedProducts.map((lp) => lp.productId);

    if (productIds.length > 0) {
      // Find products that have other active supplier links
      const productsWithOtherSuppliers = await db
        .select({ productId: productSupplierLinks.productId })
        .from(productSupplierLinks)
        .innerJoin(suppliers, eq(productSupplierLinks.supplierId, suppliers.id))
        .where(
          and(
            inArray(productSupplierLinks.productId, productIds),
            ne(productSupplierLinks.supplierId, supplierId),
            eq(suppliers.status, 'active')
          )
        );

      const safeProductIds = new Set(productsWithOtherSuppliers.map((p) => p.productId));
      const exclusiveProductIds = productIds.filter((pid) => !safeProductIds.has(pid));

      if (exclusiveProductIds.length > 0) {
        await db
          .update(products)
          .set({ isActive: false })
          .where(inArray(products.id, exclusiveProductIds));
      }
    }

    revalidatePath('/admin/suppliers');
    revalidatePath(`/admin/suppliers/${supplierId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function saveCredential(
  supplierId: string,
  credentialType: string,
  value: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const encryptionKey = process.env.SUPPLIER_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return { success: false, error: 'SUPPLIER_ENCRYPTION_KEY environment variable is not set' };
    }

    const encryptedValue = encryptCredential(value, encryptionKey);

    // Check if credential of this type already exists for the supplier
    const allCreds = await db
      .select()
      .from(supplierCredentials)
      .where(eq(supplierCredentials.supplierId, supplierId));

    const existingCred = allCreds.find((c) => c.credentialType === credentialType);

    if (existingCred) {
      await db
        .update(supplierCredentials)
        .set({
          encryptedValue,
          updatedAt: new Date(),
        })
        .where(eq(supplierCredentials.id, existingCred.id));
    } else {
      await db
        .insert(supplierCredentials)
        .values({
          supplierId,
          credentialType,
          encryptedValue,
        });
    }

    revalidatePath(`/admin/suppliers/${supplierId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function triggerHealthCheck(
  supplierId: string
): Promise<{ healthy: boolean; error?: string }> {
  try {
    const registry = new SupplierRegistry();
    const result = await registry.verifyConnectivity(supplierId);

    revalidatePath('/admin/suppliers');
    revalidatePath(`/admin/suppliers/${supplierId}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { healthy: false, error: message };
  }
}

export async function triggerSync(
  supplierId: string,
  jobType: 'inventory' | 'price'
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const jobId = await scheduleSyncJob(supplierId, jobType);

    revalidatePath('/admin/suppliers');
    revalidatePath(`/admin/suppliers/${supplierId}`);
    revalidatePath('/admin/sync-jobs');
    return { success: true, jobId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
