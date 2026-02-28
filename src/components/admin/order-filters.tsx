'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface OrderFiltersProps {
  currentFilters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    orderNumber?: string;
  };
}

/**
 * Order filtering component for admin
 * Validates: Requirement 21.2
 */
export function OrderFilters({ currentFilters }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState(currentFilters.status || '');
  const [startDate, setStartDate] = useState(currentFilters.startDate || '');
  const [endDate, setEndDate] = useState(currentFilters.endDate || '');
  const [orderNumber, setOrderNumber] = useState(currentFilters.orderNumber || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    if (startDate) {
      params.set('startDate', startDate);
    } else {
      params.delete('startDate');
    }
    
    if (endDate) {
      params.set('endDate', endDate);
    } else {
      params.delete('endDate');
    }
    
    if (orderNumber) {
      params.set('orderNumber', orderNumber);
    } else {
      params.delete('orderNumber');
    }
    
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setOrderNumber('');
    router.push('/admin/orders');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Start Date Filter */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Order Number Search */}
        <div>
          <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Order Number
          </label>
          <input
            type="text"
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Search by order number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleApplyFilters}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
