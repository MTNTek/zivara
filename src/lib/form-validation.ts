import { z } from 'zod';
import { useState } from 'react';

/**
 * Hook for client-side form validation using Zod schemas
 * Returns validation errors and a validate function
 */
export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: unknown): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } => {
    try {
      const validated = schema.parse(data);
      setErrors({});
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (path) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return { success: false, errors: fieldErrors };
      }
      return { success: false, errors: { _form: 'Validation failed' } };
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
  };
}

/**
 * Synchronous validation function for use in form handlers
 */
export function validateWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: boolean; data?: z.infer<T>; error?: string; fieldErrors?: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (path) {
          fieldErrors[path] = issue.message;
        }
      });
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
        fieldErrors,
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}
