import { db } from '@/db';
import { users, orders } from '@/db/schema';
import { sql, eq, or, ilike, desc, asc } from 'drizzle-orm';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  orderCount: number;
}

export interface UserWithOrders {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    createdAt: Date;
  }>;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get paginated list of users with search functionality
 * Validates: Requirements 26.1, 26.2
 */
export async function getUsers(params: GetUsersParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = search
    ? or(
        ilike(users.email, `%${search}%`),
        ilike(users.name, `%${search}%`)
      )
    : undefined;

  // Build order by
  const orderByColumn = sortBy === 'name' ? users.name : sortBy === 'email' ? users.email : users.createdAt;
  const orderByFn = sortOrder === 'asc' ? asc : desc;

  // Get users with order count
  const usersList = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      orderCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${orders}
        WHERE ${orders.userId} = ${users.id}
      )`,
    })
    .from(users)
    .where(whereConditions)
    .orderBy(orderByFn(orderByColumn))
    .limit(limit)
    .offset(offset);

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(whereConditions);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    users: usersList as UserListItem[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Get user details with order history
 * Validates: Requirements 26.3
 */
export async function getUserWithOrders(userId: string): Promise<UserWithOrders | null> {
  // Get user details
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length === 0) {
    return null;
  }

  const user = userResult[0];

  // Get user's orders
  const userOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    orders: userOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    })),
  };
}
