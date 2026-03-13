import { NextResponse } from 'next/server';
import { getCartItemCount } from '@/features/cart/queries';

export async function GET() {
  const count = await getCartItemCount();
  return NextResponse.json({ count });
}
