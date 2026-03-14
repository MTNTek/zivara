export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  return (
    <div>
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                defaultValue="Zivara"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Email
              </label>
              <input
                type="email"
                defaultValue="admin@zivara.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
                disabled
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Stripe Integration</p>
                <p className="text-sm text-gray-500">Accept credit card payments</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-green-600 mr-2">●</span>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Test Mode</p>
                <p className="text-sm text-gray-500">Use test API keys</p>
              </div>
              <button
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md"
                disabled
              >
                Enabled
              </button>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Service</p>
                <p className="text-sm text-gray-500">Resend integration for transactional emails</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-green-600 mr-2">●</span>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                defaultValue="noreply@zivara.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <button
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md"
                disabled
              >
                Disabled
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-500">Auto logout after inactivity</p>
              </div>
              <span className="text-sm text-gray-600">24 hours</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Settings are currently read-only. Contact your system administrator to modify these values.
          </p>
        </div>
      </div>
    </div>
  );
}
