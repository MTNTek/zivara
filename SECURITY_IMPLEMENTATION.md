# Security Implementation Guide

This document describes the security measures implemented in the Zivara eCommerce platform.

## Overview

The platform implements comprehensive security measures including:
- CSRF (Cross-Site Request Forgery) protection
- Input sanitization to prevent SQL injection and XSS attacks
- Rate limiting for authentication and API endpoints
- Audit logging for security events

## CSRF Protection (Requirement 19.5)

### Implementation

CSRF protection is implemented at multiple layers:

1. **Next.js Server Actions**: Built-in CSRF protection via origin checking
2. **Middleware**: Additional CSRF validation for API routes in `src/middleware.ts`
3. **Security Library**: Helper functions in `src/lib/security.ts`

### How It Works

The middleware checks the `origin` header against the `host` header for all state-changing operations (POST, PUT, PATCH, DELETE). If they don't match, the request is rejected with a 403 status code.

```typescript
// Example: CSRF protection in middleware
if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  
  if (origin) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
    }
  }
}
```

### Usage

CSRF protection is automatically applied to:
- All authenticated routes (via middleware)
- All Server Actions (via Next.js built-in protection)
- All API routes (via middleware)

No additional code is required in individual routes or actions.

## Input Sanitization (Requirement 19.4)

### Implementation

Input sanitization is provided through utility functions in `src/lib/security.ts`:

1. **sanitizeInput()**: Removes null bytes and trims whitespace
2. **sanitizeHtml()**: Escapes HTML special characters to prevent XSS
3. **sanitizeEmail()**: Validates and sanitizes email addresses

### SQL Injection Prevention

The platform uses Drizzle ORM which provides parameterized queries by default, preventing SQL injection attacks. The `sanitizeInput()` function provides an additional layer of defense for any raw SQL queries.

### XSS Prevention

The `sanitizeHtml()` function escapes all HTML special characters:
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`

### Usage

```typescript
import { sanitizeInput, sanitizeHtml, sanitizeEmail } from '@/lib/security';

// Sanitize user input
const cleanInput = sanitizeInput(userInput);

// Sanitize HTML content
const safeHtml = sanitizeHtml(userContent);

// Validate and sanitize email
const cleanEmail = sanitizeEmail(userEmail);
```

## Rate Limiting

### Authentication Rate Limiting (Requirement 19.6)

**Limit**: 5 attempts per 15 minutes per IP address

**Implementation**: Applied in `src/app/api/auth/[...nextauth]/route.ts`

When the limit is exceeded:
- Login attempts are blocked
- The violation is logged to the audit_logs table
- User receives a generic authentication error

```typescript
// Rate limiting in NextAuth authorize function
const ip = getClientIp();
const rateLimitResult = await checkAuthRateLimit(ip);

if (!rateLimitResult.success) {
  await logRateLimitViolation(ip, 'auth', ip);
  return null; // Block login
}
```

### API Rate Limiting (Requirements 34.1-34.7)

**Limits**:
- Unauthenticated: 100 requests per 15 minutes per IP address
- Authenticated: 1000 requests per 15 minutes per user
- Admin users: Exempt from rate limits

**Implementation**: Available via `src/lib/rate-limit-middleware.ts`

When the limit is exceeded:
- HTTP 429 (Too Many Requests) status code is returned
- `Retry-After` header indicates when to retry
- Rate limit headers are included in all responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: When the rate limit resets

### Usage in API Routes

```typescript
import { withRateLimit } from '@/lib/rate-limit-middleware';

export const GET = withRateLimit(async (request: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ data: 'response' });
});
```

### Rate Limit Storage

**Development**: In-memory storage (Map)
**Production**: Should be replaced with Redis or similar distributed cache for multi-instance deployments

The in-memory implementation includes automatic cleanup of expired entries every 60 seconds.

## Audit Logging (Requirement 19.7)

### What Gets Logged

1. **Rate Limit Violations**: All rate limit violations are logged with:
   - Action type (e.g., `rate_limit_exceeded:auth`)
   - Entity type (`rate_limit`)
   - IP address
   - Timestamp

2. **Authentication Attempts**: Logged via NextAuth (future enhancement)

3. **Admin Actions**: Logged via audit_logs table (implemented in admin features)

### Implementation

```typescript
// Log rate limit violation
await logRateLimitViolation(identifier, 'auth', ipAddress);

// This inserts into audit_logs table:
// - action: 'rate_limit_exceeded:auth'
// - entity_type: 'rate_limit'
// - ip_address: '192.168.1.1'
// - created_at: NOW()
```

### Querying Audit Logs

```sql
-- View recent rate limit violations
SELECT * FROM audit_logs 
WHERE action LIKE 'rate_limit_exceeded:%' 
ORDER BY created_at DESC 
LIMIT 100;

-- Count violations by IP
SELECT ip_address, COUNT(*) as violation_count
FROM audit_logs
WHERE action LIKE 'rate_limit_exceeded:%'
GROUP BY ip_address
ORDER BY violation_count DESC;
```

## Security Best Practices

### For Developers

1. **Always use Drizzle ORM**: Never write raw SQL queries without parameterization
2. **Sanitize user input**: Use `sanitizeInput()` for text, `sanitizeHtml()` for HTML content
3. **Validate email addresses**: Use `sanitizeEmail()` for email inputs
4. **Apply rate limiting**: Use `withRateLimit()` wrapper for all public API routes
5. **Check authentication**: Use `requireAuth()` or `requireAdmin()` in server actions
6. **Log security events**: Use the audit_logs table for security-relevant actions

### For Administrators

1. **Monitor audit logs**: Regularly check for rate limit violations and suspicious patterns
2. **Review IP blocks**: Investigate IPs with multiple rate limit violations
3. **Update rate limits**: Adjust limits based on legitimate usage patterns
4. **Enable alerts**: Set up monitoring for critical security events

## Testing

Comprehensive tests are provided in `src/lib/security.test.ts`:

- Input sanitization tests (12 tests)
- Rate limiting tests (7 tests)
- Error handling tests (1 test)

Run tests with:
```bash
npm test src/lib/security.test.ts
```

## Future Enhancements

1. **Redis Integration**: Replace in-memory rate limiting with Redis for production
2. **IP Whitelisting**: Allow trusted IPs to bypass rate limits
3. **Dynamic Rate Limits**: Adjust limits based on user behavior and trust score
4. **Security Headers**: Add additional security headers (CSP, HSTS, etc.)
5. **Intrusion Detection**: Implement pattern detection for attack attempts
6. **Two-Factor Authentication**: Add 2FA for enhanced account security

## Requirements Mapping

| Requirement | Implementation | Location |
|------------|----------------|----------|
| 19.1 | HTTPS enforcement | Infrastructure/deployment |
| 19.4 | Input sanitization | `src/lib/security.ts` |
| 19.5 | CSRF protection | `src/middleware.ts`, Server Actions |
| 19.6 | Auth rate limiting | `src/app/api/auth/[...nextauth]/route.ts` |
| 19.7 | Rate limit logging | `src/lib/security.ts` |
| 34.1 | Unauth API rate limit | `src/lib/security.ts` |
| 34.2 | Auth API rate limit | `src/lib/security.ts` |
| 34.3 | 429 status code | `src/lib/rate-limit-middleware.ts` |
| 34.4 | Admin exemption | `src/lib/rate-limit-middleware.ts` |
| 34.7 | Violation logging | `src/lib/security.ts` |

## Support

For security concerns or questions, please contact the development team.
