'use client';

import { useState } from 'react';
import { createMarkupRule, updateMarkupRule, deleteMarkupRule } from '@/features/suppliers/markup-actions';
import { useRouter } from 'next/navigation';

interface MarkupRuleRow {
  id: string;
  supplierId: string | null;
  categoryId: string | null;
  productId: string | null;
  supplierName: string | null;
  categoryName: string | null;
  productName: string | null;
  markupType: 'percentage' | 'fixed';
  markupValue: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

interface Option {
  id: string;
  name: string;
}

interface Props {
  rules: MarkupRuleRow[];
  suppliers: Option[];
  categories: Option[];
  products: Option[];
}

export function MarkupRulesClient({ rules, suppliers, categories, products }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<MarkupRuleRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [scopeType, setScopeType] = useState<'supplier' | 'category' | 'product' | 'global'>('global');
  const [scopeId, setScopeId] = useState('');
  const [markupType, setMarkupType] = useState<'percentage' | 'fixed'>('percentage');
  const [markupValue, setMarkupValue] = useState('20');
  const [priority, setPriority] = useState('0');

  function resetForm() {
    setScopeType('global');
    setScopeId('');
    setMarkupType('percentage');
    setMarkupValue('20');
    setPriority('0');
    setEditingRule(null);
    setError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(rule: MarkupRuleRow) {
    setEditingRule(rule);
    if (rule.productId) {
      setScopeType('product');
      setScopeId(rule.productId);
    } else if (rule.categoryId) {
      setScopeType('category');
      setScopeId(rule.categoryId);
    } else if (rule.supplierId) {
      setScopeType('supplier');
      setScopeId(rule.supplierId);
    } else {
      setScopeType('global');
      setScopeId('');
    }
    setMarkupType(rule.markupType);
    setMarkupValue(String(rule.markupValue));
    setPriority(String(rule.priority));
    setError(null);
    setShowForm(true);
  }

  // Price preview calculation
  function getPreviewPrice() {
    const sampleCost = 100;
    const val = parseFloat(markupValue) || 0;
    if (markupType === 'percentage') {
      return (sampleCost * (1 + val / 100)).toFixed(2);
    }
    return (sampleCost + val).toFixed(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const val = parseFloat(markupValue);
    if (isNaN(val) || val < 0) {
      setError('Markup value must be a non-negative number');
      setLoading(false);
      return;
    }

    try {
      if (editingRule) {
        const result = await updateMarkupRule(editingRule.id, {
          markupType,
          markupValue: val,
          priority: parseInt(priority) || 0,
        });
        if (!result.success) {
          setError(result.error ?? 'Failed to update rule');
          setLoading(false);
          return;
        }
      } else {
        const data: Parameters<typeof createMarkupRule>[0] = {
          markupType,
          markupValue: val,
          priority: parseInt(priority) || 0,
        };
        if (scopeType === 'supplier' && scopeId) data.supplierId = scopeId;
        if (scopeType === 'category' && scopeId) data.categoryId = scopeId;
        if (scopeType === 'product' && scopeId) data.productId = scopeId;

        const result = await createMarkupRule(data);
        if (!result.success) {
          setError(result.error ?? 'Failed to create rule');
          setLoading(false);
          return;
        }
      }

      setShowForm(false);
      resetForm();
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(ruleId: string) {
    if (!confirm('Are you sure you want to delete this markup rule?')) return;
    setLoading(true);
    setError(null);

    const result = await deleteMarkupRule(ruleId);
    if (!result.success) {
      setError(result.error ?? 'Failed to delete rule');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  async function handleToggleActive(rule: MarkupRuleRow) {
    setLoading(true);
    setError(null);

    const result = await updateMarkupRule(rule.id, { isActive: !rule.isActive });
    if (!result.success) {
      setError(result.error ?? 'Failed to update rule');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  function getScopeLabel(rule: MarkupRuleRow) {
    if (rule.productName) return `Product: ${rule.productName}`;
    if (rule.categoryName) return `Category: ${rule.categoryName}`;
    if (rule.supplierName) return `Supplier: ${rule.supplierName}`;
    return 'Global (no scope)';
  }

  function getScopeOptions() {
    switch (scopeType) {
      case 'supplier':
        return suppliers;
      case 'category':
        return categories;
      case 'product':
        return products;
      default:
        return [];
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Markup Rules</h1>
              <p className="mt-2 text-gray-600">
                Manage pricing markup rules ({rules.length} rules)
              </p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Rule
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="mt-1 text-xs text-red-600 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRule ? 'Edit Markup Rule' : 'Create Markup Rule'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Scope */}
              {!editingRule && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="scopeType" className="block text-sm font-medium text-gray-700 mb-1">
                      Scope
                    </label>
                    <select
                      id="scopeType"
                      value={scopeType}
                      onChange={(e) => {
                        setScopeType(e.target.value as 'supplier' | 'category' | 'product' | 'global');
                        setScopeId('');
                      }}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="global">Global (no scope)</option>
                      <option value="supplier">Supplier</option>
                      <option value="category">Category</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  {scopeType !== 'global' && (
                    <div>
                      <label htmlFor="scopeId" className="block text-sm font-medium text-gray-700 mb-1">
                        {scopeType.charAt(0).toUpperCase() + scopeType.slice(1)}
                      </label>
                      <select
                        id="scopeId"
                        value={scopeId}
                        onChange={(e) => setScopeId(e.target.value)}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select {scopeType}...</option>
                        {getScopeOptions().map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Markup Type & Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="markupType" className="block text-sm font-medium text-gray-700 mb-1">
                    Markup Type
                  </label>
                  <select
                    id="markupType"
                    value={markupType}
                    onChange={(e) => setMarkupType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="markupValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Markup Value
                  </label>
                  <input
                    id="markupValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={markupValue}
                    onChange={(e) => setMarkupValue(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    id="priority"
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  Price Preview: A product with a $100.00 cost price would have a display price of{' '}
                  <span className="font-semibold">${getPreviewPrice()}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA]"
                >
                  {loading ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rules Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-sm">No markup rules defined yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Products will use the default 20% markup
                        </p>
                        <button
                          onClick={openCreate}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900"
                        >
                          Create your first rule
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getScopeLabel(rule)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {rule.markupType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.markupType === 'percentage'
                          ? `${rule.markupValue}%`
                          : `$${rule.markupValue.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          disabled={loading}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            rule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEdit(rule)}
                          className="text-black hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
