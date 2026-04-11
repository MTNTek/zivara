'use server';

import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and, gte, lte, like } from 'drizzle-orm';
import { logger } from '@/lib/logger';

interface OrderExportItem {
  productName: string;
  quantity: number;
}

interface OrderExportData {
  orderNumber: string;
  createdAt: Date;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  guestEmail: string | null;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  paymentMethod: string;
  lastFourDigits: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  trackingNumber: string | null;
  carrierName: string | null;
  estimatedDeliveryDate: Date | null;
  items: OrderExportItem[];
}

/**
 * Generate CSV content from orders data
 * Validates: Requirement 21.6
 */
function generateOrdersCSV(ordersData: OrderExportData[]): string {
  // CSV Headers
  const headers = [
    'Order Number',
    'Order Date',
    'Status',
    'Customer Name',
    'Customer Email',
    'Subtotal',
    'Tax',
    'Shipping',
    'Total',
    'Payment Method',
    'Card Last 4',
    'Shipping Address Line 1',
    'Shipping Address Line 2',
    'Shipping City',
    'Shipping State',
    'Shipping Postal Code',
    'Shipping Country',
    'Tracking Number',
    'Carrier Name',
    'Estimated Delivery',
    'Items',
  ];

  // Escape CSV field
  const escapeCSV = (field: unknown): string => {
    if (field === null || field === undefined) {
      return '';
    }
    const str = String(field);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows
  const rows = ordersData.map((order) => {
    // Format items as a string
    const itemsStr = order.items
      .map((item) => `${item.productName} (x${item.quantity})`)
      .join('; ');

    return [
      escapeCSV(order.orderNumber),
      escapeCSV(new Date(order.createdAt).toISOString()),
      escapeCSV(order.status),
      escapeCSV(order.customerName || 'Guest'),
      escapeCSV(order.customerEmail || order.guestEmail),
      escapeCSV(order.subtotal),
      escapeCSV(order.tax),
      escapeCSV(order.shipping),
      escapeCSV(order.total),
      escapeCSV(order.paymentMethod),
      escapeCSV(order.lastFourDigits || ''),
      escapeCSV(order.shippingAddressLine1),
      escapeCSV(order.shippingAddressLine2 || ''),
      escapeCSV(order.shippingCity),
      escapeCSV(order.shippingState),
      escapeCSV(order.shippingPostalCode),
      escapeCSV(order.shippingCountry),
      escapeCSV(order.trackingNumber || ''),
      escapeCSV(order.carrierName || ''),
      escapeCSV(order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString() : ''),
      escapeCSV(itemsStr),
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export orders to CSV with filters
 * Validates: Requirement 21.6
 * 
 * @param filters - Optional filters for orders
 * @returns CSV content as string
 */
export async function exportOrdersToCSV(filters?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  orderNumber?: string;
}) {
  try {
    // Build where conditions
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(orders.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(orders.createdAt, filters.endDate));
    }
    
    if (filters?.userId) {
      conditions.push(eq(orders.userId, filters.userId));
    }
    
    if (filters?.orderNumber) {
      conditions.push(like(orders.orderNumber, `%${filters.orderNumber}%`));
    }

    const whereClause = conditions.length > 0 
      ? (conditions.length > 1 ? and(...conditions) : conditions[0])
      : undefined;

    // Get orders with items and user info
    const ordersData = await db.query.orders.findMany({
      where: whereClause,
      with: {
        items: true,
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit: 10000, // Limit to prevent memory issues
    });

    // Transform data for CSV
    const transformedData = ordersData.map((order) => ({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      customerName: order.user?.name || null,
      customerEmail: order.user?.email || null,
      guestEmail: order.guestEmail,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      lastFourDigits: order.lastFourDigits,
      shippingAddressLine1: order.shippingAddressLine1,
      shippingAddressLine2: order.shippingAddressLine2,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry,
      trackingNumber: order.trackingNumber,
      carrierName: order.carrierName,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      items: order.items,
    }));

    // Generate CSV
    const csv = generateOrdersCSV(transformedData);

    return {
      success: true,
      data: csv,
      count: ordersData.length,
    };
  } catch (error) {
    logger.error('Error exporting orders to CSV', { error: error instanceof Error ? error.message : String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export orders',
    };
  }
}
