import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { MessageActions } from './message-actions';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);

  const [counts] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      newCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'new' THEN 1 END)::int`,
      readCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'read' THEN 1 END)::int`,
      repliedCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'replied' THEN 1 END)::int`,
      archivedCount: sql<number>`COUNT(CASE WHEN ${contactMessages.status} = 'archived' THEN 1 END)::int`,
    })
    .from(contactMessages);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">New</p>
          <p className="text-2xl font-bold text-blue-600">{counts?.newCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Read</p>
          <p className="text-2xl font-bold text-gray-600">{counts?.readCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Replied</p>
          <p className="text-2xl font-bold text-green-600">{counts?.repliedCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{counts?.total ?? 0}</p>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${msg.status === 'new' ? 'border-l-blue-500' : 'border-l-transparent'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{msg.name}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <a href={`mailto:${msg.email}`} className="text-xs text-[#007185] hover:underline">{msg.email}</a>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[msg.status] || 'bg-gray-100 text-gray-800'}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{msg.subject}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">{msg.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <MessageActions messageId={msg.id} currentStatus={msg.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
