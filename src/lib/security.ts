/**
 * Security utilities for CSRF protection, input sanitization, and rate limiting
 */

import { headers } from 'next/headers';
import { logRateLimitViolation as logRateLimit } from '@/lib/audit';

// ============================================================================
// CSRF Protection
// ============================================================================

/**
 * Verify CSRF token for state-changing operations
 * Next.js Server Actions have built-in CSRF protection via origin checking
 * This function provides additional validation for API routes
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const host = headersList.get('host');
  
  // Check if origin matches host (same-origin policy)
  if (!origin || !host) {
    return false;
  }
  
  const originUrl = new URL(origin);
  return originUrl.host === host;
}

/**
 * Middleware helper to enforce CSRF protection on API routes
 */
export async function requireCsrfProtection(request: Request): Promise<void> {
  const method = request.method;
  
  // Only check state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const headersList = await headers();
    const origin = headersList.get('origin');
    const host = headersList.get('host');
    
    if (!origin || !host) {
      throw new Error('CSRF validation failed: Missing origin or host header');
    }
    
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      throw new Error('CSRF validation failed: Origin mismatch');
    }
  }
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize string input to prevent SQL injection
 * Note: Drizzle ORM provides parameterized queries which prevent SQL injection
 * This is an additional layer of defense for raw SQL queries
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email).toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
}

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * In-memory rate limit store (for development)
 * In production, use Redis or similar distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60000);
}

/**
 * Check and update rate limit for a given identifier
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier } = config;
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  // Get current rate limit data
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetAt < now) {
    // Create new rate limit window
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: new Date(resetAt),
    };
  }
  
  // Check if limit exceeded
  if (current.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(current.resetAt),
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    success: true,
    remaining: maxRequests - current.count,
    resetAt: new Date(current.resetAt),
  };
}

/**
 * Rate limit for authentication attempts
 * 5 attempts per 15 minutes per IP address
 */
export async function checkAuthRateLimit(ipAddress: string): Promise<RateLimitResult> {
  return checkRateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: `auth:${ipAddress}`,
  });
}

/**
 * Rate limit for general API requests (unauthenticated)
 * 100 requests per 15 minutes per IP address
 */
export async function checkApiRateLimitUnauthenticated(ipAddress: string): Promise<RateLimitResult> {
  return checkRateLimit({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: `api:unauth:${ipAddress}`,
  });
}

/**
 * Rate limit for general API requests (authenticated)
 * 1000 requests per 15 minutes per user
 */
export async function checkApiRateLimitAuthenticated(userId: string): Promise<RateLimitResult> {
  return checkRateLimit({
    maxRequests: 1000,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: `api:auth:${userId}`,
  });
}

/**
 * Get client IP address from request headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  
  // Check various headers for IP address
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default value
  return 'unknown';
}

/**
 * Log rate limit violation
 * @deprecated Use logRateLimitViolation from @/lib/audit instead
 */
export async function logRateLimitViolation(
  identifier: string,
  type: 'auth' | 'api',
  ipAddress: string
): Promise<void> {
  await logRateLimit(type, ipAddress, identifier);
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetAt: Date,
    public remaining: number = 0
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
