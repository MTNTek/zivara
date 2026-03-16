import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { suppliers } from '@/db/schema';
import type { SupplierType, SupplierAdapter } from './adapters/types';
import { getDecryptedCredentials } from './credentials';

export class SupplierRegistry {
  private adapters: Map<SupplierType, SupplierAdapter>;

  constructor() {
    this.adapters = new Map();
  }

  register(adapter: SupplierAdapter): void {
    this.adapters.set(adapter.type, adapter);
  }

  getAdapter(type: SupplierType): SupplierAdapter | undefined {
    return this.adapters.get(type);
  }

  hasAdapter(type: SupplierType): boolean {
    return this.adapters.has(type);
  }

  async verifyConnectivity(
    supplierId: string
  ): Promise<{ healthy: boolean; error?: string }> {
    // Fetch the supplier record from DB
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId))
      .limit(1);

    if (!supplier) {
      return { healthy: false, error: `Supplier not found: ${supplierId}` };
    }

    const adapter = this.getAdapter(supplier.type as SupplierType);
    if (!adapter) {
      return {
        healthy: false,
        error: `No adapter registered for supplier type: ${supplier.type}`,
      };
    }

    try {
      // Decrypt credentials
      const credentials = await getDecryptedCredentials(supplierId);

      // Call adapter health check
      const result = await adapter.healthCheck(credentials);

      if (result.success && result.data?.healthy) {
        // Success: reset failures, set active
        await db
          .update(suppliers)
          .set({
            status: 'active',
            consecutiveFailures: 0,
            lastHealthCheck: new Date(),
            lastError: null,
            updatedAt: new Date(),
          })
          .where(eq(suppliers.id, supplierId));

        return { healthy: true };
      }

      // Health check returned failure
      const errorMessage =
        result.error?.message ?? 'Health check returned unhealthy';
      return await this.handleFailure(supplierId, supplier.consecutiveFailures, errorMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error during health check';
      return await this.handleFailure(supplierId, supplier.consecutiveFailures, errorMessage);
    }
  }

  private async handleFailure(
    supplierId: string,
    currentFailures: number,
    errorMessage: string
  ): Promise<{ healthy: boolean; error: string }> {
    const newFailures = currentFailures + 1;
    const status = newFailures >= 3 ? 'unavailable' : 'error';

    await db
      .update(suppliers)
      .set({
        status,
        consecutiveFailures: newFailures,
        lastHealthCheck: new Date(),
        lastError: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId));

    return { healthy: false, error: errorMessage };
  }
}
