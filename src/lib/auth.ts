import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Require authentication for a server action or API route
 * @throws Error if user is not authenticated
 * @returns The authenticated session
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: Authentication required');
  }
  return session;
}

/**
 * Require admin role for a server action or API route
 * @throws Error if user is not authenticated or not an admin
 * @returns The authenticated admin session
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return session;
}

/**
 * Get the current session if available
 * @returns The session or null if not authenticated
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Check if the current user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Check if the current user is an admin
 * @returns True if user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

/**
 * Check if the current user has a specific role
 * @param role - The role to check
 * @returns True if user has the role, false otherwise
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === role;
}

/**
 * Get the current user ID
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}
