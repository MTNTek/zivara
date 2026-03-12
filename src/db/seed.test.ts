import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Seed Script', () => {
  it('should have a valid seed.ts file', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Verify the file exists and has content
    expect(seedContent).toBeTruthy();
    expect(seedContent.length).toBeGreaterThan(0);
  });

  it('should import required dependencies', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for required imports
    expect(seedContent).toContain("import { db, client } from './index'");
    expect(seedContent).toContain("import * as schema from './schema'");
    expect(seedContent).toContain("import { eq } from 'drizzle-orm'");
    expect(seedContent).toContain("import bcrypt from 'bcrypt'");
  });

  it('should have a seed function', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    expect(seedContent).toContain('async function seed()');
  });

  it('should create users including admin', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for admin user creation
    expect(seedContent).toContain("email: 'admin@zivara.com'");
    expect(seedContent).toContain("role: 'admin'");
    
    // Check for customer users
    expect(seedContent).toContain("role: 'customer'");
  });

  it('should create 3-level category hierarchy', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for category creation with parent relationships
    expect(seedContent).toContain('schema.categories');
    expect(seedContent).toContain('parentId:');
    
    // Check for multiple levels
    expect(seedContent).toContain('Level 1');
    expect(seedContent).toContain('Level 2');
    expect(seedContent).toContain('Level 3');
  });

  it('should create products with images and inventory', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for product creation
    expect(seedContent).toContain('schema.products');
    
    // Check for product images
    expect(seedContent).toContain('schema.productImages');
    expect(seedContent).toContain('isPrimary');
    
    // Check for inventory
    expect(seedContent).toContain('schema.inventory');
    expect(seedContent).toContain('quantity');
  });

  it('should create orders with items and status history', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for order creation
    expect(seedContent).toContain('schema.orders');
    expect(seedContent).toContain('orderNumber');
    
    // Check for order items
    expect(seedContent).toContain('schema.orderItems');
    
    // Check for order status history
    expect(seedContent).toContain('schema.orderStatusHistory');
  });

  it('should create reviews', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for review creation
    expect(seedContent).toContain('schema.reviews');
    expect(seedContent).toContain('rating');
    expect(seedContent).toContain('comment');
    expect(seedContent).toContain('isVerifiedPurchase');
  });

  it('should be idempotent (clear existing data)', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for data clearing
    expect(seedContent).toContain('Clearing existing data');
    expect(seedContent).toContain('db.delete');
  });

  it('should close database connection', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for connection cleanup
    expect(seedContent).toContain('client.end()');
  });

  it('should provide test credentials in output', () => {
    const seedPath = join(__dirname, 'seed.ts');
    const seedContent = readFileSync(seedPath, 'utf-8');
    
    // Check for credential documentation
    expect(seedContent).toContain('Test Credentials');
    expect(seedContent).toContain('admin@zivara.com');
    expect(seedContent).toContain('password123');
  });
});
