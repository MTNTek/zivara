/**
 * Migration script: Backfill Better Auth accounts table for existing users.
 * 
 * NextAuth stored passwords directly in the users table (password_hash column).
 * Better Auth stores passwords in the accounts table with providerId = "credential".
 * This script creates account records for all existing users.
 */
import { config } from 'dotenv';
config();

import { db } from './src/db';
import { users, accounts } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function migrateAccounts() {
  console.log('🔄 Migrating existing users to Better Auth accounts table...\n');

  // Get all users that have a password hash
  const allUsers = await db
    .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
    .from(users);

  console.log(`Found ${allUsers.length} users to migrate.\n`);

  let migrated = 0;
  let skipped = 0;

  for (const user of allUsers) {
    // Check if account already exists
    const existing = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭ ${user.email} - already has account, skipping`);
      skipped++;
      continue;
    }

    if (!user.passwordHash) {
      console.log(`  ⏭ ${user.email} - no password hash, skipping`);
      skipped++;
      continue;
    }

    // Create credential account for Better Auth
    await db.insert(accounts).values({
      userId: user.id,
      accountId: user.id, // Better Auth uses the user ID as account ID for credentials
      providerId: 'credential',
      password: user.passwordHash, // Better Auth stores the hashed password here
    });

    console.log(`  ✅ ${user.email} - account created`);
    migrated++;
  }

  console.log(`\n✅ Migration complete: ${migrated} migrated, ${skipped} skipped`);
  process.exit(0);
}

migrateAccounts().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
