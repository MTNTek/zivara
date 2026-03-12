import { z } from 'zod';

/**
 * Schema for updating user profile information
 * Requirements: 11.1, 11.2, 11.7
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

/**
 * Schema for adding/updating a shipping address
 * Requirements: 11.4
 */
export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label must be less than 100 characters').optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  isDefault: z.boolean().optional().default(false),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
