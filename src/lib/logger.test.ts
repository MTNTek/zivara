/**
 * Tests for Logging Service
 * 
 * Validates: Requirements 18.1, 18.4, 18.5, 18.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, type LogLevel } from './logger';

describe('Logger', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    
    // Set to development for testing
    process.env.NODE_ENV = 'development';
    
    // Spy on console methods
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('Log levels', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log warn messages', () => {
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log critical messages', () => {
      logger.critical('Test critical message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CRITICAL]')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test critical message')
      );
    });
  });

  describe('Context logging', () => {
    it('should include context in log output', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        context
      );
    });

    it('should handle complex context objects', () => {
      const context = {
        user: { id: '123', email: 'test@example.com' },
        metadata: { timestamp: Date.now(), source: 'api' },
      };
      logger.error('Complex error', context);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        context
      );
    });

    it('should work without context', () => {
      logger.info('Simple message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Simple message')
      );
    });
  });

  describe('Timestamp formatting', () => {
    it('should include ISO timestamp in log messages', () => {
      logger.info('Test message');
      
      const logCall = consoleInfoSpy.mock.calls[0][0];
      // Check for ISO 8601 format pattern
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Authentication logging', () => {
    it('should log successful authentication attempts', () => {
      const context = { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' };
      logger.logAuthAttempt(true, 'user@example.com', context);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authentication successful: user@example.com'),
        expect.objectContaining({
          authSuccess: true,
          email: 'user@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
    });

    it('should log failed authentication attempts', () => {
      const context = { ipAddress: '192.168.1.1' };
      logger.logAuthAttempt(false, 'user@example.com', context);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authentication failed: user@example.com'),
        expect.objectContaining({
          authSuccess: false,
          email: 'user@example.com',
          ipAddress: '192.168.1.1',
        })
      );
    });

    it('should include timestamp in auth logs', () => {
      logger.logAuthAttempt(true, 'user@example.com');
      
      const contextArg = consoleInfoSpy.mock.calls[0][1];
      expect(contextArg).toHaveProperty('timestamp');
      expect(typeof contextArg.timestamp).toBe('string');
    });

    it('should work without additional context', () => {
      logger.logAuthAttempt(true, 'user@example.com');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authentication successful'),
        expect.objectContaining({
          authSuccess: true,
          email: 'user@example.com',
        })
      );
    });
  });

  describe('Critical error alerts', () => {
    it('should output alert markers for critical errors', () => {
      // Set to production mode to trigger alert
      process.env.NODE_ENV = 'production';
      
      logger.critical('Critical system failure');
      
      // Check that multiple console.error calls were made (for the alert)
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Check that one of the calls contains the alert marker
      const calls = consoleErrorSpy.mock.calls;
      const hasAlertMarker = calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('🚨 CRITICAL ALERT 🚨'))
      );
      expect(hasAlertMarker).toBe(true);
      
      // Reset to development
      process.env.NODE_ENV = 'development';
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
      const hasContext = calls.some(call => 
        call.some(arg => arg === context)
      );
      expect(hasContext).toBe(true);
    });
  });

  describe('Log method', () => {
    it('should accept all valid log levels', () => {
      const levels: LogLevel[] = ['info', 'warn', 'error', 'critical'];
      
      levels.forEach(level => {
        logger.log(level, `Test ${level} message`);
      });
      
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // error + critical
    });

    it('should format log entries consistently', () => {
      logger.log('info', 'Test message', { key: 'value' });
      
      const logCall = consoleInfoSpy.mock.calls[0][0];
      expect(logCall).toContain('[INFO]');
      expect(logCall).toContain('Test message');
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO timestamp
    });
  });

  describe('Production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should still log to console in production (until external service is configured)', () => {
      logger.info('Production log');
      
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should trigger alert mechanism for critical errors in production', () => {
      logger.critical('Production critical error');
      
      // Should log the alert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨 CRITICAL ALERT 🚨')
      );
    });
  });

  describe('Error context', () => {
    it('should log stack traces when provided', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { stack: error.stack });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          stack: expect.stringContaining('Error: Test error'),
        })
      );
    });

    it('should log error codes when provided', () => {
      logger.error('Validation failed', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        })
      );
    });
  });

  describe('Message formatting', () => {
    it('should format messages with level prefix', () => {
      logger.info('Test');
      const message = consoleInfoSpy.mock.calls[0][0];
      expect(message).toMatch(/^\[INFO\]/);
    });

    it('should include timestamp in formatted message', () => {
      logger.warn('Test');
      const message = consoleWarnSpy.mock.calls[0][0];
      expect(message).toMatch(/\[WARN\] \[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include the actual message', () => {
      logger.error('Specific error message');
      const message = consoleErrorSpy.mock.calls[0][0];
      expect(message).toContain('Specific error message');
    });
  });
});
