import { toast as sonnerToast } from 'sonner';

/**
 * Toast notification utilities
 * Provides consistent toast notifications across the application
 */

export const toast = {
  /**
   * Show a success toast notification
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
    });
  },

  /**
   * Show an info toast notification
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
    });
  },

  /**
   * Show a loading toast notification
   * Returns a function to dismiss the toast
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

/**
 * User-friendly error messages for common error codes
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  AUTHENTICATION_ERROR: 'Please sign in to continue',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',

  // Resource errors
  NOT_FOUND: 'The requested item could not be found',
  PRODUCT_NOT_FOUND: 'This product is no longer available',
  ORDER_NOT_FOUND: 'Order not found',
  
  // Inventory errors
  OUT_OF_STOCK: 'This item is currently out of stock',
  INSUFFICIENT_STOCK: 'Not enough items in stock',
  
  // Cart errors
  CART_EMPTY: 'Your cart is empty',
  MAX_QUANTITY_EXCEEDED: 'Maximum quantity per item is 99',
  
  // Order errors
  PAYMENT_FAILED: 'Payment could not be processed. Please try again',
  ORDER_CREATION_FAILED: 'Unable to create order. Please try again',
  
  // Profile errors
  EMAIL_IN_USE: 'This email address is already in use',
  MAX_ADDRESSES: 'You can only save up to 5 addresses',
  
  // Review errors
  ALREADY_REVIEWED: 'You have already reviewed this product',
  REVIEW_NOT_PURCHASED: 'You can only review products you have purchased',
  REVIEW_EDIT_EXPIRED: 'Reviews can only be edited within 30 days',
  
  // Generic errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

/**
 * Success messages for common actions
 */
export const SUCCESS_MESSAGES = {
  // Cart actions
  ADDED_TO_CART: 'Added to cart',
  REMOVED_FROM_CART: 'Removed from cart',
  CART_UPDATED: 'Cart updated',
  CART_CLEARED: 'Cart cleared',
  
  // Order actions
  ORDER_PLACED: 'Order placed successfully',
  ORDER_CANCELLED: 'Order cancelled',
  ORDER_STATUS_UPDATED: 'Order status updated',
  
  // Profile actions
  PROFILE_UPDATED: 'Profile updated successfully',
  ADDRESS_ADDED: 'Address added',
  ADDRESS_UPDATED: 'Address updated',
  ADDRESS_DELETED: 'Address deleted',
  DEFAULT_ADDRESS_SET: 'Default address updated',
  
  // Review actions
  REVIEW_SUBMITTED: 'Review submitted successfully',
  REVIEW_UPDATED: 'Review updated',
  REVIEW_DELETED: 'Review deleted',
  REVIEW_MARKED_HELPFUL: 'Thank you for your feedback',
  
  // Admin actions
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated',
  PRODUCT_DELETED: 'Product deleted',
  CATEGORY_CREATED: 'Category created',
  CATEGORY_UPDATED: 'Category updated',
  USER_UPDATED: 'User updated',
  
  // Auth actions
  SIGNED_IN: 'Welcome back!',
  SIGNED_OUT: 'Signed out successfully',
  REGISTERED: 'Account created successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_CHANGED: 'Password changed successfully',
};
