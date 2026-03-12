/**
 * Integration tests for security measures
 * Tests the interaction between CSRF protection, rate limiting, and input sanitization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeInput,
  sanitizeHtml,
  sanitizeEmail,
  checkAuthRateLimit,
  checkApiRateLimitUnauthenticated,
  checkApiRateLimitAuthenticated,
} from './security';

describe('Security Integration Tests', () => {
  describe('SQL Injection Prevention', () => {
    it('should sanitize SQL injection attempts in user input', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        // Input should be trimmed and null bytes removed
        // Drizzle ORM will handle parameterization
        expect(sanitized).toBeTruthy();
        expect(sanitized).not.toContain('\0');
      });
    });

    it('should handle null bytes in input', () => {
      const input = "test\0DROP TABLE users";
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('\0');
      expect(sanitized).toBe('testDROP TABLE users');
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize XSS attempts in HTML content', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<body onload=alert("XSS")>',
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
      ];

      xssAttempts.forEach(attempt => {
        const sanitized = sanitizeHtml(attempt);
        // Should not contain any unescaped HTML tags
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<body');
        // Should contain escaped versions
        expect(sanitized).toContain('&lt;');
        expect(sanitized).toContain('&gt;');
      });
    });

    it('should preserve safe content while escaping dangerous characters', () => {
      const input = 'Hello <b>World</b> & "Friends"';
      const sanitized = sanitizeHtml(input);
      expect(sanitized).toBe('Hello &lt;b&gt;World&lt;&#x2F;b&gt; &amp; &quot;Friends&quot;');
    });
  });

  describe('Email Validation and Sanitization', () => {
    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(() => sanitizeEmail(email)).toThrow('Invalid email format');
      });
    });

    it('should accept and normalize valid emails', () => {
      const validEmails = [
        { input: 'USER@EXAMPLE.COM', expected: 'user@example.com' },
        { input: '  test@example.com  ', expected: 'test@example.com' },
        { input: 'Test.User@Example.Com', expected: 'test.user@example.com' },
      ];

      validEmails.forEach(({ input, expected }) => {
        const result = sanitizeEmail(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce different rate limits for different contexts', async () => {
      const ip = '10.0.0.1';
      const userId = 'user-integration-test';

      // Auth rate limit: 5 attempts
      for (let i = 0; i < 5; i++) {
        const result = await checkAuthRateLimit(ip);
        expect(result.success).toBe(true);
      }
      const authBlocked = await checkAuthRateLimit(ip);
      expect(authBlocked.success).toBe(false);

      // API rate limit (unauth): 100 attempts
      const ip2 = '10.0.0.2';
      for (let i = 0; i < 100; i++) {
        const result = await checkApiRateLimitUnauthenticated(ip2);
        expect(result.success).toBe(true);
      }
      const apiUnauthBlocked = await checkApiRateLimitUnauthenticated(ip2);
      expect(apiUnauthBlocked.success).toBe(false);

      // API rate limit (auth): 1000 attempts (test first few)
      for (let i = 0; i < 10; i++) {
        const result = await checkApiRateLimitAuthenticated(userId);
        expect(result.success).toBe(true);
      }
    });

    it('should provide correct remaining count', async () => {
      const ip = '10.0.0.3';

      const result1 = await checkAuthRateLimit(ip);
      expect(result1.remaining).toBe(4); // 5 max - 1 used

      const result2 = await checkAuthRateLimit(ip);
      expect(result2.remaining).toBe(3); // 5 max - 2 used

      const result3 = await checkAuthRateLimit(ip);
      expect(result3.remaining).toBe(2); // 5 max - 3 used
    });

    it('should provide reset time for blocked requests', async () => {
      const ip = '10.0.0.4';

      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await checkAuthRateLimit(ip);
      }

      const blocked = await checkAuthRateLimit(ip);
      expect(blocked.success).toBe(false);
      expect(blocked.resetAt).toBeInstanceOf(Date);
      expect(blocked.resetAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Combined Security Scenarios', () => {
    it('should handle malicious input with rate limiting', async () => {
      const ip = '10.0.0.5';
      const maliciousInput = "'; DROP TABLE users; --";

      // Simulate multiple attempts with malicious input
      for (let i = 0; i < 5; i++) {
        const sanitized = sanitizeInput(maliciousInput);
        expect(sanitized).not.toContain('\0');

        const rateLimit = await checkAuthRateLimit(ip);
        expect(rateLimit.success).toBe(true);
      }

      // 6th attempt should be rate limited
      const blocked = await checkAuthRateLimit(ip);
      expect(blocked.success).toBe(false);
    });

    it('should sanitize XSS attempts in user-generated content', () => {
      const userComment = 'Great product! <script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(userComment);

      expect(sanitized).toContain('Great product!');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should handle email injection attempts', () => {
      const injectionAttempts = [
        'user@example.com\nBcc: attacker@evil.com',
        'user@example.com\r\nCc: attacker@evil.com',
        'user@example.com%0ABcc:attacker@evil.com',
      ];

      injectionAttempts.forEach(attempt => {
        // Email validation should reject these
        expect(() => sanitizeEmail(attempt)).toThrow();
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high volume of sanitization operations efficiently', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        sanitizeInput(`test input ${i}`);
        sanitizeHtml(`<p>test html ${i}</p>`);
      }

      const duration = Date.now() - startTime;
      // Should complete 1000 iterations in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent rate limit checks', async () => {
      const promises = [];
      const baseIp = '10.0.1.';

      // Create 10 concurrent rate limit checks for different IPs
      for (let i = 0; i < 10; i++) {
        const ip = `${baseIp}${i}`;
        promises.push(checkAuthRateLimit(ip));
      }

      const results = await Promise.all(promises);

      // All should succeed (first request for each IP)
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4);
      });
    });
  });
});
