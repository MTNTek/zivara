'use client';

import { useState } from 'react';
import { saveStoreSettings, type StoreSettingsData } from '@/features/admin/settings-actions';

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#0F52BA]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function SettingsClient({ initialSettings }: { initialSettings: StoreSettingsData }) {
  const [settings, setSettings] = useState<StoreSettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'notifications' | 'shipping'>('general');

  const update = (key: keyof StoreSettingsData, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const result = await saveStoreSettings(settings);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error || 'Failed to save');
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'payments' as const, label: 'Payments', icon: '💳' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'shipping' as const, label: 'Shipping & Tax', icon: '📦' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Settings tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0F52BA] text-[#0F52BA]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input type="text" value={settings.storeName} onChange={e => update('storeName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                <input type="email" value={settings.storeEmail} onChange={e => update('storeEmail', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={settings.currency} onChange={e => update('currency', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input type="email" value={settings.fromEmail} onChange={e => update('fromEmail', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <Toggle enabled={settings.twoFactor} onChange={v => update('twoFactor', v)} label="Two-factor authentication" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                  <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                </div>
                <select value={settings.sessionTimeout} onChange={e => update('sessionTimeout', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]">
                  <option value="1">1 hour</option>
                  <option value="4">4 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="72">3 days</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Show maintenance page to customers</p>
                </div>
                <Toggle enabled={settings.maintenanceMode} onChange={v => update('maintenanceMode', v)} label="Maintenance mode" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Stripe</p>
                    <p className="text-xs text-gray-500">Accept credit cards, Apple Pay, Google Pay</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">● Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Test Mode</p>
                  <p className="text-sm text-gray-500">Use test API keys for development</p>
                </div>
                <Toggle enabled={settings.testMode} onChange={v => update('testMode', v)} label="Test mode" />
              </div>
              {settings.testMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">⚠️ Test mode is active. No real charges will be processed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">New Order Alerts</p>
                <p className="text-sm text-gray-500">Get notified when a new order is placed</p>
              </div>
              <Toggle enabled={settings.orderNotifications} onChange={v => update('orderNotifications', v)} label="Order notifications" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
                <p className="text-sm text-gray-500">Get notified when products are running low</p>
              </div>
              <Toggle enabled={settings.lowStockAlerts} onChange={v => update('lowStockAlerts', v)} label="Low stock alerts" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">New Review Alerts</p>
                <p className="text-sm text-gray-500">Get notified when customers leave reviews</p>
              </div>
              <Toggle enabled={settings.reviewNotifications} onChange={v => update('reviewNotifications', v)} label="Review notifications" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">●</span>
              <span className="text-sm text-gray-600">Email service connected (Resend)</span>
            </div>
          </div>
        </div>
      )}

      {/* Shipping & Tax Tab */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
                <input type="number" value={settings.freeShippingThreshold} onChange={e => update('freeShippingThreshold', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]" min="0" step="1" />
                <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={e => update('taxRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]" min="0" max="100" step="0.01" />
                <p className="text-xs text-gray-500 mt-1">Applied to all orders unless overridden</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between sticky bottom-4">
        <p className="text-sm text-gray-500">
          {saved ? (
            <span className="text-green-600 font-medium">✓ Settings saved to database</span>
          ) : error ? (
            <span className="text-red-600 font-medium">{error}</span>
          ) : (
            'Changes will be saved to the database'
          )}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 text-sm font-medium text-white bg-[#0F52BA] rounded-lg hover:bg-[#0D47A1] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
