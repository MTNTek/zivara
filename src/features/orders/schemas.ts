import { z } from 'zod';

/**
 * Schema for shipping address
 */
export const shippingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

/**
 * Schema for checkout data
 * Validates: Requirement 6.2, 6.4, 30.1-30.7
 */
export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentIntentId: z.string().optional(),
  guestEmail: z.string().email('Invalid email format').optional(),
});

/**
 * Schema for updating order status
 * Validates: Requirement 7.3
 */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'Invalid order status',
  }),
  notes: z.string().optional(),
});

/**
 * Schema for cancelling an order
 * Validates: Requirement 7.6, 7.7
 */
export const cancelOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
