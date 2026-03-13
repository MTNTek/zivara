'use client';

import { useState } from 'react';

interface AddressListProps {
  userId: string;
}

export function AddressList({ userId: _userId }: AddressListProps) {
  // userId reserved for future address CRUD operations
  void _userId;
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <p className="text-gray-600 mb-4">Manage your shipping addresses</p>
      
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
      >
        Add New Address
      </button>

      {showForm && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">Address management form would go here</p>
        </div>
      )}
    </div>
  );
}
