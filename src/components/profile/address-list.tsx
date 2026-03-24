'use client';

import { useState, useTransition } from 'react';
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/features/profile/actions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressListProps {
  userId: string;
  addresses?: Address[];
}

const emptyForm = {
  label: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  isDefault: false,
};

export function AddressList({ addresses = [] }: AddressListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({
      label: addr.label || '',
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
    setError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = editingId
        ? await updateAddress(editingId, formData)
        : await addAddress(formData);

      if (result.success) {
        toast.success(editingId ? 'Address updated' : 'Address added');
        setShowForm(false);
        setEditingId(null);
        router.refresh();
      } else {
        setError(result.error || 'Something went wrong');
      }
    });
  };

  const handleDelete = (addressId: string) => {
    if (!confirm('Delete this address?')) return;
    startTransition(async () => {
      const result = await deleteAddress(addressId);
      if (result.success) {
        toast.success('Address deleted');
        router.refresh();
      } else {
        toast.error('Could not delete address', result.error);
      }
    });
  };

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        toast.success('Default address updated');
        router.refresh();
      } else {
        toast.error('Could not set default', result.error);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div>
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 mb-4">No saved addresses yet.</p>
      )}

      {/* Address cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`relative p-4 rounded-lg border-2 transition-colors ${
              addr.isDefault ? 'border-[#2563eb] bg-[#eff6ff]/50' : 'border-gray-200 bg-white'
            } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {addr.isDefault && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-[#2563eb] text-white px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
            {addr.label && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{addr.label}</p>
            )}
            <p className="text-sm text-gray-900 font-medium">{addr.addressLine1}</p>
            {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
            <p className="text-sm text-gray-600">{addr.country}</p>

            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
              <button onClick={() => handleEdit(addr)} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(addr.id)} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                Delete
              </button>
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                  Set as default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      {!showForm && addresses.length < 5 && (
        <button
          onClick={handleAdd}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add new address {addresses.length > 0 && `(${addresses.length}/5)`}
        </button>
      )}

      {/* Address form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            {editingId ? 'Edit Address' : 'New Address'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Label (optional)</label>
              <input name="label" value={formData.label} onChange={handleChange} placeholder="e.g. Home, Work"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <input name="country" value={formData.country} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
            <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Apt, suite, etc. (optional)</label>
            <input name="addressLine2" value={formData.addressLine2} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input name="city" value={formData.city} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <input name="state" value={formData.state} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Postal Code</label>
              <input name="postalCode" value={formData.postalCode} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange}
              className="w-4 h-4 accent-[#2563eb] rounded" />
            <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={isPending}
              className="px-4 py-2 bg-[#fbbf24] text-[#0F1111] text-sm rounded-lg font-medium hover:bg-[#f59e0b] disabled:opacity-50 transition-colors">
              {isPending ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
