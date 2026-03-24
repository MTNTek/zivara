'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ButtonSpinner } from '@/components/ui/spinner';

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  isPending: boolean;
}

export function StripePaymentForm({ onSuccess, onError, isPending }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  const disabled = !stripe || isProcessing || isPending;

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled}
        className="w-full bg-[#fbbf24] text-[#0F1111] px-6 py-4 min-h-[44px] rounded-lg font-semibold hover:bg-[#f59e0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center"
      >
        {(isProcessing || isPending) && <ButtonSpinner />}
        {isProcessing ? 'Processing payment...' : isPending ? 'Placing order...' : 'Pay & Place Order'}
      </button>
      <p className="text-sm text-gray-600 text-center">
        By placing your order, you agree to our terms and conditions.
      </p>
    </div>
  );
}
