'use client';

import { useTransition } from 'react';
import { updateMessageStatus } from '@/features/contact/admin-actions';

interface Props {
  messageId: string;
  currentStatus: string;
}

export function MessageActions({ messageId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateMessageStatus(messageId, status);
    });
  }

  const buttons = [
    { status: 'read', label: 'Read', show: currentStatus === 'new' },
    { status: 'replied', label: 'Replied', show: currentStatus !== 'replied' && currentStatus !== 'archived' },
    { status: 'archived', label: 'Archive', show: currentStatus !== 'archived' },
  ].filter((b) => b.show);

  return (
    <div className="flex gap-1 flex-shrink-0">
      {buttons.map((btn) => (
        <button
          key={btn.status}
          onClick={() => handleStatusChange(btn.status)}
          disabled={isPending}
          className="px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
