/**
 * Error Handling Infrastructure
 * 
 * Custom error class hierarchy for the Zivara eCommerce platform.
 * Provides structured error handling with appropriate HTTP status codes.
 * 
 * Requirements: 18.1, 18.2, 18.7
 */

/**
 * Base application error class
 * All custom errors extend from this class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error for unauthenticated requests
 * HTTP Status: 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for insufficient permissions
 * HTTP Status: 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error for missing resources
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error for duplicate or conflicting data
 * HTTP Status: 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Database error for database operation failures
 * HTTP Status: 500 Internal Server Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super('DATABASE_ERROR', message, 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * External service error for third-party service failures
 * HTTP Status: 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502, details);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Rate limit error for exceeded rate limits
 * HTTP Status: 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_ERROR', message, 429);
    this.name = 'RateLimitError';
  }
}
