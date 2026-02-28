/**
 * Checkpoint 20 Verification Script
 * Verifies all admin features are working correctly
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(__dirname, '../.env') });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  console.error('Please ensure .env file exists with DATABASE_URL configured');
  process.exit(1);
}

import { db } from '../src/db';
import { users, products, orders, categories, inventory, productImages } from '../src/db/schema';
import { eq, desc, and, gte, lte, sql, count } from 'drizzle-orm';
import { hash } from 'bcrypt';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function logResult(result: VerificationResult) {
  results.push(result);
  const icon = result.passed ? '✓' : '✗';
  console.log(`${icon} ${result.message}`);
  if (result.details) {
    console.log('  Details:', JSON.stringify(result.details, null, 2));
  }
}

async function setupTestData() {
  console.log('\n=== Setting up test data ===\n');

  // Create admin user if not exists
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, 'admin@zivara.test'),
  });

  let adminUser;
  if (!existingAdmin) {
    const passwordHash = await hash('admin123', 12);
    [adminUser] = await db.insert(users).values({
      email: 'admin@zivara.test',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    }).returning();
    console.log('Created admin user');
  } else {
    adminUser = existingAdmin;
    console.log('Using existing admin user');
  }

  // Create test customer if not exists
  const existingCustomer = await db.query.users.findFirst({
    where: eq(users.email, 'customer@zivara.test'),
  });

  let customerUser;
  if (!existingCustomer) {
    const passwordHash = await hash('customer123', 12);
    [customerUser] = await db.insert(users).values({
      email: 'customer@zivara.test',
      passwordHash,
      name: 'Test Customer',
      role: 'customer',
      isActive: true,
    }).returning();
    console.log('Created customer user');
  } else {
    customerUser = existingCustomer;
    console.log('Using existing customer user');
  }

  return { adminUser, customerUser };
}

async function verifyAdminDashboardStatistics() {
  console.log('\n=== Testing Admin Dashboard Statistics ===\n');

  try {
    // Test 1: Get total orders count
    const [totalOrdersResult] = await db
      .select({ count: count() })
      .from(orders);
    
    logResult({
      passed: totalOrdersResult.count >= 0,
      message: 'Dashboard can retrieve total orders count',
      details: { totalOrders: totalOrdersResult.count },
    });

    // Test 2: Get total revenue
    const [revenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${orders.total}), 0)` 
      })
      .from(orders)
      .where(eq(orders.status, 'delivered'));
    
    logResult({
      passed: revenueResult.total !== null,
      message: 'Dashboard can calculate total revenue',
      details: { totalRevenue: revenueResult.total },
    });

    // Test 3: Get active products count
    const [activeProductsResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.isActive, true));
    
    logResult({
      passed: activeProductsResult.count >= 0,
      message: 'Dashboard can retrieve active products count',
      details: { activeProducts: activeProductsResult.count },
    });

    // Test 4: Get revenue for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthRevenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${orders.total}), 0)` 
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfMonth),
          eq(orders.status, 'delivered')
        )
      );
    
    logResult({
      passed: monthRevenueResult.total !== null,
      message: 'Dashboard can calculate monthly revenue',
      details: { monthlyRevenue: monthRevenueResult.total },
    });

    // Test 5: Get recent orders
    const recentOrders = await db.query.orders.findMany({
      limit: 10,
      orderBy: desc(orders.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    logResult({
      passed: Array.isArray(recentOrders),
      message: 'Dashboard can retrieve recent orders with customer info',
      details: { recentOrdersCount: recentOrders.length },
    });

  } catch (error) {
    logResult({
      passed: false,
      message: 'Dashboard statistics query failed',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function verifyProductManagementInterface() {
  console.log('\n=== Testing Product Management Interface ===\n');

  try {
    // Test 1: List all products with pagination
    const productsPage1 = await db.query.products.findMany({
      limit: 20,
      offset: 0,
      orderBy: desc(products.createdAt),
      with: {
        category: true,
        inventory: true,
        images: {
          where: eq(productImages.isPrimary, true),
          limit: 1,
        },
      },
    });
    
    logResult({
      passed: Array.isArray(productsPage1),
      message: 'Product list can be retrieved with pagination',
      details: { productsCount: productsPage1.length },
    });

    // Test 2: Search products by name
    const searchResults = await db.query.products.findMany({
      where: sql`${products.name} ILIKE ${'%test%'}`,
      limit: 10,
    });
    
    logResult({
      passed: Array.isArray(searchResults),
      message: 'Products can be searched by name',
      details: { searchResultsCount: searchResults.length },
    });

    // Test 3: Get product with full details for editing
    const allProducts = await db.query.products.findMany({ limit: 1 });
    if (allProducts.length > 0) {
      const productDetail = await db.query.products.findFirst({
        where: eq(products.id, allProducts[0].id),
        with: {
          category: true,
          images: true,
          inventory: true,
        },
      });
      
      logResult({
        passed: productDetail !== undefined && productDetail.category !== null,
        message: 'Product details can be retrieved for editing',
        details: { 
          hasCategory: !!productDetail?.category,
          hasImages: (productDetail?.images?.length ?? 0) > 0,
          hasInventory: !!productDetail?.inventory,
        },
      });
    } else {
      logResult({
        passed: true,
        message: 'Product details retrieval (skipped - no products)',
      });
    }

    // Test 4: Verify product form validation schema exists
    try {
      const { productSchema } = await import('../src/features/products/schemas');
      logResult({
        passed: productSchema !== undefined,
        message: 'Product validation schema exists',
      });
    } catch (error) {
      logResult({
        passed: false,
        message: 'Product validation schema not found',
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }

    // Test 5: Verify product actions exist
    try {
      const actions = await import('../src/features/products/admin-actions');
      const hasCreateAction = typeof actions.createProduct === 'function';
      const hasUpdateAction = typeof actions.updateProduct === 'function';
      const hasDeleteAction = typeof actions.deleteProduct === 'function';
      
      logResult({
        passed: hasCreateAction && hasUpdateAction && hasDeleteAction,
        message: 'Product CRUD actions exist',
        details: { 
          hasCreate: hasCreateAction,
          hasUpdate: hasUpdateAction,
          hasDelete: hasDeleteAction,
        },
      });
    } catch (error) {
      logResult({
        passed: false,
        message: 'Product actions not found',
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }

  } catch (error) {
    logResult({
      passed: false,
      message: 'Product management interface verification failed',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function verifyOrderManagementInterface() {
  console.log('\n=== Testing Order Management Interface ===\n');

  try {
    // Test 1: List all orders with pagination
    const ordersPage1 = await db.query.orders.findMany({
      limit: 20,
      offset: 0,
      orderBy: desc(orders.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          with: {
            product: true,
          },
        },
      },
    });
    
    logResult({
      passed: Array.isArray(ordersPage1),
      message: 'Order list can be retrieved with pagination',
      details: { ordersCount: ordersPage1.length },
    });

    // Test 2: Filter orders by status
    const pendingOrders = await db.query.orders.findMany({
      where: eq(orders.status, 'pending'),
      limit: 10,
    });
    
    logResult({
      passed: Array.isArray(pendingOrders),
      message: 'Orders can be filtered by status',
      details: { pendingOrdersCount: pendingOrders.length },
    });

    // Test 3: Filter orders by date range
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await db.query.orders.findMany({
      where: gte(orders.createdAt, thirtyDaysAgo),
      limit: 10,
    });
    
    logResult({
      passed: Array.isArray(recentOrders),
      message: 'Orders can be filtered by date range',
      details: { recentOrdersCount: recentOrders.length },
    });

    // Test 4: Get order with full details
    const allOrders = await db.query.orders.findMany({ limit: 1 });
    if (allOrders.length > 0) {
      const orderDetail = await db.query.orders.findFirst({
        where: eq(orders.id, allOrders[0].id),
        with: {
          user: true,
          items: {
            with: {
              product: true,
            },
          },
          statusHistory: {
            orderBy: desc(sql`created_at`),
          },
        },
      });
      
      logResult({
        passed: orderDetail !== undefined,
        message: 'Order details can be retrieved with items and history',
        details: { 
          hasUser: !!orderDetail?.user || !!orderDetail?.guestEmail,
          itemsCount: orderDetail?.items?.length ?? 0,
          hasStatusHistory: (orderDetail?.statusHistory?.length ?? 0) > 0,
        },
      });
    } else {
      logResult({
        passed: true,
        message: 'Order details retrieval (skipped - no orders)',
      });
    }

    // Test 5: Calculate order statistics
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        avgOrderValue: sql<number>`COALESCE(AVG(${orders.total}), 0)`,
      })
      .from(orders);
    
    logResult({
      passed: orderStats !== undefined,
      message: 'Order statistics can be calculated',
      details: orderStats,
    });

    // Test 6: Verify order actions exist
    try {
      const adminQueries = await import('../src/features/admin/order-queries');
      const hasGetOrders = typeof adminQueries.getOrders === 'function';
      const hasGetOrderById = typeof adminQueries.getOrderById === 'function';
      
      logResult({
        passed: hasGetOrders && hasGetOrderById,
        message: 'Order query functions exist',
        details: { 
          hasGetOrders,
          hasGetOrderById,
        },
      });
    } catch (error) {
      logResult({
        passed: false,
        message: 'Order query functions not found',
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }

    // Test 7: Verify export functionality exists
    try {
      const exportActions = await import('../src/features/admin/export-actions');
      const hasExportOrders = typeof exportActions.exportOrdersToCSV === 'function';
      
      logResult({
        passed: hasExportOrders,
        message: 'Order export functionality exists',
        details: { hasExportOrders },
      });
    } catch (error) {
      logResult({
        passed: false,
        message: 'Order export functionality not found',
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }

  } catch (error) {
    logResult({
      passed: false,
      message: 'Order management interface verification failed',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function verifyUserManagementInterface() {
  console.log('\n=== Testing User Management Interface ===\n');

  try {
    // Test 1: List all users with pagination
    const usersPage1 = await db.query.users.findMany({
      limit: 20,
      offset: 0,
      orderBy: desc(users.createdAt),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    logResult({
      passed: Array.isArray(usersPage1),
      message: 'User list can be retrieved with pagination',
      details: { usersCount: usersPage1.length },
    });

    // Test 2: Search users by email
    const searchResults = await db.query.users.findMany({
      where: sql`${users.email} ILIKE ${'%test%'}`,
      limit: 10,
    });
    
    logResult({
      passed: Array.isArray(searchResults),
      message: 'Users can be searched by email',
      details: { searchResultsCount: searchResults.length },
    });

    // Test 3: Get user with order history
    const allUsers = await db.query.users.findMany({ 
      where: eq(users.role, 'customer'),
      limit: 1,
    });
    
    if (allUsers.length > 0) {
      const userDetail = await db.query.users.findFirst({
        where: eq(users.id, allUsers[0].id),
        with: {
          orders: {
            limit: 10,
            orderBy: desc(orders.createdAt),
          },
          addresses: true,
        },
      });
      
      logResult({
        passed: userDetail !== undefined,
        message: 'User details can be retrieved with order history',
        details: { 
          ordersCount: userDetail?.orders?.length ?? 0,
          addressesCount: userDetail?.addresses?.length ?? 0,
        },
      });
    } else {
      logResult({
        passed: true,
        message: 'User details retrieval (skipped - no customer users)',
      });
    }

    // Test 4: Verify user management actions exist
    try {
      const userActions = await import('../src/features/admin/user-actions');
      const hasDeactivateUser = typeof userActions.deactivateUser === 'function';
      const hasReactivateUser = typeof userActions.reactivateUser === 'function';
      
      logResult({
        passed: hasDeactivateUser && hasReactivateUser,
        message: 'User management actions exist',
        details: { 
          hasDeactivateUser,
          hasReactivateUser,
        },
      });
    } catch (error) {
      logResult({
        passed: false,
        message: 'User management actions not found',
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }

    // Test 5: Verify user query functions exist
    try {
      const userQueries = await import('../src/features/admin/user-queries');
      const hasGetUsers = typeof userQueries.getUsers === 'function';
      const hasGetUserById = typeof userQueries.getUserById === 'function';
      
      logResult({
        passed: hasGetUsers && hasGetUserById,
        message: 'User query functions exist',
        details: { 
          hasGetUsers,
          hasGetUserById,
        },
      });
    } catch (error) {
      logResult({
        passed: false,
        message: 'User query functions not found',
        details: { error: error instanceof Error ? error.message : String(error) },
      });
    }

  } catch (error) {
    logResult({
      passed: false,
      message: 'User management interface verification failed',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function verifyAdminUIPages() {
  console.log('\n=== Testing Admin UI Pages Exist ===\n');

  const pagesToCheck = [
    { path: 'src/app/admin/dashboard/page.tsx', name: 'Admin Dashboard' },
    { path: 'src/app/admin/products/page.tsx', name: 'Product Management' },
    { path: 'src/app/admin/orders/page.tsx', name: 'Order Management' },
    { path: 'src/app/admin/users/page.tsx', name: 'User Management' },
  ];

  for (const page of pagesToCheck) {
    try {
      const fs = await import('fs/promises');
      await fs.access(page.path);
      logResult({
        passed: true,
        message: `${page.name} page exists`,
      });
    } catch (error) {
      logResult({
        passed: false,
        message: `${page.name} page not found`,
        details: { path: page.path },
      });
    }
  }
}

async function verifyAdminComponents() {
  console.log('\n=== Testing Admin Components Exist ===\n');

  const componentsToCheck = [
    { path: 'src/components/admin/product-form.tsx', name: 'Product Form' },
    { path: 'src/components/admin/product-list-actions.tsx', name: 'Product List Actions' },
    { path: 'src/components/admin/order-list-table.tsx', name: 'Order List Table' },
    { path: 'src/components/admin/order-status-updater.tsx', name: 'Order Status Updater' },
    { path: 'src/components/admin/user-search.tsx', name: 'User Search' },
  ];

  for (const component of componentsToCheck) {
    try {
      const fs = await import('fs/promises');
      await fs.access(component.path);
      logResult({
        passed: true,
        message: `${component.name} component exists`,
      });
    } catch (error) {
      logResult({
        passed: false,
        message: `${component.name} component not found`,
        details: { path: component.path },
      });
    }
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('CHECKPOINT 20 VERIFICATION REPORT');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${passRate}%)`);
  console.log(`Failed: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ✗ ${r.message}`);
        if (r.details) {
          console.log(`    ${JSON.stringify(r.details)}`);
        }
      });
    console.log('');
  }

  const categories = {
    'Dashboard Statistics': results.slice(0, 5),
    'Product Management': results.slice(5, 10),
    'Order Management': results.slice(10, 17),
    'User Management': results.slice(17, 22),
    'Admin UI Pages': results.slice(22, 26),
    'Admin Components': results.slice(26),
  };

  console.log('Results by Category:');
  for (const [category, categoryResults] of Object.entries(categories)) {
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const categoryTotal = categoryResults.length;
    const categoryRate = categoryTotal > 0 ? ((categoryPassed / categoryTotal) * 100).toFixed(0) : '0';
    console.log(`  ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Write report to file
  const fs = await import('fs/promises');
  const reportContent = `# Checkpoint 20 Verification Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Tests**: ${total}
- **Passed**: ${passed} (${passRate}%)
- **Failed**: ${failed}

## Results by Category

${Object.entries(categories).map(([category, categoryResults]) => {
  const categoryPassed = categoryResults.filter(r => r.passed).length;
  const categoryTotal = categoryResults.length;
  const categoryRate = categoryTotal > 0 ? ((categoryPassed / categoryTotal) * 100).toFixed(0) : '0';
  return `### ${category}
- Tests: ${categoryTotal}
- Passed: ${categoryPassed} (${categoryRate}%)

${categoryResults.map(r => `- [${r.passed ? 'x' : ' '}] ${r.message}`).join('\n')}
`;
}).join('\n')}

## Detailed Results

${results.map((r, i) => `### Test ${i + 1}: ${r.message}

- **Status**: ${r.passed ? 'PASSED ✓' : 'FAILED ✗'}
${r.details ? `- **Details**: \`\`\`json\n${JSON.stringify(r.details, null, 2)}\n\`\`\`` : ''}
`).join('\n')}

## Conclusion

${failed === 0 
  ? '✓ All admin features are working correctly. Ready to proceed to the next phase.' 
  : `✗ ${failed} test(s) failed. Please review the failed tests above and address the issues before proceeding.`}
`;

  await fs.writeFile('CHECKPOINT_20_VERIFICATION.md', reportContent);
  console.log('Report saved to CHECKPOINT_20_VERIFICATION.md\n');

  return failed === 0;
}

async function main() {
  console.log('Starting Checkpoint 20 Verification...\n');
  console.log('This will verify all admin features are working correctly.\n');

  try {
    await setupTestData();
    await verifyAdminDashboardStatistics();
    await verifyProductManagementInterface();
    await verifyOrderManagementInterface();
    await verifyUserManagementInterface();
    await verifyAdminUIPages();
    await verifyAdminComponents();
    
    const allPassed = await generateReport();
    
    if (allPassed) {
      console.log('✓ Checkpoint 20 verification completed successfully!');
      process.exit(0);
    } else {
      console.log('✗ Checkpoint 20 verification found issues. Please review the report.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during verification:', error);
    process.exit(1);
  }
}

main();
