import { NextResponse } from 'next/server';
import { getUserAddresses } from '@/features/profile/queries';

export async function GET() {
  try {
    const addresses = await getUserAddresses();
    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ addresses: [] });
  }
}
