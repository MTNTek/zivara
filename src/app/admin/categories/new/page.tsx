'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordConfirmModal } from '@/components/admin/password-confirm-modal';

export default function NewCategoryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowModal(true);
  };

  const handleConfirm = async (password: string) => {
    const verifyRes = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!verifyRes.ok) {
      const data = await verifyRes.json();
      throw new Error(data.error || 'Incorrect password');
    }

    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create category');
    }

    setShowModal(false);
    router.push('/admin/categories');
    router.refresh();
  };

  return (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New Category</h2>
          <Link href="/admin/categories" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Categories
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
              >
                Create Category
              </button>
              <Link
                href="/admin/categories"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      <PasswordConfirmModal
        open={showModal}
        title="Confirm Create"
        message="Enter your admin password to create this category."
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
