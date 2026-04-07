import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { headers } from 'next/headers';
import { hashPassword, verifyPassword } from '@/lib/password';
import { sendEmail } from '@/lib/email';

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
    requireEmailVerification: true,
    password: {
      hash: (password) => hashPassword(password),
      verify: ({ password, hash }) => verifyPassword(password, hash),
    },
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your Zivara account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a8a; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Zivara</h1>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="color: #0f1111; margin-bottom: 16px;">Verify your email</h2>
              <p style="color: #565959; line-height: 1.6;">
                Hi ${user.name || 'there'}, thanks for creating a Zivara account. Click the button below to verify your email address.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background: #1e3a8a; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Verify Email
                </a>
              </div>
              <p style="color: #888; font-size: 12px;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
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
