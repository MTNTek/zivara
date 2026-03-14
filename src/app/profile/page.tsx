import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getUserProfile } from '@/features/profile/queries';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const metadata: Metadata = {
  title: 'My Profile - Zivara',
  description: 'Manage your account settings and addresses.',
};
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

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <ChangePasswordForm />
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <nav className="space-y-2">
                {session.user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="block text-white bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg font-medium text-center mb-3">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/orders" className="block text-black hover:text-blue-800">
                  My Orders
                </Link>
                <Link href="/wishlist" className="block text-black hover:text-blue-800">
                  Wishlist
                </Link>
                <Link href="/cart" className="block text-black hover:text-blue-800">
                  Shopping Cart
                </Link>
                <Link href="/products" className="block text-black hover:text-blue-800">
                  Browse Products
                </Link>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <SignOutButton />
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
