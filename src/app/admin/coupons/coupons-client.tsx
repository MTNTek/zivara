'use client';

import { useState, useTransition } from 'react';
import { toggleCouponStatus, createCouponAction } from '@/features/coupons/admin-actions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function CouponsClient({ coupons: initialCoupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    expiresAt: '',
  });

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      const result = await toggleCouponStatus(id, !currentActive);
      if (result.success) {
        toast.success(currentActive ? 'Coupon deactivated' : 'Coupon activated', '');
        router.refresh();
      } else {
        toast.error('Error', result.error || 'Failed to update');
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCouponAction({
        code: form.code.toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderAmount: form.minOrderAmount || undefined,
        maxDiscountAmount: form.maxDiscountAmount || undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      if (result.success) {
        toast.success('Coupon created', '');
        setShowCreate(false);
        setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', perUserLimit: '1', expiresAt: '' });
        router.refresh();
      } else {
        toast.error('Error', result.error || 'Failed to create');
      }
    });
  };

  return (
    <div>
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="mb-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
      >
        {showCreate ? 'Cancel' : '+ New Coupon'}
      </button>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
            <input type="text" required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm uppercase" placeholder="e.g. SUMMER30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional description" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as 'percentage' | 'fixed' }))}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
            <input type="number" required step="0.01" min="0" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={form.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 20.00'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Amount</label>
            <input type="number" step="0.01" min="0" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Discount</label>
            <input type="number" step="0.01" min="0" value={form.maxDiscountAmount} onChange={e => setForm(p => ({ ...p, maxDiscountAmount: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional cap" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
            <input type="number" min="0" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Unlimited" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Per-User Limit</label>
            <input type="number" min="0" value={form.perUserLimit} onChange={e => setForm(p => ({ ...p, perUserLimit: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Expires At</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isPending}
              className="px-6 py-2 bg-[#fbbf24] text-[#0F1111] rounded-lg text-sm font-medium hover:bg-[#f59e0b] transition-colors disabled:opacity-50">
              {isPending ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Min Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-[#0F1111]">{c.code}</span>
                    {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                    {c.maxDiscountAmount && <span className="text-xs text-gray-400 ml-1">(max ${c.maxDiscountAmount})</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                    {c.minOrderAmount ? `$${c.minOrderAmount}` : '—'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggle(c.id, c.isActive)}
                      disabled={isPending}
                      className="text-xs text-[#2563eb] hover:underline disabled:opacity-50"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {initialCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No coupons yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
