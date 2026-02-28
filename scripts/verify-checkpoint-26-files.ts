/**
 * Checkpoint 26 File Structure Verification Script
 * 
 * This script verifies the file structure and code organization
 * without requiring database access.
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const results: VerificationResult[] = [];

function logResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string) {
  results.push({ category, test, status, message });
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  console.log(`${icon} [${category}] ${test}: ${message}`);
}

function checkPath(pathToCheck: string, type: 'file' | 'directory'): boolean {
  const fullPath = path.join(process.cwd(), pathToCheck);
  try {
    const stats = fs.statSync(fullPath);
    if (type === 'file') {
      return stats.isFile();
    } else {
      return stats.isDirectory();
    }
  } catch {
    return false;
  }
}

function checkFileContains(filePath: string, searchString: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return content.includes(searchString);
  } catch {
    return false;
  }
}

function verifyProjectStructure() {
  console.log('\n=== Project Structure Verification ===\n');
  
  const requiredDirs = [
    'src/app',
    'src/components',
    'src/features',
    'src/db',
    'src/lib',
    'src/types',
  ];
  
  for (const dir of requiredDirs) {
    if (checkPath(dir, 'directory')) {
      logResult('Structure', dir, 'PASS', 'Directory exists');
    } else {
      logResult('Structure', dir, 'FAIL', 'Directory missing');
    }
  }
}

function verifyAppRoutes() {
  console.log('\n=== App Routes Verification ===\n');
  
  const routes = [
    { path: 'src/app/page.tsx', name: 'Homepage' },
    { path: 'src/app/products/page.tsx', name: 'Product Listing' },
    { path: 'src/app/products/[id]/page.tsx', name: 'Product Detail' },
    { path: 'src/app/products/category/[slug]/page.tsx', name: 'Category Page' },
    { path: 'src/app/cart/page.tsx', name: 'Cart Page' },
    { path: 'src/app/checkout/page.tsx', name: 'Checkout Page' },
    { path: 'src/app/orders/page.tsx', name: 'Order History' },
    { path: 'src/app/orders/[id]/page.tsx', name: 'Order Detail' },
    { path: 'src/app/login/page.tsx', name: 'Login Page' },
    { path: 'src/app/register/page.tsx', name: 'Register Page' },
    { path: 'src/app/reset-password/page.tsx', name: 'Password Reset' },
  ];
  
  for (const route of routes) {
    if (checkPath(route.path, 'file')) {
      logResult('Routes', route.name, 'PASS', `${route.path} exists`);
    } else {
      logResult('Routes', route.name, 'WARN', `${route.path} missing`);
    }
  }
}

function verifyAdminRoutes() {
  console.log('\n=== Admin Routes Verification ===\n');
  
  const adminRoutes = [
    { path: 'src/app/admin/dashboard/page.tsx', name: 'Admin Dashboard' },
    { path: 'src/app/admin/products/page.tsx', name: 'Product Management' },
    { path: 'src/app/admin/orders/page.tsx', name: 'Order Management' },
    { path: 'src/app/admin/users/page.tsx', name: 'User Management' },
  ];
  
  for (const route of adminRoutes) {
    if (checkPath(route.path, 'file')) {
      logResult('Admin', route.name, 'PASS', `${route.path} exists`);
    } else {
      logResult('Admin', route.name, 'WARN', `${route.path} missing`);
    }
  }
}

function verifyComponents() {
  console.log('\n=== Components Verification ===\n');
  
  const componentDirs = [
    'src/components/ui',
    'src/components/layout',
    'src/components/product',
    'src/components/cart',
    'src/components/order',
    'src/components/admin',
  ];
  
  for (const dir of componentDirs) {
    if (checkPath(dir, 'directory')) {
      const files = fs.readdirSync(path.join(process.cwd(), dir));
      logResult('Components', dir, 'PASS', `Directory exists with ${files.length} files`);
    } else {
      logResult('Components', dir, 'WARN', 'Directory missing');
    }
  }
}

function verifyFeatures() {
  console.log('\n=== Features Verification ===\n');
  
  const features = [
    { dir: 'src/features/auth', files: ['actions.ts', 'schemas.ts'] },
    { dir: 'src/features/products', files: ['actions.ts', 'queries.ts', 'schemas.ts'] },
    { dir: 'src/features/cart', files: ['actions.ts', 'queries.ts'] },
    { dir: 'src/features/orders', files: ['actions.ts', 'queries.ts'] },
    { dir: 'src/features/reviews', files: ['actions.ts', 'queries.ts'] },
    { dir: 'src/features/admin', files: ['queries.ts'] },
  ];
  
  for (const feature of features) {
    if (checkPath(feature.dir, 'directory')) {
      const missingFiles = feature.files.filter(f => !checkPath(`${feature.dir}/${f}`, 'file'));
      if (missingFiles.length === 0) {
        logResult('Features', feature.dir, 'PASS', 'All required files exist');
      } else {
        logResult('Features', feature.dir, 'WARN', `Missing files: ${missingFiles.join(', ')}`);
      }
    } else {
      logResult('Features', feature.dir, 'FAIL', 'Directory missing');
    }
  }
}

function verifyDatabase() {
  console.log('\n=== Database Layer Verification ===\n');
  
  const dbFiles = [
    'src/db/schema.ts',
    'src/db/index.ts',
  ];
  
  for (const file of dbFiles) {
    if (checkPath(file, 'file')) {
      logResult('Database', file, 'PASS', 'File exists');
    } else {
      logResult('Database', file, 'FAIL', 'File missing');
    }
  }
  
  // Check if schema has required tables
  if (checkPath('src/db/schema.ts', 'file')) {
    const requiredTables = [
      'users', 'products', 'categories', 'cartItems', 'orders',
      'orderItems', 'reviews', 'productImages', 'inventory'
    ];
    
    for (const table of requiredTables) {
      if (checkFileContains('src/db/schema.ts', `export const ${table}`)) {
        logResult('Database', `Table: ${table}`, 'PASS', 'Table definition found');
      } else {
        logResult('Database', `Table: ${table}`, 'WARN', 'Table definition not found');
      }
    }
  }
}

function verifyLibraries() {
  console.log('\n=== Library Files Verification ===\n');
  
  const libFiles = [
    { path: 'src/lib/auth.ts', name: 'Authentication' },
    { path: 'src/lib/email.ts', name: 'Email Service' },
    { path: 'src/lib/storage.ts', name: 'File Storage' },
    { path: 'src/lib/payment.ts', name: 'Payment Processing' },
    { path: 'src/lib/errors.ts', name: 'Error Classes' },
    { path: 'src/lib/error-handler.ts', name: 'Error Handler' },
    { path: 'src/lib/logger.ts', name: 'Logger' },
  ];
  
  for (const lib of libFiles) {
    if (checkPath(lib.path, 'file')) {
      logResult('Libraries', lib.name, 'PASS', `${lib.path} exists`);
    } else {
      logResult('Libraries', lib.name, 'WARN', `${lib.path} missing`);
    }
  }
}

function verifyMiddleware() {
  console.log('\n=== Middleware Verification ===\n');
  
  if (checkPath('src/middleware.ts', 'file')) {
    logResult('Middleware', 'Route Protection', 'PASS', 'Middleware file exists');
    
    // Check if middleware protects admin routes
    if (checkFileContains('src/middleware.ts', '/admin')) {
      logResult('Middleware', 'Admin Protection', 'PASS', 'Admin route protection configured');
    } else {
      logResult('Middleware', 'Admin Protection', 'WARN', 'Admin route protection not found');
    }
  } else {
    logResult('Middleware', 'Route Protection', 'FAIL', 'Middleware file missing');
  }
}

function verifyConfiguration() {
  console.log('\n=== Configuration Files Verification ===\n');
  
  const configFiles = [
    { path: 'package.json', name: 'Package Configuration' },
    { path: 'tsconfig.json', name: 'TypeScript Configuration' },
    { path: 'next.config.ts', name: 'Next.js Configuration', alt: 'next.config.js' },
    { path: 'tailwind.config.ts', name: 'Tailwind Configuration', alt: 'tailwind.config.js' },
    { path: '.env.example', name: 'Environment Example' },
  ];
  
  for (const config of configFiles) {
    const exists = checkPath(config.path, 'file') || (config.alt && checkPath(config.alt, 'file'));
    if (exists) {
      logResult('Config', config.name, 'PASS', `${config.path} exists`);
    } else {
      logResult('Config', config.name, 'WARN', `${config.path} missing`);
    }
  }
  
  // Check Tailwind for Teal color
  const tailwindPaths = ['tailwind.config.ts', 'tailwind.config.js'];
  let foundTeal = false;
  for (const tailwindPath of tailwindPaths) {
    if (checkPath(tailwindPath, 'file')) {
      if (checkFileContains(tailwindPath, '#14B8A6') || checkFileContains(tailwindPath, 'teal')) {
        logResult('Config', 'Teal Branding', 'PASS', 'Teal color configured in Tailwind');
        foundTeal = true;
        break;
      }
    }
  }
  if (!foundTeal) {
    logResult('Config', 'Teal Branding', 'WARN', 'Teal color not found in Tailwind config');
  }
}

function verifyTests() {
  console.log('\n=== Test Files Verification ===\n');
  
  const testPatterns = [
    'src/features/auth/*.test.ts',
    'src/features/products/*.test.ts',
    'src/features/cart/*.test.ts',
    'src/features/orders/*.test.ts',
    'src/features/reviews/*.test.ts',
  ];
  
  let totalTests = 0;
  
  for (const pattern of testPatterns) {
    const dir = pattern.split('/*.')[0];
    if (checkPath(dir, 'directory')) {
      try {
        const files = fs.readdirSync(path.join(process.cwd(), dir));
        const testFiles = files.filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
        totalTests += testFiles.length;
        if (testFiles.length > 0) {
          logResult('Tests', dir, 'PASS', `${testFiles.length} test file(s) found`);
        } else {
          logResult('Tests', dir, 'WARN', 'No test files found');
        }
      } catch {
        logResult('Tests', dir, 'WARN', 'Could not read directory');
      }
    }
  }
  
  console.log(`\nTotal test files found: ${totalTests}`);
}

function verifyPropertyTests() {
  console.log('\n=== Property-Based Tests Verification ===\n');
  
  const propertyTestFiles = [
    'src/db/schema.property.test.ts',
    'src/features/products/price.property.test.ts',
    'src/features/reviews/rating.property.test.ts',
    'src/features/orders/checkout.property.test.ts',
  ];
  
  let foundCount = 0;
  for (const file of propertyTestFiles) {
    if (checkPath(file, 'file')) {
      logResult('Property Tests', file, 'PASS', 'Property test exists');
      foundCount++;
    } else {
      logResult('Property Tests', file, 'WARN', 'Property test missing');
    }
  }
  
  console.log(`\nProperty test files found: ${foundCount}/${propertyTestFiles.length}`);
}

function generateSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('CHECKPOINT 26 FILE VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.status === 'PASS').length;
    const failed = categoryResults.filter(r => r.status === 'FAIL').length;
    const warned = categoryResults.filter(r => r.status === 'WARN').length;
    const total = categoryResults.length;
    
    console.log(`${category}:`);
    console.log(`  ✓ Passed: ${passed}/${total}`);
    if (failed > 0) console.log(`  ✗ Failed: ${failed}/${total}`);
    if (warned > 0) console.log(`  ⚠ Warnings: ${warned}/${total}`);
    console.log();
  }
  
  const totalPassed = results.filter(r => r.status === 'PASS').length;
  const totalFailed = results.filter(r => r.status === 'FAIL').length;
  const totalWarned = results.filter(r => r.status === 'WARN').length;
  const total = results.length;
  
  console.log('Overall Results:');
  console.log(`  Total Checks: ${total}`);
  console.log(`  ✓ Passed: ${totalPassed} (${Math.round(totalPassed/total*100)}%)`);
  console.log(`  ✗ Failed: ${totalFailed} (${Math.round(totalFailed/total*100)}%)`);
  console.log(`  ⚠ Warnings: ${totalWarned} (${Math.round(totalWarned/total*100)}%)`);
  console.log();
  
  if (totalFailed === 0 && totalWarned === 0) {
    console.log('🎉 All file structure checks passed!');
  } else if (totalFailed === 0) {
    console.log('✓ No critical failures, but there are warnings to review.');
  } else {
    console.log('⚠ Critical failures detected. Please address missing files.');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Review the CHECKPOINT_26_VERIFICATION.md checklist');
  console.log('2. Test all user flows manually');
  console.log('3. Test all admin workflows');
  console.log('4. Verify security measures');
  console.log('5. Test responsive design on multiple devices');
  console.log('6. Run performance tests');
  console.log('7. For database verification, run: npx tsx scripts/verify-checkpoint-26.ts');
  console.log('   (requires DATABASE_URL environment variable)');
  console.log('\n' + '='.repeat(60) + '\n');
}

function main() {
  console.log('Starting Checkpoint 26 File Structure Verification...\n');
  
  try {
    verifyProjectStructure();
    verifyAppRoutes();
    verifyAdminRoutes();
    verifyComponents();
    verifyFeatures();
    verifyDatabase();
    verifyLibraries();
    verifyMiddleware();
    verifyConfiguration();
    verifyTests();
    verifyPropertyTests();
    
    generateSummary();
    
    const hasFailed = results.some(r => r.status === 'FAIL');
    process.exit(hasFailed ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Verification script failed:', error);
    process.exit(1);
  }
}

main();
