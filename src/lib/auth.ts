import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { headers } from 'next/headers';
import { hashPassword, verifyPassword } from '@/lib/password';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  advanced: {
    database: {
      generateId: false, // Let PostgreSQL generate UUIDs via gen_random_uuid()
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: (password) => hashPassword(password),
      verify: ({ password, hash }) => verifyPassword(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // 1 hour
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    modelName: 'users',
    additionalFields: {
      passwordHash: {
        type: 'string',
        required: false,
        fieldName: 'passwordHash',
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'customer',
        fieldName: 'role',
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        fieldName: 'isActive',
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'customer',
      adminRoles: ['admin'],
    }),
  ],
});

// Server-side session helpers

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

/**
 * Get the current session if available
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require authentication for a server action or API route
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: Authentication required');
  }
  return session;
}

/**
 * Require admin role for a server action or API route
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return session;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === role;
}

/**
 * Get the current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}
