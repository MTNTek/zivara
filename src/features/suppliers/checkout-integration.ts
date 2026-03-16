import { routeOrder } from './order-router';

/**
 * Process an order through the supplier routing system.
 * This function is meant to be called after the existing checkout creates the order.
 * It splits the order into sub-orders by supplier and forwards them.
 */
export async function processOrderWithRouting(
  orderId: string
): Promise<{ success: boolean; subOrderCount: number; errors: string[] }> {
  try {
    const result = await routeOrder(orderId);

    const errors = result.errors.map(
      (e) => `Supplier ${e.supplierId}: ${e.error}`
    );

    return {
      success: result.errors.length === 0,
      subOrderCount: result.subOrders.length,
      errors,
    };
  } catch (err) {
    return {
      success: false,
      subOrderCount: 0,
      errors: [err instanceof Error ? err.message : 'Unknown error during order routing'],
    };
  }
}
