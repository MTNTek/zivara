import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  // Optimistic session check via cookie presence
  // The actual session validation happens server-side in auth helpers (requireAuth, requireAdmin)
  const sessionCookie = req.cookies.get('better-auth.session_token')
    || req.cookies.get('__Secure-better-auth.session_token');

  const isAuthenticated = !!sessionCookie?.value;
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, we can't check the role from the cookie alone
  // The actual admin check happens in requireAdmin() on the server side
  // This is the recommended pattern: optimistic check in middleware, real check on the page

  // CSRF Protection for state-changing operations
  const method = req.method;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'CSRF_VALIDATION_FAILED',
                message: 'CSRF validation failed',
              },
            },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_ORIGIN',
              message: 'Invalid origin header',
            },
          },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

// Specify which routes require authentication
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
  ],
};
