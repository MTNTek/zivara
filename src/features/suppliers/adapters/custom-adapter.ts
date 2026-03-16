import type {
  SupplierType,
  SupplierAdapter,
  AdapterResponse,
  SupplierProduct,
  SupplierOrderRequest,
  SupplierOrderResult,
  TrackingInfo,
  DecryptedCredential,
} from './types';

const TIMEOUT_MS = 30_000;

/**
 * Creates an AbortSignal that auto-aborts after the configured timeout.
 * Intended for use on all external calls in adapter methods.
 */
function createTimeoutSignal(): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), TIMEOUT_MS);
  return controller.signal;
}

/**
 * Custom adapter stub — a reference implementation of the SupplierAdapter interface.
 * Real custom adapters should extend or replace this with actual supplier API calls.
 */
export class CustomAdapter implements SupplierAdapter {
  readonly type: SupplierType = 'custom';

  async healthCheck(
    _credentials: DecryptedCredential[]
  ): Promise<AdapterResponse<{ healthy: boolean }>> {
    // Respect timeout even though this is a stub
    createTimeoutSignal();

    return {
      success: true,
      data: { healthy: true },
    };
  }

  async fetchProducts(
    _credentials: DecryptedCredential[],
    _options: { page?: number; limit?: number; query?: string }
  ): Promise<AdapterResponse<{ products: SupplierProduct[]; hasMore: boolean }>> {
    createTimeoutSignal();

    return {
      success: true,
      data: { products: [], hasMore: false },
    };
  }

  async fetchProductDetails(
    _credentials: DecryptedCredential[],
    _supplierProductId: string
  ): Promise<AdapterResponse<SupplierProduct>> {
    createTimeoutSignal();

    return {
      success: false,
      data: null,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'fetchProductDetails is not implemented for the custom adapter',
        retryable: false,
      },
    };
  }

  async checkInventory(
    _credentials: DecryptedCredential[],
    _supplierProductIds: string[]
  ): Promise<AdapterResponse<{ productId: string; inStock: boolean; quantity?: number }[]>> {
    createTimeoutSignal();

    return {
      success: true,
      data: [],
    };
  }

  async placeOrder(
    _credentials: DecryptedCredential[],
    _orders: SupplierOrderRequest[]
  ): Promise<AdapterResponse<SupplierOrderResult>> {
    createTimeoutSignal();

    return {
      success: false,
      data: null,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'placeOrder is not implemented for the custom adapter',
        retryable: false,
      },
    };
  }

  async getTrackingInfo(
    _credentials: DecryptedCredential[],
    _supplierOrderId: string
  ): Promise<AdapterResponse<TrackingInfo>> {
    createTimeoutSignal();

    return {
      success: false,
      data: null,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'getTrackingInfo is not implemented for the custom adapter',
        retryable: false,
      },
    };
  }
}
