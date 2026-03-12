/**
 * Checkpoint 3 Verification Script
 * 
 * This script verifies that the database and authentication system are properly set up.
 * Run with: npx tsx scripts/verify-checkpoint-3.ts
 */

import { db, client } from '../src/db';
import { users } from '../src/db/schema';
import { hashPassword, verifyPassword } from '../src/lib/password';
import { eq } from 'drizzle-orm';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
}

async function testDatabaseConnection() {
  try {
    await db.execute('SELECT 1');
    logTest('Database Connection', true, 'Successfully connected to PostgreSQL');
    return true;
  } catch (error) {
    logTest('Database Connection', false, `Failed to connect: ${error}`);
    return false;
  }
}

async function testTablesExist() {
  try {
    const tables = [
      'users',
      'categories',
      'products',
      'product_images',
      'inventory',
      'cart_items',
      'orders',
      'order_items',
      'order_status_history',
      'reviews',
      'user_addresses',
      'price_history',
      'sessions',
      'audit_logs',
    ];

    for (const table of tables) {
      const result = await db.execute(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        )`
      );
      
      if (!result.rows[0]?.exists) {
        logTest('Table Existence', false, `Table '${table}' does not exist`);
        return false;
      }
    }

    logTest('Table Existence', true, `All ${tables.length} required tables exist`);
    return true;
  } catch (error) {
    logTest('Table Existence', false, `Failed to check tables: ${error}`);
    return false;
  }
}

async function testPasswordHashing() {
  try {
    const password = 'TestPassword123';
    const hash = await hashPassword(password);

    // Check hash format (bcrypt)
    if (!hash.startsWith('$2b$12$')) {
      logTest('Password Hashing', false, 'Hash does not use bcrypt with 12 rounds');
      return false;
    }

    // Check hash length
    if (hash.length !== 60) {
      logTest('Password Hashing', false, `Hash length is ${hash.length}, expected 60`);
      return false;
    }

    // Test verification
    const isValid = await verifyPassword(password, hash);
    if (!isValid) {
      logTest('Password Hashing', false, 'Password verification failed');
      return false;
    }

    // Test wrong password
    const isInvalid = await verifyPassword('WrongPassword', hash);
    if (isInvalid) {
      logTest('Password Hashing', false, 'Wrong password was accepted');
      return false;
    }

    logTest('Password Hashing', true, 'Bcrypt hashing with 12 rounds works correctly');
    return true;
  } catch (error) {
    logTest('Password Hashing', false, `Failed: ${error}`);
    return false;
  }
}

async function testUserCreation() {
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';
    const passwordHash = await hashPassword(testPassword);

    // Create test user
    const [newUser] = await db
      .insert(users)
      .values({
        email: testEmail,
        name: 'Test User',
        passwordHash,
        role: 'customer',
        isActive: true,
      })
      .returning();

    if (!newUser) {
      logTest('User Creation', false, 'Failed to create user');
      return false;
    }

    // Verify user exists
    const foundUser = await db.query.users.findFirst({
      where: eq(users.email, testEmail),
    });

    if (!foundUser) {
      logTest('User Creation', false, 'User not found after creation');
      return false;
    }

    // Verify password
    const isValidPassword = await verifyPassword(testPassword, foundUser.passwordHash);
    if (!isValidPassword) {
      logTest('User Creation', false, 'Password verification failed');
      return false;
    }

    // Verify role
    if (foundUser.role !== 'customer') {
      logTest('User Creation', false, `Role is '${foundUser.role}', expected 'customer'`);
      return false;
    }

    // Clean up test user
    await db.delete(users).where(eq(users.email, testEmail));

    logTest('User Creation', true, 'User created, verified, and cleaned up successfully');
    return true;
  } catch (error) {
    logTest('User Creation', false, `Failed: ${error}`);
    return false;
  }
}

async function testForeignKeyConstraints() {
  try {
    // Check if foreign keys are enforced
    const result = await db.execute(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `);

    const foreignKeys = result.rows;
    if (foreignKeys.length === 0) {
      logTest('Foreign Key Constraints', false, 'No foreign keys found');
      return false;
    }

    logTest('Foreign Key Constraints', true, `${foreignKeys.length} foreign key constraints established`);
    return true;
  } catch (error) {
    logTest('Foreign Key Constraints', false, `Failed: ${error}`);
    return false;
  }
}

async function testIndexes() {
  try {
    const result = await db.execute(`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN (
          'users', 'products', 'categories', 'orders', 
          'cart_items', 'reviews', 'product_images'
        )
    `);

    const indexes = result.rows;
    if (indexes.length === 0) {
      logTest('Database Indexes', false, 'No indexes found on key tables');
      return false;
    }

    logTest('Database Indexes', true, `${indexes.length} indexes created for performance`);
    return true;
  } catch (error) {
    logTest('Database Indexes', false, `Failed: ${error}`);
    return false;
  }
}

async function runVerification() {
  console.log('\n🔍 Starting Checkpoint 3 Verification...\n');
  console.log('=' .repeat(60));
  console.log('\n');

  // Test 1: Database Connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Database connection failed. Cannot proceed with other tests.');
    console.log('Please ensure PostgreSQL is running and DATABASE_URL is correct.\n');
    await cleanup();
    return;
  }

  console.log('');

  // Test 2: Tables Exist
  await testTablesExist();
  console.log('');

  // Test 3: Foreign Keys
  await testForeignKeyConstraints();
  console.log('');

  // Test 4: Indexes
  await testIndexes();
  console.log('');

  // Test 5: Password Hashing
  await testPasswordHashing();
  console.log('');

  // Test 6: User Creation
  await testUserCreation();
  console.log('');

  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 Verification Summary:\n');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`Tests Passed: ${passed}/${total} (${percentage}%)\n`);

  if (passed === total) {
    console.log('✅ All verification tests passed!');
    console.log('✅ Database and auth setup is complete and working correctly.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test user registration via UI: http://localhost:3000/register');
    console.log('   2. Test user login via UI: http://localhost:3000/login');
    console.log('   3. Test admin route protection: http://localhost:3000/admin/dashboard');
    console.log('   4. Mark Checkpoint 3 as complete');
    console.log('   5. Proceed to Task 4: Build core product catalog system\n');
  } else {
    console.log('❌ Some tests failed. Please review the errors above.');
    console.log('\n📝 Troubleshooting:');
    console.log('   - Check CHECKPOINT_3_VERIFICATION.md for detailed guidance');
    console.log('   - Ensure migrations ran successfully: npm run db:migrate');
    console.log('   - Verify DATABASE_URL in .env file');
    console.log('   - Check PostgreSQL logs for errors\n');
  }

  await cleanup();
}

async function cleanup() {
  try {
    await client.end();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run verification
runVerification().catch((error) => {
  console.error('\n❌ Verification script failed:', error);
  cleanup();
  process.exit(1);
});
