import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getUserProfile } from '@/features/profile/queries';
import { ProfileForm } from '@/components/profile/profile-form';
import { AddressList } from '@/components/profile/address-list';

export default async function ProfilePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect('/login?redirect=/profile');
  }

  const user = await getUserProfile();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <ProfileForm user={user} />
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Addresses</h2>
              <AddressList userId={session.user.id} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <nav className="space-y-2">
                {session.user.role === 'admin' && (
                  <a href="/admin/dashboard" className="block text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg font-medium text-center mb-3">
                    Admin Dashboard
                  </a>
                )}
                <a href="/orders" className="block text-teal-600 hover:text-teal-700">
                  My Orders
                </a>
                <a href="/cart" className="block text-teal-600 hover:text-teal-700">
                  Shopping Cart
                </a>
                <a href="/products" className="block text-teal-600 hover:text-teal-700">
                  Browse Products
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
