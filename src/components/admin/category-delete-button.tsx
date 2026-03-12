'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PasswordConfirmModal } from './password-confirm-modal';

export function CategoryDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async (password: string) => {
    // Verify password first
    const verifyRes = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!verifyRes.ok) {
      const data = await verifyRes.json();
      throw new Error(data.error || 'Incorrect password');
    }

    // Then delete
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete');
    }

    setShowModal(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>
      <PasswordConfirmModal
        open={showModal}
        title="Delete Category"
        message={`Enter your admin password to delete "${name}".`}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
