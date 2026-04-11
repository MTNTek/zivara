'use client';

import { useState } from 'react';

interface FAQ {
  category: string;
  questions: { q: string; a: string }[];
}

export function FAQSearch({ faqs }: { faqs: FAQ[] }) {
  const [search, setSearch] = useState('');
  const query = search.toLowerCase().trim();

  const filtered = query
    ? faqs.map(section => ({
        ...section,
        questions: section.questions.filter(
          faq => faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)
        ),
      })).filter(section => section.questions.length > 0)
    : faqs;

  const totalResults = filtered.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <>
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565959]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frequently asked questions..."
            className="w-full pl-10 pr-4 py-3 border border-[#D5D9D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565959] hover:text-[#0F1111]"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {query && (
          <p className="text-xs text-[#565959] mt-2">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{search}&quot;
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        filtered.map((section) => (
          <div key={section.category} className="bg-white rounded-lg p-6 mb-4">
            <h2 className="text-lg font-bold text-[#0F1111] mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#2563eb] rounded-full inline-block" />
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.questions.map((faq, i) => (
                <details key={i} className="group border-b border-[#e7e7e7] last:border-0 pb-4 last:pb-0">
                  <summary className="flex items-start justify-between cursor-pointer list-none text-sm font-medium text-[#0F1111] hover:text-[#2563eb] py-1">
                    <span>{faq.q}</span>
                    <svg className="w-4 h-4 text-[#565959] flex-shrink-0 ml-2 mt-0.5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-sm text-[#565959] mt-2 leading-relaxed pl-0">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-sm text-[#565959] mb-2">No questions match &quot;{search}&quot;</p>
          <button onClick={() => setSearch('')} className="text-sm text-[#2563eb] hover:underline">
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
