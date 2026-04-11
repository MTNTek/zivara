import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { MessagesClient } from './messages-client';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);

  const [counts] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      newCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'new' THEN 1 END)::int`,
      readCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'read' THEN 1 END)::int`,
      repliedCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'replied' THEN 1 END)::int`,
      archivedCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'archived' THEN 1 END)::int`,
    })
    .from(contactMessages);

  return (
    <MessagesClient
      messages={messages}
      counts={{
        total: counts?.total ?? 0,
        newCount: counts?.newCount ?? 0,
        readCount: counts?.readCount ?? 0,
        repliedCount: counts?.repliedCount ?? 0,
        archivedCount: counts?.archivedCount ?? 0,
      }}
    />
  );
}
