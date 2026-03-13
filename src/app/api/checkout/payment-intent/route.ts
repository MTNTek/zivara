import { NextResponse } from 'next/server';
import { createCheckoutPaymentIntent } from '@/features/orders/actions';

export async function POST() {
  const result = await createCheckoutPaymentIntent();

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to create payment intent' },
      { status: 400 }
    );
  }

  return NextResponse.json(result.data);
}
