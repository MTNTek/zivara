import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getUserProfile } from '@/features/profile/queries';
import { getUserOrders } from '@/features/orders/queries';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { DeleteAccount } from '@/components/profile/delete-account';
import { AddressList } from '@/components/profile/address-list';
import { getUserAddresses } from '@/features/profile/queries';
import { getWishlistItems } from '@/features/wishlist/actions';
import { getUserReviews } from '@/features/reviews/queries';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'My Profile - Zivara',
  description: 'Manage your account settings and addresses.',
};

export default async function ProfilePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect('/login?redirect=/profile');
  }

  const [user, ordersResult, addresses, wishlistItems, reviewsResult] = await Promise.all([
    getUserProfile(),
    getUserOrders(session.user.id, { page: 1, limit: 3 }),
    getUserAddresses(),
    getWishlistItems(),
    getUserReviews(session.user.id, { page: 1, limit: 1 }),
  ]);

  const recentOrders = ordersResult.orders;
  const totalOrders = ordersResult.pagination.total;
  const totalReviews = reviewsResult.pagination.total;

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Breadcrumbs items={[{ label: 'My Profile' }]} />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-sm text-gray-500 mb-8">
          Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
        </p>

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
              <AddressList userId={session.user.id} addresses={addresses} />
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <ChangePasswordForm />
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-red-100">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              <DeleteAccount />
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Activity</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Link href="/orders" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="text-2xl font-bold text-[#0F1111]">{totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Orders</p>
                </Link>
                <Link href="/wishlist" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="text-2xl font-bold text-[#0F1111]">{wishlistItems.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Wishlist</p>
                </Link>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#0F1111]">{totalReviews}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Reviews</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <nav className="space-y-1">
                {session.user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="flex items-center gap-3 text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-4 py-2.5 rounded-lg font-medium mb-3 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </Link>
                <Link href="/cart" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Shopping Cart
                </Link>
                <Link href="/products" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Products
                </Link>
                <Link href="/track" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Track Order
                </Link>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <SignOutButton />
                </div>
              </nav>
            </div>

            {/* Recent Orders Preview */}
            {recentOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/orders" className="text-sm text-[#2563eb] hover:text-[#1d4ed8]">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">#{order.orderNumber}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-[#eff6ff] text-[#2563eb]' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      {/* Item thumbnails */}
                      {order.items && order.items.length > 0 && (
                        <div className="flex gap-1 my-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {item.product?.images?.[0]?.imageUrl ? (
                                <img src={item.product.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-300" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500 font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 font-medium">${Number(order.total).toFixed(2)}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
