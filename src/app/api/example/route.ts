/**
 * Example API route demonstrating rate limiting, CSRF protection, and error handling
 * This file serves as a template for creating secure API routes
 * 
 * Requirements: 18.1, 18.2, 19.5, 34.1-34.7
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit-middleware';
import { requireCsrfProtection } from '@/lib/security';
import { handleError } from '@/lib/error-handler';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * GET endpoint - demonstrates rate limiting and error handling
 * Rate limits:
 * - Unauthenticated: 100 req/15min per IP
 * - Authenticated: 1000 req/15min per user
 * - Admin: No limit
 */
export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    logger.info('Example GET endpoint called', {
      url: request.url,
      method: request.method,
    });

    // Your API logic here
    const data = {
      message: 'This endpoint is protected by rate limiting',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    // Log error with appropriate severity (Requirement 18.1)
    logger.error('Example GET endpoint error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    // Handle error and return user-friendly message (Requirement 18.2)
    const errorResponse = handleError(error);
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
});

/**
 * POST endpoint - demonstrates rate limiting, CSRF protection, and error handling
 * CSRF protection is automatically applied by middleware for state-changing operations
 */
export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // CSRF protection is handled by middleware (Requirement 19.5)
    requireCsrfProtection(request);

    const body = await request.json();

    logger.info('Example POST endpoint called', {
      url: request.url,
      method: request.method,
      hasBody: !!body,
    });

    // Your API logic here
    const data = {
      message: 'Data received successfully',
      received: body,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    // Handle CSRF validation errors
    if (error instanceof Error && error.message.includes('CSRF')) {
      logger.warn('CSRF validation failed', {
        url: request.url,
        error: error.message,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'CSRF validation failed. Please refresh and try again.',
          },
        },
        { status: 403 }
      );
    }

    // Log error with appropriate severity (Requirement 18.1)
    logger.error('Example POST endpoint error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    // Handle error and return user-friendly message (Requirement 18.2)
    const errorResponse = handleError(error);
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
});
