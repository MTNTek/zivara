import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'Unable to verify password' }, { status: 400 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
