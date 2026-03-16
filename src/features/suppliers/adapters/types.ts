// src/features/suppliers/adapters/types.ts

export type SupplierType = 'amazon' | 'noon' | 'trendyol' | 'aliexpress' | 'cj_dropshipping' | 'custom';

export interface AdapterResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface SupplierProduct {
  supplierProductId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: { url: string; alt?: string }[];
  category?: string;
  inStock: boolean;
  stockQuantity?: number;
  productUrl: string;
}

export interface SupplierOrderRequest {
  supplierProductId: string;
  quantity: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface SupplierOrderResult {
  supplierOrderId: string;
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
  carrierName?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrierName: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  statusTimestamp: Date;
  events: {
    status: string;
    description: string;
    timestamp: Date;
    location?: string;
  }[];
}

export interface DecryptedCredential {
  type: 'api_key' | 'oauth_token' | 'affiliate_id';
  value: string;
}

export interface SupplierAdapter {
  readonly type: SupplierType;

  healthCheck(credentials: DecryptedCredential[]): Promise<AdapterResponse<{ healthy: boolean }>>;

  fetchProducts(
    credentials: DecryptedCredential[],
    options: { page?: number; limit?: number; query?: string }
  ): Promise<AdapterResponse<{ products: SupplierProduct[]; hasMore: boolean }>>;

  fetchProductDetails(
    credentials: DecryptedCredential[],
    supplierProductId: string
  ): Promise<AdapterResponse<SupplierProduct>>;

  checkInventory(
    credentials: DecryptedCredential[],
    supplierProductIds: string[]
  ): Promise<AdapterResponse<{ productId: string; inStock: boolean; quantity?: number }[]>>;

  placeOrder(
    credentials: DecryptedCredential[],
    orders: SupplierOrderRequest[]
  ): Promise<AdapterResponse<SupplierOrderResult>>;

  getTrackingInfo(
    credentials: DecryptedCredential[],
    supplierOrderId: string
  ): Promise<AdapterResponse<TrackingInfo>>;
}
