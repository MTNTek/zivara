/**
 * Tests for Logging Service
 *
 * The logger outputs: console[method](tag, message) or console[method](tag, message, context)
 * where tag = "[LEVEL] [ISO_TIMESTAMP]"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, type LogLevel } from './logger';

describe('Logger', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    vi.restoreAllMocks();
  });

  describe('Log levels', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = consoleInfoSpy.mock.calls[0];
      expect(tag).toContain('[INFO]');
      expect(msg).toBe('Test info message');
    });

    it('should log warn messages', () => {
      logger.warn('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = consoleWarnSpy.mock.calls[0];
      expect(tag).toContain('[WARN]');
      expect(msg).toBe('Test warning message');
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = consoleErrorSpy.mock.calls[0];
      expect(tag).toContain('[ERROR]');
      expect(msg).toBe('Test error message');
    });

    it('should log critical messages', () => {
      logger.critical('Test critical message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = consoleErrorSpy.mock.calls[0];
      expect(tag).toContain('[CRITICAL]');
      expect(msg).toBe('Test critical message');
    });
  });

  describe('Context logging', () => {
    it('should include context in log output', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const [tag, msg, ctx] = consoleInfoSpy.mock.calls[0];
      expect(tag).toContain('[INFO]');
      expect(msg).toBe('User action');
      expect(ctx).toEqual(context);
    });

    it('should handle complex context objects', () => {
      const context = {
        user: { id: '123', email: 'test@example.com' },
        metadata: { timestamp: Date.now(), source: 'api' },
      };
      logger.error('Complex error', context);
      const [, , ctx] = consoleErrorSpy.mock.calls[0];
      expect(ctx).toEqual(context);
    });

    it('should work without context', () => {
      logger.info('Simple message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const [tag, msg] = consoleInfoSpy.mock.calls[0];
      expect(tag).toContain('[INFO]');
      expect(msg).toBe('Simple message');
    });
  });

  describe('Timestamp formatting', () => {
    it('should include ISO timestamp in log messages', () => {
      logger.info('Test message');
      const tag = consoleInfoSpy.mock.calls[0][0];
      expect(tag).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Authentication logging', () => {
    it('should log successful authentication attempts', () => {
      const context = { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' };
      logger.logAuthAttempt(true, 'user@example.com', context);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const [, msg, ctx] = consoleInfoSpy.mock.calls[0];
      expect(msg).toContain('Auth success');
      expect(msg).toContain('user@example.com');
      expect(ctx).toMatchObject({ authSuccess: true, email: 'user@example.com' });
    });

    it('should log failed authentication attempts', () => {
      const context = { ipAddress: '192.168.1.1' };
      logger.logAuthAttempt(false, 'user@example.com', context);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const [, msg, ctx] = consoleWarnSpy.mock.calls[0];
      expect(msg).toContain('Auth failed');
      expect(msg).toContain('user@example.com');
      expect(ctx).toMatchObject({ authSuccess: false, email: 'user@example.com' });
    });

    it('should include auth context fields', () => {
      logger.logAuthAttempt(true, 'user@example.com');
      const ctx = consoleInfoSpy.mock.calls[0][2];
      expect(ctx).toHaveProperty('authSuccess', true);
      expect(ctx).toHaveProperty('email', 'user@example.com');
    });

    it('should work without additional context', () => {
      logger.logAuthAttempt(true, 'user@example.com');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const ctx = consoleInfoSpy.mock.calls[0][2];
      expect(ctx).toMatchObject({ authSuccess: true, email: 'user@example.com' });
    });
  });

  describe('Critical error alerts', () => {
    it('should output alert markers for critical errors in production', () => {
      process.env.NODE_ENV = 'production';
      logger.critical('Critical system failure');
      // In production, critical logs go to stderr as JSON + sendAlert calls console.error
      expect(consoleErrorSpy).toHaveBeenCalled();
      const calls = consoleErrorSpy.mock.calls;
      const hasAlert = calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('CRITICAL'))
      );
      expect(hasAlert).toBe(true);
    });

    it('should include message in critical alerts', () => {
      logger.critical('Database connection lost');
      const calls = consoleErrorSpy.mock.calls;
      const hasMessage = calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('Database connection lost'))
      );
      expect(hasMessage).toBe(true);
    });

    it('should include context in critical alerts', () => {
      const context = { server: 'db-primary', error: 'timeout' };
      logger.critical('Database failure', context);
      const calls = consoleErrorSpy.mock.calls;
      const hasContext = calls.some(call => call.some(arg => arg === context));
      expect(hasContext).toBe(true);
    });
  });

  describe('Log method', () => {
    it('should accept all valid log levels', () => {
      const levels: LogLevel[] = ['info', 'warn', 'error', 'critical'];
      levels.forEach(level => logger.log(level, `Test ${level} message`));
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // error + critical
    });

    it('should format log entries consistently', () => {
      logger.log('info', 'Test message', { key: 'value' });
      const [tag, msg, ctx] = consoleInfoSpy.mock.calls[0];
      expect(tag).toContain('[INFO]');
      expect(tag).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(msg).toBe('Test message');
      expect(ctx).toEqual({ key: 'value' });
    });
  });

  describe('Production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should write structured JSON to stdout in production', () => {
      logger.info('Production log');
      expect(stdoutSpy).toHaveBeenCalled();
      const output = stdoutSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Production log');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should write errors to stderr in production', () => {
      logger.error('Production error');
      expect(stderrSpy).toHaveBeenCalled();
      const output = stderrSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Production error');
    });

    it('should trigger alert mechanism for critical errors in production', () => {
      logger.critical('Production critical error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const calls = consoleErrorSpy.mock.calls;
      const hasAlert = calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('CRITICAL'))
      );
      expect(hasAlert).toBe(true);
    });
  });

  describe('Error context', () => {
    it('should log stack traces when provided', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { stack: error.stack });
      const ctx = consoleErrorSpy.mock.calls[0][2];
      expect(ctx.stack).toContain('Error: Test error');
    });

    it('should log error codes when provided', () => {
      logger.error('Validation failed', { code: 'VALIDATION_ERROR', statusCode: 400 });
      const ctx = consoleErrorSpy.mock.calls[0][2];
      expect(ctx).toMatchObject({ code: 'VALIDATION_ERROR', statusCode: 400 });
    });
  });

  describe('Message formatting', () => {
    it('should format messages with level prefix', () => {
      logger.info('Test');
      const tag = consoleInfoSpy.mock.calls[0][0];
      expect(tag).toMatch(/^\[INFO\]/);
    });

    it('should include timestamp in formatted message', () => {
      logger.warn('Test');
      const tag = consoleWarnSpy.mock.calls[0][0];
      expect(tag).toMatch(/\[WARN\] \[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include the actual message as second arg', () => {
      logger.error('Specific error message');
      const msg = consoleErrorSpy.mock.calls[0][1];
      expect(msg).toBe('Specific error message');
    });
  });
});
