/**
 * Tests for Global Error Handler
 * 
 * Validates: Requirements 18.1, 18.2, 18.3, 18.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  handleError,
  withDatabaseRetry,
  withErrorHandling,
  type ErrorResponse,
  type SuccessResponse,
} from './error-handler';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
} from './errors';
import { logger } from './logger';

// Mock the logger
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
    log: vi.fn(),
  },
}));

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid email', { field: 'email' });
      const result = handleError(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email',
          details: { field: 'email' },
        },
      });
      expect(logger.log).toHaveBeenCalledWith(
        'warn',
        'Invalid email',
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        })
      );
    });

    it('should handle AuthenticationError correctly', () => {
      const error = new AuthenticationError('Invalid credentials');
      const result = handleError(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid credentials',
          details: undefined,
        },
      });
      expect(logger.log).toHaveBeenCalledWith(
        'warn',
        'Invalid credentials',
        expect.any(Object)
      );
    });

    it('should handle NotFoundError correctly', () => {
      const error = new NotFoundError('Product');
      const result = handleError(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
          details: undefined,
        },
      });
    });

    it('should handle DatabaseError as critical', () => {
      const error = new DatabaseError('Connection failed');
      const result = handleError(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Connection failed',
          details: undefined,
        },
      });
      expect(logger.log).toHaveBeenCalledWith(
        'critical',
        'Connection failed',
        expect.any(Object)
      );
    });

    it('should handle unexpected Error instances', () => {
      const error = new Error('Unexpected error');
      const result = handleError(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Unexpected error',
        expect.objectContaining({
          type: 'UNEXPECTED_ERROR',
        })
      );
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const result = handleError(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should not expose system internals in error messages', () => {
      const error = new Error('Database connection string: postgres://user:pass@host');
      const result = handleError(error);

      expect(result.error.message).not.toContain('postgres://');
      expect(result.error.message).toBe('An unexpected error occurred. Please try again later.');
    });
  });

  describe('withDatabaseRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result on first successful attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await withDatabaseRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on connection errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('connection refused'))
        .mockRejectedValueOnce(new Error('connection timeout'))
        .mockResolvedValueOnce('success');
      
      const promise = withDatabaseRetry(operation);
      
      // Fast-forward through retry delays
      await vi.runAllTimersAsync();
      
      const result = await promise;
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it('should throw DatabaseError after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      
      const promise = withDatabaseRetry(operation, 3);
      
      // Fast-forward through retry delays
      await vi.runAllTimersAsync();
      
      // Properly await and catch the rejection
      try {
        await promise;
        expect.fail('Should have thrown DatabaseError');
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error).toHaveProperty('message', 'Database operation failed. Please try again later.');
      }
      
      expect(operation).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should not retry non-connection errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Invalid query'));
      
      const promise = withDatabaseRetry(operation);
      
      await vi.runAllTimersAsync();
      
      // Properly await and catch the rejection
      try {
        await promise;
        expect.fail('Should have thrown DatabaseError');
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
      }
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff for retries', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('connection timeout'))
        .mockRejectedValueOnce(new Error('connection timeout'))
        .mockResolvedValueOnce('success');
      
      const promise = withDatabaseRetry(operation);
      
      // First retry after 200ms (2^1 * 100)
      await vi.advanceTimersByTimeAsync(200);
      expect(operation).toHaveBeenCalledTimes(2);
      
      // Second retry after 400ms (2^2 * 100)
      await vi.advanceTimersByTimeAsync(400);
      expect(operation).toHaveBeenCalledTimes(3);
      
      await promise;
    });

    it('should respect custom maxRetries parameter', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('connection failed'));
      
      const promise = withDatabaseRetry(operation, 2);
      
      await vi.runAllTimersAsync();
      
      // Properly await and catch the rejection
      try {
        await promise;
        expect.fail('Should have thrown DatabaseError');
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
      }
      
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('withErrorHandling', () => {
    it('should return success response for successful operations', async () => {
      const fn = async (x: number, y: number) => x + y;
      const wrapped = withErrorHandling(fn);
      
      const result = await wrapped(2, 3);
      
      expect(result).toEqual({
        success: true,
        data: 5,
      });
    });

    it('should handle errors and return error response', async () => {
      const fn = async () => {
        throw new ValidationError('Invalid input');
      };
      const wrapped = withErrorHandling(fn);
      
      const result = await wrapped();
      
      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: undefined,
        },
      });
    });

    it('should preserve function arguments', async () => {
      const fn = vi.fn(async (a: string, b: number) => `${a}-${b}`);
      const wrapped = withErrorHandling(fn);
      
      await wrapped('test', 42);
      
      expect(fn).toHaveBeenCalledWith('test', 42);
    });

    it('should handle unexpected errors', async () => {
      const fn = async () => {
        throw new Error('Unexpected');
      };
      const wrapped = withErrorHandling(fn);
      
      const result = await wrapped();
      
      expect(result).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
      });
    });
  });

  describe('Error severity mapping', () => {
    it('should log 4xx errors as warnings', () => {
      const error = new ValidationError('test');
      handleError(error);
      expect(logger.log).toHaveBeenCalledWith('warn', expect.any(String), expect.any(Object));
    });

    it('should log 5xx errors as critical', () => {
      const error = new DatabaseError('test');
      handleError(error);
      expect(logger.log).toHaveBeenCalledWith('critical', expect.any(String), expect.any(Object));
    });

    it('should log custom AppError with appropriate severity', () => {
      const error = new AppError('CUSTOM', 'test', 503);
      handleError(error);
      expect(logger.log).toHaveBeenCalledWith('critical', expect.any(String), expect.any(Object));
    });
  });
});
