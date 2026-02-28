import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/password';
import { checkAuthRateLimit, getClientIp } from '@/lib/security';
import { logAuthAttempt, logRateLimitViolation } from '@/lib/audit';
import { logger } from '@/lib/logger';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.warn('Authentication attempt with missing credentials');
            return null;
          }

          // Rate limiting: 5 attempts per 15 minutes per IP (Requirement 19.6)
          const ip = getClientIp();
          const rateLimitResult = await checkAuthRateLimit(ip);
          
          if (!rateLimitResult.success) {
            // Log rate limit violation (Requirement 19.7, 34.7)
            logger.warn('Authentication rate limit exceeded', {
              ip,
              email: credentials.email,
            });
            await logRateLimitViolation('auth', ip, credentials.email);
            
            // Return null to prevent login
            // NextAuth will handle this as a failed login attempt
            return null;
          }

          // Find user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (!user || !user.isActive) {
            // Log failed authentication attempt (Requirement 18.4)
            logger.logAuthAttempt(false, credentials.email, { ip });
            await logAuthAttempt(credentials.email, false, ip);
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            // Log failed authentication attempt (Requirement 18.4)
            logger.logAuthAttempt(false, credentials.email, { ip, userId: user.id });
            await logAuthAttempt(credentials.email, false, ip, undefined, user.id);
            return null;
          }

          // Log successful authentication attempt (Requirement 18.4)
          logger.logAuthAttempt(true, credentials.email, { ip, userId: user.id });
          await logAuthAttempt(credentials.email, true, ip, undefined, user.id);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          // Log authentication error (Requirement 18.1)
          logger.error('Authentication error', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            email: credentials?.email,
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
