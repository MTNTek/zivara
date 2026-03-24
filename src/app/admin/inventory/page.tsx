import type { Metadata } from 'next';
import { getInventoryList } from '@/features/inventory/actions';
import { InventoryClient } from './inventory-client';

export const metadata: Metadata = {
  title: 'Inventory Management - Zivara Admin',
};

export default async function InventoryPage() {
  const result = await getInventoryList();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500 mt-1">Quick stock adjustments and low-stock monitoring</p>
      </div>
      <InventoryClient initialProducts={result.data || []} />
    </div>
  );
}
