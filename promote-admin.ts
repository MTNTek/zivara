import { db, client } from './src/db/index';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function promoteAdmin() {
  try {
    // List all users
    const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users);
    
    if (allUsers.length === 0) {
      console.log('No users found. Go to /register to create the first account.');
      return;
    }

    console.log('Current users:');
    allUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name} (${u.email}) - role: ${u.role}`);
    });

    // Promote the user with email ziva@gmail.com to admin
    const targetUser = allUsers.find(u => u.email === 'ziva@gmail.com') || allUsers[0];
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, targetUser.id));
    console.log(`\n✅ Promoted "${targetUser.name}" (${targetUser.email}) to admin!`);
    console.log('   Go to /admin/dashboard to access the admin panel.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

promoteAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
