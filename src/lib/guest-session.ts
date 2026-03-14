'use server';

import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const GUEST_SESSION_KEY = 'zivara_guest_session';

/**
 * Get or create a guest session ID from cookies.
 * Used for guest cart functionality.
 */
export async function getGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_SESSION_KEY)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  cookieStore.set(GUEST_SESSION_KEY, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return sessionId;
}

/**
 * Read the guest session ID without creating one.
 */
export async function readGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_SESSION_KEY)?.value ?? null;
}
