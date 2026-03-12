/**
 * Rate limiting middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkApiRateLimitUnauthenticated,
  checkApiRateLimitAuthenticated,
  getClientIp,
  logRateLimitViolation,
} from './security';
import { auth } from './auth';

/**
 * Apply rate limiting to API routes
 * Returns null if rate limit is not exceeded, otherwise returns a 429 response
 */
export async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp();

  // Check if user is authenticated via Better Auth session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  let rateLimitResult;

  if (session?.user?.id) {
    // Authenticated user - 1000 req/15min
    // Skip rate limiting for admin users
    if (session.user.role === 'admin') {
      return null;
    }

    rateLimitResult = await checkApiRateLimitAuthenticated(session.user.id);
  } else {
    // Unauthenticated user - 100 req/15min
    rateLimitResult = await checkApiRateLimitUnauthenticated(ip);
  }

  // Add rate limit headers to response
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', session?.user?.id ? '1000' : '100');
  headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString());

  if (!rateLimitResult.success) {
    // Log the violation
    await logRateLimitViolation(
      session?.user?.id ? session.user.id : ip,
      'api',
      ip
    );

    // Calculate retry-after in seconds
    const retryAfter = Math.ceil(
      (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
    );

    headers.set('Retry-After', retryAfter.toString());

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
      },
      {
        status: 429,
        headers,
      }
    );
  }

  return null;
}

/**
 * Wrapper function to apply rate limiting to API route handlers
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Continue to handler
    return handler(request);
  };
}
