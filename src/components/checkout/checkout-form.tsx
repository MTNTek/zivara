'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/features/orders/actions';
import { checkoutSchema } from '@/features/orders/schemas';
import { validateWithSchema } from '@/lib/form-validation';
import type { CartItemWithProduct } from '@/features/cart/queries';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { StripeProvider } from './stripe-provider';
import { StripePaymentForm } from './stripe-payment-form';

interface CheckoutFormProps {
  cartItems: CartItemWithProduct[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function CheckoutForm({ cartItems, subtotal, tax, shipping, total }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  // Create payment intent on mount
  useEffect(() => {
    async function initPayment() {
      try {
        const res = await fetch('/api/checkout/payment-intent', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId);
            setStripeAvailable(true);
          }
        }
      } catch {
        // Stripe not configured — fall back to basic form
      } finally {
        setLoadingPayment(false);
      }
    }
    initPayment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const checkoutData = {
      shippingAddress: {
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      paymentMethod: 'card',
      guestEmail: formData.email,
      paymentIntentId: paymentIntentId || undefined,
    };

    const validation = validateWithSchema(checkoutSchema, checkoutData);
    if (!validation.success) {
      setError(validation.error || 'Please check your input');
      setFieldErrors(validation.fieldErrors || {});
      return;
    }

    startTransition(async () => {
      const result = await createOrder(checkoutData);

      if (result.success && result.data?.orderId) {
        toast.success('Order placed successfully!', 'Redirecting to order details...');
        router.push(`/orders/${result.data.orderId}?success=true`);
      } else {
        const err = result.error;
        const errorMsg = typeof err === 'object' && err !== null ? err.message : (err || 'Failed to create order');
        setError(errorMsg);
        toast.error('Could not place order', errorMsg);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const fieldPath = name.startsWith('address')
      ? `shippingAddress.${name.replace('address', '').replace(/^./, c => c.toLowerCase())}`
      : name;
    if (fieldErrors[fieldPath] || fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName] || fieldErrors[`shippingAddress.${fieldName}`];
  };

  // Callback when Stripe payment succeeds
  const handleStripePaymentSuccess = () => {
    // Submit the order after Stripe confirms payment
    const checkoutData = {
      shippingAddress: {
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      paymentMethod: 'card',
      guestEmail: formData.email,
      paymentIntentId: paymentIntentId || undefined,
    };

    startTransition(async () => {
      const result = await createOrder(checkoutData);
      if (result.success && result.data?.orderId) {
        toast.success('Order placed successfully!', 'Redirecting to order details...');
        router.push(`/orders/${result.data.orderId}?success=true`);
      } else {
        const err = result.error;
        const errorMsg = typeof err === 'object' && err !== null ? err.message : (err || 'Failed to create order');
        setError(errorMsg);
        toast.error('Could not place order', errorMsg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base ${
              getFieldError('guestEmail') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
          {getFieldError('guestEmail') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('guestEmail')}</p>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              required
              value={formData.addressLine1}
              onChange={handleChange}
              className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base ${
                getFieldError('line1') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('line1') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('line1')}</p>
            )}
          </div>
          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
              Apartment, suite, etc. (optional)
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" id="city" name="city" required value={formData.city} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base ${getFieldError('city') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('city') && <p className="mt-1 text-sm text-red-600">{getFieldError('city')}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input type="text" id="state" name="state" required value={formData.state} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base ${getFieldError('state') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('state') && <p className="mt-1 text-sm text-red-600">{getFieldError('state')}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input type="text" id="postalCode" name="postalCode" required value={formData.postalCode} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base ${getFieldError('postalCode') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('postalCode') && <p className="mt-1 text-sm text-red-600">{getFieldError('postalCode')}</p>}
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input type="text" id="country" name="country" required value={formData.country} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base ${getFieldError('country') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('country') && <p className="mt-1 text-sm text-red-600">{getFieldError('country')}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
        {loadingPayment ? (
          <div className="py-8 text-center text-gray-500">Loading payment form...</div>
        ) : stripeAvailable && clientSecret ? (
          <StripeProvider clientSecret={clientSecret}>
            <StripePaymentForm
              onSuccess={handleStripePaymentSuccess}
              onError={(msg: string) => setError(msg)}
              isPending={isPending}
            />
          </StripeProvider>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            Stripe is not configured. Set <code>STRIPE_SECRET_KEY</code> and <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment to enable payments.
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button (only shown when Stripe is not available — Stripe form has its own button) */}
      {!stripeAvailable && (
        <>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-teal-600 text-white px-6 py-4 min-h-[44px] rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center"
          >
            {isPending && <ButtonSpinner />}
            {isPending ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
          </button>
          <p className="text-sm text-gray-600 text-center">
            By placing your order, you agree to our{' '}
            <a href="/terms" className="text-teal-600 hover:underline">terms and conditions</a>.
          </p>
        </>
      )}
    </form>
  );
}
