'use server';

import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateMessageStatus(messageId: string, status: string) {
  const validStatuses = ['new', 'read', 'replied', 'archived'];
  if (!validStatuses.includes(status)) return;

  await db
    .update(contactMessages)
    .set({ status })
    .where(eq(contactMessages.id, messageId));

  revalidatePath('/admin/messages');
}
