/**
 * Edge-compatible rate limiter for Next.js middleware.
 * Uses in-memory Map (per-instance). For multi-instance deployments,
 * replace with Vercel KV, Upstash Redis, or similar.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60s
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  };
  // Use a global flag to avoid duplicate intervals in dev hot-reload
  const g = globalThis as Record<string, unknown>;
  if (!g.__rateLimitCleanup) {
    g.__rateLimitCleanup = true;
    setInterval(cleanup, 60_000);
  }
}

export function checkEdgeRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}
