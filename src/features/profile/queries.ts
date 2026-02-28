import { db } from '@/db';
import { users, userAddresses } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * Get current user profile information
 */
export async function getUserProfile() {
  const session = await requireAuth();
  const userId = session.user.id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Get all addresses for the current user
 */
export async function getUserAddresses() {
  const session = await requireAuth();
  const userId = session.user.id;

  const addresses = await db.query.userAddresses.findMany({
    where: eq(userAddresses.userId, userId),
    orderBy: (addresses, { desc }) => [desc(addresses.isDefault), desc(addresses.createdAt)],
  });

  return addresses;
}

/**
 * Get a specific address by ID
 */
export async function getAddressById(addressId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const address = await db.query.userAddresses.findFirst({
    where: eq(userAddresses.id, addressId),
  });

  if (!address) {
    throw new Error('Address not found');
  }

  // Verify address belongs to user
  if (address.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return address;
}

/**
 * Get the default address for the current user
 */
export async function getDefaultAddress() {
  const session = await requireAuth();
  const userId = session.user.id;

  const address = await db.query.userAddresses.findFirst({
    where: eq(userAddresses.userId, userId),
    orderBy: (addresses, { desc }) => [desc(addresses.isDefault)],
  });

  return address;
}
