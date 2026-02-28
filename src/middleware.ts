import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === 'admin';
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    // Protect admin routes - redirect non-admins to home
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // CSRF Protection for state-changing operations (Requirement 19.5)
    // Next.js Server Actions have built-in CSRF protection via origin checking
    // This adds protection for API routes
    const method = req.method;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host');
      
      // Allow requests without origin header (same-origin requests from Server Actions)
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
        } catch (error) {
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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes require authentication
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
  ],
};
