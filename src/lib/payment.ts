import Stripe from 'stripe';
import { logger } from '@/lib/logger';

// Initialize Stripe with secret key (optional for tests)
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });
}

export { stripe };

/**
 * Create a payment intent for checkout
 * Validates: Requirements 30.1, 30.2, 30.3
 * 
 * @param amount - Amount in cents
 * @param currency - Currency code (default: 'usd')
 * @param metadata - Additional metadata for the payment
 * @returns Stripe PaymentIntent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
) {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment processing is not configured',
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

/**
 * Confirm a payment intent
 * Validates: Requirement 30.3
 * 
 * @param paymentIntentId - Payment intent ID to confirm
 * @returns Confirmation result
 */
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment processing is not configured',
      };
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment',
    };
  }
}

/**
 * Retrieve a payment intent
 * 
 * @param paymentIntentId - Payment intent ID
 * @returns Payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment processing is not configured',
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    };
  }
}

/**
 * Cancel a payment intent
 * 
 * @param paymentIntentId - Payment intent ID to cancel
 * @returns Cancellation result
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment processing is not configured',
      };
    }

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel payment intent',
    };
  }
}

/**
 * Extract last 4 digits from payment method
 * Validates: Requirement 30.5, 30.6
 * 
 * @param paymentMethodId - Payment method ID
 * @returns Last 4 digits of card
 */
export async function getCardLast4Digits(paymentMethodId: string): Promise<string | null> {
  try {
    if (!stripe) {
      return null;
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    if (paymentMethod.type === 'card' && paymentMethod.card) {
      return paymentMethod.card.last4;
    }
    
    return null;
  } catch (error) {
    logger.error('Failed to retrieve payment method', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Handle payment timeout
 * Validates: Requirement 30.4, 30.7
 * 
 * @param paymentIntentId - Payment intent ID
 * @param timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns Payment result or timeout error
 */
export async function handlePaymentWithTimeout(
  paymentIntentId: string,
  timeoutMs: number = 30000
): Promise<{ success: boolean; data?: Stripe.PaymentIntent; error?: string; timedOut?: boolean }> {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment processing is not configured',
      };
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Payment processing timeout')), timeoutMs);
    });

    const paymentPromise = stripe.paymentIntents.retrieve(paymentIntentId);

    const paymentIntent = await Promise.race([paymentPromise, timeoutPromise]);

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Payment processing timeout') {
      return {
        success: false,
        error: 'Payment processing timed out. Please try again.',
        timedOut: true,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
}
