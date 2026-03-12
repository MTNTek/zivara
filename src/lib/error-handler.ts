/**
 * Global Error Handler
 * 
 * Centralized error handling for the Zivara eCommerce platform.
 * Processes errors, logs them appropriately, and returns user-friendly responses.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.5, 18.7
 */

import { AppError, DatabaseError } from './errors';
import { logger } from './logger';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * Union type for all responses
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Global error handler
 * Processes errors and returns standardized error responses
 * 
 * @param error - The error to handle
 * @returns Standardized error response
 */
export function handleError(error: unknown): ErrorResponse {
  // Handle known AppError instances
  if (error instanceof AppError) {
    // Log based on severity
    const severity = getSeverityFromStatusCode(error.statusCode);
    
    logger.log(severity, error.message, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    });
    
    // Return user-friendly error without exposing internals
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  // Handle unexpected errors
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error(errorMessage, {
    type: 'UNEXPECTED_ERROR',
    stack: errorStack,
    error: String(error),
  });

  // Return generic error message without exposing system internals
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  };
}

/**
 * Database operation wrapper with retry logic
 * Implements requirement 18.3: retry database connections up to 3 times
 * 
 * @param operation - The database operation to execute
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Result of the database operation
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a connection error
      const isConnectionError = 
        lastError.message.includes('connection') ||
        lastError.message.includes('ECONNREFUSED') ||
        lastError.message.includes('timeout');
      
      if (!isConnectionError || attempt === maxRetries) {
        // Not a connection error or max retries reached
        break;
      }
      
      // Log retry attempt
      logger.warn(`Database connection failed, retrying (${attempt}/${maxRetries})`, {
        error: lastError.message,
        attempt,
      });
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
  
  // All retries failed
  logger.error('Database operation failed after retries', {
    attempts: maxRetries,
    error: lastError?.message,
    stack: lastError?.stack,
  });
  
  throw new DatabaseError(
    'Database operation failed. Please try again later.',
    { originalError: lastError?.message }
  );
}

/**
 * Determine log severity from HTTP status code
 * 
 * @param statusCode - HTTP status code
 * @returns Log severity level
 */
function getSeverityFromStatusCode(statusCode: number): 'info' | 'warn' | 'error' | 'critical' {
  if (statusCode >= 500) {
    return 'critical';
  } else if (statusCode >= 400) {
    return 'warn';
  } else {
    return 'info';
  }
}

/**
 * Async error handler wrapper for server actions
 * Wraps async functions to automatically handle errors
 * 
 * @param fn - The async function to wrap
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<ApiResponse<R>> {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await fn(...args);
      return { success: true, data: result };
    } catch (error) {
      return handleError(error);
    }
  };
}
