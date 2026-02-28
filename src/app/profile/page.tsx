import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { getUserById } from '@/features/profile/queries';
import { ProfileForm } from '@/components/profile/profile-form';
import { AddressList } from '@/components/profile/address-list';

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    redirect('/login?redirect=/profile');
  }

  const user = await getUserById(userId);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <AddressList userId={userId} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <nav className="space-y-2">
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
