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

interface SavedAddress {
  id: string;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CheckoutFormProps {
  cartItems: CartItemWithProduct[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function CheckoutForm({ total }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  // Coupon from cart
  const [couponData, setCouponData] = useState<{ id: string; code: string; discount: number } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('zivara_coupon');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCouponData({ id: parsed.id, code: parsed.code, discount: parsed.discount });
      }
    } catch {}
  }, []);

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

  // Fetch saved addresses
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch('/api/addresses');
        if (res.ok) {
          const data = await res.json();
          const addrs = data.addresses || [];
          setSavedAddresses(addrs);
          // Auto-fill with default address
          const defaultAddr = addrs.find((a: SavedAddress) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setFormData(prev => ({
              ...prev,
              addressLine1: defaultAddr.addressLine1,
              addressLine2: defaultAddr.addressLine2 || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              postalCode: defaultAddr.postalCode,
              country: defaultAddr.country,
            }));
          }
        }
      } catch {
        // Not logged in or no addresses
      }
    }
    loadAddresses();
  }, []);

  // Warn before navigating away with unsaved form data
  useEffect(() => {
    const hasData = formData.addressLine1 || formData.city || formData.email;
    if (!hasData) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData.addressLine1, formData.city, formData.email]);

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
      couponId: couponData?.id,
      couponCode: couponData?.code,
      couponDiscount: couponData?.discount,
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
        sessionStorage.removeItem('zivara_coupon');
        toast.success('Order placed successfully!', 'Redirecting...');
        router.push(`/orders/${result.data.orderId}/success`);
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
      couponId: couponData?.id,
      couponCode: couponData?.code,
      couponDiscount: couponData?.discount,
    };

    startTransition(async () => {
      const result = await createOrder(checkoutData);
      if (result.success && result.data?.orderId) {
        sessionStorage.removeItem('zivara_coupon');
        toast.success('Order placed successfully!', 'Redirecting...');
        router.push(`/orders/${result.data.orderId}/success`);
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
            className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${
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

        {/* Saved address selector */}
        {savedAddresses.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Use a saved address</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      addressLine1: addr.addressLine1,
                      addressLine2: addr.addressLine2 || '',
                      city: addr.city,
                      state: addr.state,
                      postalCode: addr.postalCode,
                      country: addr.country,
                    }));
                  }}
                  className={`text-left p-3 rounded-lg border-2 transition-colors text-sm ${
                    formData.addressLine1 === addr.addressLine1 && formData.city === addr.city && formData.postalCode === addr.postalCode
                      ? 'border-[#2563eb] bg-[#eff6ff]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {addr.label && <span className="text-xs font-semibold text-gray-500 uppercase">{addr.label}</span>}
                  <p className="text-gray-900 font-medium">{addr.addressLine1}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                  {addr.isDefault && (
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-[#eff6ff] text-[#2563eb] px-1.5 py-0.5 rounded">Default</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">Or enter a new address below</p>
            </div>
          </div>
        )}

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
              className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${
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
              className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" id="city" name="city" required value={formData.city} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${getFieldError('city') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('city') && <p className="mt-1 text-sm text-red-600">{getFieldError('city')}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input type="text" id="state" name="state" required value={formData.state} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${getFieldError('state') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('state') && <p className="mt-1 text-sm text-red-600">{getFieldError('state')}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input type="text" id="postalCode" name="postalCode" required value={formData.postalCode} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${getFieldError('postalCode') ? 'border-red-500' : 'border-gray-300'}`}
              />
              {getFieldError('postalCode') && <p className="mt-1 text-sm text-red-600">{getFieldError('postalCode')}</p>}
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input type="text" id="country" name="country" required value={formData.country} onChange={handleChange}
                className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${getFieldError('country') ? 'border-red-500' : 'border-gray-300'}`}
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
            className="w-full bg-[#fbbf24] text-[#0F1111] px-6 py-4 min-h-[44px] rounded-lg font-semibold hover:bg-[#f59e0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center"
          >
            {isPending && <ButtonSpinner />}
            {isPending ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
          </button>
          <p className="text-sm text-gray-600 text-center">
            By placing your order, you agree to our{' '}
            <a href="/terms" className="text-black hover:underline">terms and conditions</a>.
          </p>
        </>
      )}
    </form>
  );
}
