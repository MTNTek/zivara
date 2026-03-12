import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeInput,
  sanitizeHtml,
  sanitizeEmail,
  checkRateLimit,
  checkAuthRateLimit,
  checkApiRateLimitUnauthenticated,
  checkApiRateLimitAuthenticated,
  RateLimitError,
} from './security';

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'test\0string';
      const result = sanitizeInput(input);
      expect(result).toBe('teststring');
    });

    it('should trim whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeInput(input);
      expect(result).toBe('test string');
    });

    it('should return empty string for non-string input', () => {
      const result = sanitizeInput(123 as any);
      expect(result).toBe('');
    });

    it('should handle empty strings', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape ampersands', () => {
      const input = 'Tom & Jerry';
      const result = sanitizeHtml(input);
      expect(result).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      const input = `He said "Hello" and 'Goodbye'`;
      const result = sanitizeHtml(input);
      expect(result).toBe('He said &quot;Hello&quot; and &#x27;Goodbye&#x27;');
    });

    it('should return empty string for non-string input', () => {
      const result = sanitizeHtml(null as any);
      expect(result).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim email addresses', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      const result = sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => sanitizeEmail('invalid-email')).toThrow('Invalid email format');
    });

    it('should accept valid email addresses', () => {
      const input = 'user@example.com';
      const result = sanitizeEmail(input);
      expect(result).toBe('user@example.com');
    });

    it('should handle email with subdomain', () => {
      const input = 'user@mail.example.com';
      const result = sanitizeEmail(input);
      expect(result).toBe('user@mail.example.com');
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      const result = await checkRateLimit({
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'test-user-1',
      });

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests exceeding limit', async () => {
      const config = {
        maxRequests: 2,
        windowMs: 60000,
        identifier: 'test-user-2',
      };

      // First request
      const result1 = await checkRateLimit(config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(1);

      // Second request
      const result2 = await checkRateLimit(config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(0);

      // Third request should be blocked
      const result3 = await checkRateLimit(config);
      expect(result3.success).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 100, // 100ms window
        identifier: 'test-user-3',
      };

      // First request
      const result1 = await checkRateLimit(config);
      expect(result1.success).toBe(true);

      // Second request should be blocked
      const result2 = await checkRateLimit(config);
      expect(result2.success).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Third request should succeed after reset
      const result3 = await checkRateLimit(config);
      expect(result3.success).toBe(true);
    });

    it('should track different identifiers separately', async () => {
      const config1 = {
        maxRequests: 1,
        windowMs: 60000,
        identifier: 'user-a',
      };

      const config2 = {
        maxRequests: 1,
        windowMs: 60000,
        identifier: 'user-b',
      };

      // Both users should be able to make one request
      const result1 = await checkRateLimit(config1);
      expect(result1.success).toBe(true);

      const result2 = await checkRateLimit(config2);
      expect(result2.success).toBe(true);

      // Both users should be blocked on second request
      const result3 = await checkRateLimit(config1);
      expect(result3.success).toBe(false);

      const result4 = await checkRateLimit(config2);
      expect(result4.success).toBe(false);
    });
  });

  describe('checkAuthRateLimit', () => {
    it('should enforce 5 attempts per 15 minutes', async () => {
      const ip = '192.168.1.1';

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await checkAuthRateLimit(ip);
        expect(result.success).toBe(true);
      }

      // 6th request should be blocked
      const result = await checkAuthRateLimit(ip);
      expect(result.success).toBe(false);
    });
  });

  describe('checkApiRateLimitUnauthenticated', () => {
    it('should enforce 100 requests per 15 minutes', async () => {
      const ip = '192.168.1.2';

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        const result = await checkApiRateLimitUnauthenticated(ip);
        expect(result.success).toBe(true);
      }

      // 101st request should be blocked
      const result = await checkApiRateLimitUnauthenticated(ip);
      expect(result.success).toBe(false);
    });
  });

  describe('checkApiRateLimitAuthenticated', () => {
    it('should enforce 1000 requests per 15 minutes', async () => {
      const userId = 'user-123';

      // Make 1000 requests
      for (let i = 0; i < 1000; i++) {
        const result = await checkApiRateLimitAuthenticated(userId);
        expect(result.success).toBe(true);
      }

      // 1001st request should be blocked
      const result = await checkApiRateLimitAuthenticated(userId);
      expect(result.success).toBe(false);
    });
  });
});

describe('RateLimitError', () => {
  it('should create error with correct properties', () => {
    const resetAt = new Date();
    const error = new RateLimitError('Rate limit exceeded', resetAt, 0);

    expect(error.message).toBe('Rate limit exceeded');
    expect(error.name).toBe('RateLimitError');
    expect(error.resetAt).toBe(resetAt);
    expect(error.remaining).toBe(0);
  });
});
