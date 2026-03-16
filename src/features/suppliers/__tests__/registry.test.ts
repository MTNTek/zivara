import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupplierAdapter, SupplierType, DecryptedCredential, AdapterResponse } from '../adapters/types';

// Mock db and credentials before importing registry
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../credentials', () => ({
  getDecryptedCredentials: vi.fn(),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
}));

vi.mock('@/db/schema', () => ({
  suppliers: { id: 'id', status: 'status', consecutiveFailures: 'consecutiveFailures' },
}));

import { SupplierRegistry } from '../registry';
import { db } from '@/db';
import { getDecryptedCredentials } from '../credentials';

function createMockAdapter(type: SupplierType, healthResult?: AdapterResponse<{ healthy: boolean }>): SupplierAdapter {
  return {
    type,
    healthCheck: vi.fn().mockResolvedValue(healthResult ?? { success: true, data: { healthy: true } }),
    fetchProducts: vi.fn(),
    fetchProductDetails: vi.fn(),
    checkInventory: vi.fn(),
    placeOrder: vi.fn(),
    getTrackingInfo: vi.fn(),
  };
}

function mockDbSelect(rows: Record<string, unknown>[]) {
  const chain = {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(rows),
      }),
    }),
  };
  (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
}

function mockDbUpdate() {
  const chain = {
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  };
  (db.update as ReturnType<typeof vi.fn>).mockReturnValue(chain);
}

describe('SupplierRegistry', () => {
  let registry: SupplierRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new SupplierRegistry();
  });

  describe('register / getAdapter / hasAdapter', () => {
    it('should register and retrieve an adapter by type', () => {
      const adapter = createMockAdapter('amazon');
      registry.register(adapter);

      expect(registry.hasAdapter('amazon')).toBe(true);
      expect(registry.getAdapter('amazon')).toBe(adapter);
    });

    it('should return undefined for unregistered type', () => {
      expect(registry.hasAdapter('noon')).toBe(false);
      expect(registry.getAdapter('noon')).toBeUndefined();
    });

    it('should overwrite a previously registered adapter for the same type', () => {
      const first = createMockAdapter('custom');
      const second = createMockAdapter('custom');
      registry.register(first);
      registry.register(second);

      expect(registry.getAdapter('custom')).toBe(second);
    });
  });

  describe('verifyConnectivity', () => {
    it('should return healthy:false when supplier not found', async () => {
      mockDbSelect([]);

      const result = await registry.verifyConnectivity('non-existent-id');

      expect(result.healthy).toBe(false);
      expect(result.error).toContain('Supplier not found');
    });

    it('should return healthy:false when no adapter registered for type', async () => {
      mockDbSelect([{ id: 's1', type: 'amazon', consecutiveFailures: 0 }]);

      const result = await registry.verifyConnectivity('s1');

      expect(result.healthy).toBe(false);
      expect(result.error).toContain('No adapter registered');
    });

    it('should return healthy:true and reset failures on success', async () => {
      const adapter = createMockAdapter('amazon', {
        success: true,
        data: { healthy: true },
      });
      registry.register(adapter);

      mockDbSelect([{ id: 's1', type: 'amazon', consecutiveFailures: 2 }]);
      mockDbUpdate();
      (getDecryptedCredentials as ReturnType<typeof vi.fn>).mockResolvedValue([
        { type: 'api_key', value: 'test-key' },
      ]);

      const result = await registry.verifyConnectivity('s1');

      expect(result.healthy).toBe(true);
      expect(result.error).toBeUndefined();
      expect(db.update).toHaveBeenCalled();
    });

    it('should set status to error on first failure', async () => {
      const adapter = createMockAdapter('amazon', {
        success: false,
        data: null,
        error: { code: 'CONN_ERR', message: 'Connection refused', retryable: true },
      });
      registry.register(adapter);

      mockDbSelect([{ id: 's1', type: 'amazon', consecutiveFailures: 0 }]);
      mockDbUpdate();
      (getDecryptedCredentials as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await registry.verifyConnectivity('s1');

      expect(result.healthy).toBe(false);
      expect(result.error).toBe('Connection refused');
    });

    it('should set status to unavailable after 3 consecutive failures (>=3)', async () => {
      const adapter = createMockAdapter('amazon', {
        success: false,
        data: null,
        error: { code: 'TIMEOUT', message: 'Timed out', retryable: true },
      });
      registry.register(adapter);

      // Already at 2 failures, this will be the 3rd
      mockDbSelect([{ id: 's1', type: 'amazon', consecutiveFailures: 2 }]);
      mockDbUpdate();
      (getDecryptedCredentials as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await registry.verifyConnectivity('s1');

      expect(result.healthy).toBe(false);
      // Verify the update was called — the status should be 'unavailable'
      const updateCall = (db.update as ReturnType<typeof vi.fn>).mock.results[0].value;
      const setCall = updateCall.set.mock.calls[0][0];
      expect(setCall.status).toBe('unavailable');
      expect(setCall.consecutiveFailures).toBe(3);
    });

    it('should handle exceptions from getDecryptedCredentials', async () => {
      const adapter = createMockAdapter('amazon');
      registry.register(adapter);

      mockDbSelect([{ id: 's1', type: 'amazon', consecutiveFailures: 0 }]);
      mockDbUpdate();
      (getDecryptedCredentials as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Decryption failed')
      );

      const result = await registry.verifyConnectivity('s1');

      expect(result.healthy).toBe(false);
      expect(result.error).toBe('Decryption failed');
    });
  });
});
