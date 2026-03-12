'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordConfirmModal } from '@/components/admin/password-confirm-modal';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export function CategoryEditForm({ category }: { category: Category }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  });

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

    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update category');
    }

    setShowModal(false);
    router.push('/admin/categories');
    router.refresh();
  };

  return (
    <>
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
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Save Changes
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

      <PasswordConfirmModal
        open={showModal}
        title="Confirm Edit"
        message="Enter your admin password to save changes."
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
