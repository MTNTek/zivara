'use client';

import { useState } from 'react';
import { exportOrdersToCSV } from '@/features/admin/export-actions';

interface OrderExportButtonProps {
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    orderNumber?: string;
  };
}

/**
 * Export orders to CSV button
 * Validates: Requirement 21.6
 */
export function OrderExportButton({ filters }: OrderExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // Convert string dates to Date objects
      const exportFilters = {
        status: filters?.status,
        startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
        userId: filters?.userId,
        orderNumber: filters?.orderNumber,
      };

      const result = await exportOrdersToCSV(exportFilters);

      if (result.success && result.data) {
        // Create a blob from the CSV data
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        
        // Create a download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `orders-export-${timestamp}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Failed to export orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export orders');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isExporting ? 'Exporting...' : 'Export to CSV'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
