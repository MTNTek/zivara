import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc, and, or, gte, lte, like, sql, asc } from 'drizzle-orm';

/**
 * Get all orders for a user with pagination
 * Validates: Requirements 7.1, 12.1-12.5
 * 
 * @param userId - User ID
 * @param options - Pagination and filtering options
 * @returns List of orders with pagination metadata
 */
export async function getUserOrders(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(orders.userId, userId)];
    
    if (options?.status) {
      conditions.push(eq(orders.status, options.status));
    }
    
    if (options?.startDate) {
      conditions.push(gte(orders.createdAt, options.startDate));
    }
    
    if (options?.endDate) {
      conditions.push(lte(orders.createdAt, options.endDate));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get orders with pagination
    const userOrders = await db.query.orders.findMany({
      where: whereClause,
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
      with: {
        items: true,
      },
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(whereClause);

    return {
      orders: userOrders,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      orders: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get order by ID with full details
 * Validates: Requirement 7.5
 * 
 * @param orderId - Order ID
 * @returns Order with items and status history
 */
export async function getOrderById(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: {
              with: {
                images: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: (statusHistory: any, { desc }: any) => [desc(statusHistory.createdAt)],
        },
      },
    });

    return order || null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get order by order number (for tracking)
 * Validates: Requirement 23.4, 23.5
 * 
 * @param orderNumber - Order number
 * @returns Order with items and status history
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        statusHistory: {
          orderBy: (statusHistory: any, { desc }: any) => [desc(statusHistory.createdAt)],
        },
      },
    });

    return order || null;
  } catch (error) {
    console.error('Error fetching order by number:', error);
    return null;
  }
}

/**
 * Get all orders with filtering, search, and pagination (admin only)
 * Validates: Requirements 12.1-12.5
 * 
 * @param options - Filtering, search, and pagination options
 * @returns List of all orders with pagination metadata
 */
export async function getAllOrders(options?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  orderNumber?: string;
  sortBy?: 'date' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (options?.status) {
      conditions.push(eq(orders.status, options.status));
    }
    
    if (options?.startDate) {
      conditions.push(gte(orders.createdAt, options.startDate));
    }
    
    if (options?.endDate) {
      conditions.push(lte(orders.createdAt, options.endDate));
    }
    
    if (options?.userId) {
      conditions.push(eq(orders.userId, options.userId));
    }
    
    if (options?.orderNumber) {
      conditions.push(like(orders.orderNumber, `%${options.orderNumber}%`));
    }

    const whereClause = conditions.length > 0 
      ? (conditions.length > 1 ? and(...conditions) : conditions[0])
      : undefined;

    // Determine sort order
    let orderByClause;
    const sortOrder = options?.sortOrder || 'desc';
    
    switch (options?.sortBy) {
      case 'total':
        orderByClause = sortOrder === 'asc' ? [asc(orders.total)] : [desc(orders.total)];
        break;
      case 'status':
        orderByClause = sortOrder === 'asc' ? [asc(orders.status)] : [desc(orders.status)];
        break;
      case 'date':
      default:
        orderByClause = sortOrder === 'asc' ? [asc(orders.createdAt)] : [desc(orders.createdAt)];
        break;
    }

    // Get orders with pagination
    const allOrders = await db.query.orders.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit,
      offset,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get total count
    const countQuery = whereClause
      ? db.select({ count: sql<number>`count(*)::int` }).from(orders).where(whereClause)
      : db.select({ count: sql<number>`count(*)::int` }).from(orders);
    
    const [{ count }] = await countQuery;

    return {
      orders: allOrders,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return {
      orders: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Search orders by order number (admin only)
 * Validates: Requirement 12.1
 * 
 * @param orderNumber - Order number to search for
 * @returns List of matching orders
 */
export async function searchOrdersByNumber(orderNumber: string) {
  try {
    const matchingOrders = await db.query.orders.findMany({
      where: like(orders.orderNumber, `%${orderNumber}%`),
      orderBy: [desc(orders.createdAt)],
      limit: 50,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return matchingOrders;
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
}
