/**
 * Server Action Wrapper Utility
 * 
 * Provides a convenient wrapper for server actions that automatically
 * handles errors, logging, and database retries.
 * 
 * Requirements: 18.1, 18.2
 */

import { z } from 'zod';
import { handleError, withDatabaseRetry, type ApiResponse } from './error-handler';
import { ValidationError } from './errors';
import { logger } from './logger';

/**
 * Wrap a server action with comprehensive error handling
 * 
 * @param actionName - Name of the action for logging
 * @param schema - Optional Zod schema for input validation
 * @param handler - The actual action handler function
 * @returns Wrapped action with error handling
 * 
 * @example
 * export const myAction = wrapServerAction(
 *   'myAction',
 *   myInputSchema,
 *   async (validated) => {
 *     // Your action logic here
 *     return { result: 'success' };
 *   }
 * );
 */
export function wrapServerAction<TInput, TOutput>(
  actionName: string,
  schema: z.ZodSchema<TInput> | null,
  handler: (validated: TInput) => Promise<TOutput>
): (input: unknown) => Promise<ApiResponse<TOutput>> {
  return async (input: unknown): Promise<ApiResponse<TOutput>> => {
    try {
      // Validate input if schema provided
      let validated: TInput;
      if (schema) {
        try {
          validated = schema.parse(input);
        } catch (error) {
          if (error instanceof z.ZodError) {
            logger.warn(`${actionName}: Validation error`, {
              errors: error.issues,
            });
            throw new ValidationError(
              error.issues[0].message,
              error.issues
            );
          }
          throw error;
        }
      } else {
        validated = input as TInput;
      }

      // Execute handler
      logger.info(`${actionName}: Starting`, {
        hasInput: !!input,
      });

      const result = await handler(validated);

      logger.info(`${actionName}: Completed successfully`);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error(`${actionName}: Failed`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return handleError(error);
    }
  };
}

/**
 * Wrap a database operation with retry logic
 * 
 * @param operation - The database operation to execute
 * @param operationName - Name for logging
 * @returns Result of the operation
 * 
 * @example
 * const user = await wrapDatabaseOperation(
 *   () => db.query.users.findFirst({ where: eq(users.id, userId) }),
 *   'getUserById'
 * );
 */
export async function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await withDatabaseRetry(operation);
  } catch (error) {
    logger.error(`Database operation failed: ${operationName}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

