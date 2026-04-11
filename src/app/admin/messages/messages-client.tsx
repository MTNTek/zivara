'use client';

import { useState } from 'react';
import { MessageActions } from './message-actions';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

interface Counts {
  total: number;
  newCount: number;
  readCount: number;
  repliedCount: number;
  archivedCount: number;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  replied: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export function MessagesClient({ messages, counts }: { messages: Message[]; counts: Counts }) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = messages.filter((msg) => {
    if (activeTab !== 'all' && msg.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.subject.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All', count: counts.total },
    { key: 'new', label: 'New', count: counts.newCount },
    { key: 'read', label: 'Read', count: counts.readCount },
    { key: 'replied', label: 'Replied', count: counts.repliedCount },
    { key: 'archived', label: 'Archived', count: counts.archivedCount },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">New</p>
          <p className="text-2xl font-bold text-blue-600">{counts.newCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Read</p>
          <p className="text-2xl font-bold text-gray-600">{counts.readCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Replied</p>
          <p className="text-2xl font-bold text-green-600">{counts.repliedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-blue-200' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} message{filtered.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </p>

      {/* Messages List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">{search || activeTab !== 'all' ? 'No messages match your filters' : 'No messages yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${msg.status === 'new' ? 'border-l-blue-500' : 'border-l-transparent'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{msg.name}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <a href={`mailto:${msg.email}`} className="text-xs text-[#2563eb] hover:underline">{msg.email}</a>
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
