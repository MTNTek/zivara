import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkEdgeRateLimit } from '@/lib/edge-rate-limit';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API rate limiting ──────────────────────────────────────────────
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/')) {
    const ip = getClientIp(req);
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ||
      req.cookies.get('__Secure-better-auth.session_token');
    const isAuthed = !!sessionCookie?.value;

    // Auth endpoints get stricter limits: 20 req / 15 min
    const isAuthEndpoint = pathname.startsWith('/api/auth/');
    const key = isAuthEndpoint
      ? `auth:${ip}`
      : isAuthed
        ? `api:authed:${sessionCookie!.value.slice(0, 16)}`
        : `api:unauth:${ip}`;
    const max = isAuthEndpoint ? 20 : isAuthed ? 1000 : 100;
    const windowMs = 15 * 60 * 1000;

    const { allowed, remaining, retryAfterMs } = checkEdgeRateLimit(key, max, windowMs);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(retryAfterMs / 1000),
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // For API routes, add rate limit headers and continue
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  }

  // ── Protected page routes — auth check ─────────────────────────────
  const sessionCookie =
    req.cookies.get('better-auth.session_token') ||
    req.cookies.get('__Secure-better-auth.session_token');
  const isAuthenticated = !!sessionCookie?.value;

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── CSRF protection for state-changing requests ────────────────────
  const method = req.method;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { success: false, error: { code: 'CSRF_VALIDATION_FAILED', message: 'CSRF validation failed' } },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ORIGIN', message: 'Invalid origin header' } },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected pages
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/wishlist/:path*',
    // API routes (for rate limiting)
    '/api/:path*',
  ],
};
