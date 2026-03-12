/**
 * Tests for Error Class Hierarchy
 * 
 * Validates: Requirements 18.1, 18.2, 18.7
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
} from './errors';

describe('Error Class Hierarchy', () => {
  describe('AppError', () => {
    it('should create an error with all properties', () => {
      const error = new AppError('TEST_ERROR', 'Test message', 500, { detail: 'test' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.stack).toBeDefined();
    });

    it('should default to status code 500', () => {
      const error = new AppError('TEST_ERROR', 'Test message');
      expect(error.statusCode).toBe(500);
    });

    it('should capture stack trace', () => {
      const error = new AppError('TEST_ERROR', 'Test message');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct properties', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ValidationError('Invalid input', details);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });

    it('should work without details', () => {
      const error = new ValidationError('Invalid input');
      expect(error.details).toBeUndefined();
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message when none provided', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with custom message', () => {
      const error = new AuthorizationError('Admin access required');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AuthorizationError');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Admin access required');
      expect(error.statusCode).toBe(403);
    });

    it('should use default message when none provided', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource name', () => {
      const error = new NotFoundError('Product');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('NotFoundError');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Product not found');
      expect(error.statusCode).toBe(404);
    });

    it('should work with different resource names', () => {
      const error = new NotFoundError('Order');
      expect(error.message).toBe('Order not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Email already exists');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('ConflictError');
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with details', () => {
      const details = { query: 'SELECT * FROM users', error: 'Connection timeout' };
      const error = new DatabaseError('Database operation failed', details);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('DatabaseError');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual(details);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error with service name', () => {
      const error = new ExternalServiceError('Stripe', 'Payment processing failed');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('ExternalServiceError');
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.message).toBe('Stripe: Payment processing failed');
      expect(error.statusCode).toBe(502);
    });

    it('should include details when provided', () => {
      const details = { statusCode: 503, response: 'Service unavailable' };
      const error = new ExternalServiceError('Email Service', 'Failed to send', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with custom message', () => {
      const error = new RateLimitError('Too many login attempts');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.message).toBe('Too many login attempts');
      expect(error.statusCode).toBe(429);
    });

    it('should use default message when none provided', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
    });
  });

  describe('Error inheritance', () => {
    it('should allow instanceof checks for Error', () => {
      const errors = [
        new ValidationError('test'),
        new AuthenticationError(),
        new NotFoundError('Resource'),
        new DatabaseError('test'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should allow instanceof checks for AppError', () => {
      const errors = [
        new ValidationError('test'),
        new AuthenticationError(),
        new NotFoundError('Resource'),
        new DatabaseError('test'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
      });
    });
  });
});
