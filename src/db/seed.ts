import { db, client } from './index';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Database Seed Script
 * 
 * This script populates the database with sample data for development and testing.
 * It is idempotent - safe to run multiple times without creating duplicates.
 * 
 * Usage: tsx src/db/seed.ts
 */

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await db.delete(schema.reviews);
    await db.delete(schema.orderStatusHistory);
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.cartItems);
    await db.delete(schema.inventory);
    await db.delete(schema.productImages);
    await db.delete(schema.products);
    await db.delete(schema.categories);
    await db.delete(schema.userAddresses);
    await db.delete(schema.users);
    console.log('✓ Existing data cleared');

    // 1. Create Users
    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const [adminUser] = await db.insert(schema.users).values({
      email: 'admin@zivara.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    }).returning();

    const [customer1] = await db.insert(schema.users).values({
      email: 'john.doe@example.com',
      passwordHash,
      name: 'John Doe',
      role: 'customer',
      isActive: true,
    }).returning();

    const [customer2] = await db.insert(schema.users).values({
      email: 'jane.smith@example.com',
      passwordHash,
      name: 'Jane Smith',
      role: 'customer',
      isActive: true,
    }).returning();

    const [customer3] = await db.insert(schema.users).values({
      email: 'bob.wilson@example.com',
      passwordHash,
      name: 'Bob Wilson',
      role: 'customer',
      isActive: true,
    }).returning();

    console.log(`✓ Created ${4} users (1 admin, 3 customers)`);

    // 2. Create Categories (3-level hierarchy)
    console.log('Creating categories...');
    
    // Level 1: Root categories
    const [electronicsCategory] = await db.insert(schema.categories).values({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      displayOrder: 1,
    }).returning();

    const [clothingCategory] = await db.insert(schema.categories).values({
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      displayOrder: 2,
    }).returning();

    const [homeCategory] = await db.insert(schema.categories).values({
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      displayOrder: 3,
    }).returning();

    // Level 2: Subcategories
    const [computersCategory] = await db.insert(schema.categories).values({
      name: 'Computers',
      slug: 'computers',
      description: 'Desktop and laptop computers',
      parentId: electronicsCategory.id,
      displayOrder: 1,
    }).returning();

    const [audioCategory] = await db.insert(schema.categories).values({
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, speakers, and audio equipment',
      parentId: electronicsCategory.id,
      displayOrder: 2,
    }).returning();

    const [mensClothingCategory] = await db.insert(schema.categories).values({
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Clothing for men',
      parentId: clothingCategory.id,
      displayOrder: 1,
    }).returning();

    const [womensClothingCategory] = await db.insert(schema.categories).values({
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: 'Clothing for women',
      parentId: clothingCategory.id,
      displayOrder: 2,
    }).returning();

    // Level 3: Sub-subcategories
    const [laptopsCategory] = await db.insert(schema.categories).values({
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portable computers',
      parentId: computersCategory.id,
      displayOrder: 1,
    }).returning();

    const [desktopsCategory] = await db.insert(schema.categories).values({
      name: 'Desktops',
      slug: 'desktops',
      description: 'Desktop computers',
      parentId: computersCategory.id,
      displayOrder: 2,
    }).returning();

    const [headphonesCategory] = await db.insert(schema.categories).values({
      name: 'Headphones',
      slug: 'headphones',
      description: 'Over-ear and in-ear headphones',
      parentId: audioCategory.id,
      displayOrder: 1,
    }).returning();

    console.log(`✓ Created ${11} categories (3-level hierarchy)`);

    // 3. Create Products
    console.log('Creating products...');
    
    const products = [
      // Laptops
      {
        name: 'UltraBook Pro 15',
        slug: 'ultrabook-pro-15',
        description: 'High-performance laptop with 15-inch display, Intel i7 processor, 16GB RAM, and 512GB SSD. Perfect for professionals and content creators.',
        price: '1299.99',
        categoryId: laptopsCategory.id,
        sku: 'LAP-001',
        isActive: true,
      },
      {
        name: 'Business Laptop Elite',
        slug: 'business-laptop-elite',
        description: 'Reliable business laptop with 14-inch display, Intel i5 processor, 8GB RAM, and 256GB SSD. Lightweight and durable.',
        price: '899.99',
        discountPrice: '799.99',
        categoryId: laptopsCategory.id,
        sku: 'LAP-002',
        isActive: true,
      },
      // Desktops
      {
        name: 'Gaming Desktop Xtreme',
        slug: 'gaming-desktop-xtreme',
        description: 'Powerful gaming desktop with RTX 4070, AMD Ryzen 9, 32GB RAM, and 1TB NVMe SSD. Dominate any game.',
        price: '1899.99',
        categoryId: desktopsCategory.id,
        sku: 'DSK-001',
        isActive: true,
      },
      // Headphones
      {
        name: 'Wireless Noise-Canceling Headphones',
        slug: 'wireless-noise-canceling-headphones',
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
        price: '299.99',
        categoryId: headphonesCategory.id,
        sku: 'AUD-001',
        isActive: true,
      },
      {
        name: 'Studio Monitor Headphones',
        slug: 'studio-monitor-headphones',
        description: 'Professional studio headphones with flat frequency response and comfortable design for long sessions.',
        price: '199.99',
        categoryId: headphonesCategory.id,
        sku: 'AUD-002',
        isActive: true,
      },
      // Men's Clothing
      {
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-tshirt',
        description: 'Comfortable 100% cotton t-shirt in various colors. Perfect for everyday wear.',
        price: '24.99',
        categoryId: mensClothingCategory.id,
        sku: 'MEN-001',
        isActive: true,
      },
      {
        name: 'Slim Fit Jeans',
        slug: 'slim-fit-jeans',
        description: 'Modern slim fit jeans with stretch denim for comfort and style.',
        price: '59.99',
        discountPrice: '49.99',
        categoryId: mensClothingCategory.id,
        sku: 'MEN-002',
        isActive: true,
      },
      // Women's Clothing
      {
        name: 'Elegant Summer Dress',
        slug: 'elegant-summer-dress',
        description: 'Flowing summer dress with floral pattern. Perfect for warm weather occasions.',
        price: '79.99',
        categoryId: womensClothingCategory.id,
        sku: 'WOM-001',
        isActive: true,
      },
      {
        name: 'Yoga Leggings',
        slug: 'yoga-leggings',
        description: 'High-waisted yoga leggings with moisture-wicking fabric and four-way stretch.',
        price: '39.99',
        categoryId: womensClothingCategory.id,
        sku: 'WOM-002',
        isActive: true,
      },
      // Home & Garden
      {
        name: 'Smart LED Light Bulbs (4-Pack)',
        slug: 'smart-led-light-bulbs',
        description: 'WiFi-enabled smart bulbs with color changing and voice control. Works with Alexa and Google Home.',
        price: '49.99',
        categoryId: homeCategory.id,
        sku: 'HOM-001',
        isActive: true,
      },
    ];

    const insertedProducts = await db.insert(schema.products).values(products).returning();
    console.log(`✓ Created ${insertedProducts.length} products`);

    // 4. Create Product Images
    console.log('Creating product images...');
    const productImages = [];
    
    for (const product of insertedProducts) {
      // Each product gets 2-3 images
      const imageCount = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < imageCount; i++) {
        productImages.push({
          productId: product.id,
          imageUrl: `https://placehold.co/800x800/14B8A6/white?text=${encodeURIComponent(product.name)}`,
          thumbnailUrl: `https://placehold.co/200x200/14B8A6/white?text=${encodeURIComponent(product.name)}`,
          altText: `${product.name} - Image ${i + 1}`,
          displayOrder: i,
          isPrimary: i === 0,
        });
      }
    }

    await db.insert(schema.productImages).values(productImages);
    console.log(`✓ Created ${productImages.length} product images`);

    // 5. Create Inventory
    console.log('Creating inventory...');
    const inventoryData = insertedProducts.map((product) => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 100) + 20, // 20-120 units
      lowStockThreshold: 10,
    }));

    await db.insert(schema.inventory).values(inventoryData);
    console.log(`✓ Created inventory for ${inventoryData.length} products`);

    // 6. Create User Addresses
    console.log('Creating user addresses...');
    await db.insert(schema.userAddresses).values([
      {
        userId: customer1.id,
        label: 'Home',
        addressLine1: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'USA',
        isDefault: true,
      },
      {
        userId: customer2.id,
        label: 'Home',
        addressLine1: '456 Oak Avenue',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        isDefault: true,
      },
      {
        userId: customer3.id,
        label: 'Home',
        addressLine1: '789 Pine Road',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
        isDefault: true,
      },
    ]);
    console.log('✓ Created user addresses');

    // 7. Create Orders
    console.log('Creating orders...');
    
    // Order 1: Delivered order for customer1
    const [order1] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-2024-001',
      userId: customer1.id,
      status: 'delivered',
      subtotal: '1299.99',
      tax: '104.00',
      shipping: '15.00',
      total: '1418.99',
      shippingAddressLine1: '123 Main Street',
      shippingCity: 'San Francisco',
      shippingState: 'CA',
      shippingPostalCode: '94102',
      shippingCountry: 'USA',
      paymentMethod: 'card',
      lastFourDigits: '4242',
      trackingNumber: 'TRK123456789',
      carrierName: 'FedEx',
      createdAt: new Date('2024-01-15'),
    }).returning();

    await db.insert(schema.orderItems).values([
      {
        orderId: order1.id,
        productId: insertedProducts[0].id, // UltraBook Pro 15
        productName: insertedProducts[0].name,
        quantity: 1,
        priceAtPurchase: '1299.99',
        subtotal: '1299.99',
      },
    ]);

    await db.insert(schema.orderStatusHistory).values([
      {
        orderId: order1.id,
        status: 'pending',
        notes: 'Order placed',
        changedBy: customer1.id,
        createdAt: new Date('2024-01-15T10:00:00'),
      },
      {
        orderId: order1.id,
        status: 'processing',
        notes: 'Payment confirmed',
        changedBy: adminUser.id,
        createdAt: new Date('2024-01-15T11:00:00'),
      },
      {
        orderId: order1.id,
        status: 'shipped',
        notes: 'Package shipped',
        changedBy: adminUser.id,
        createdAt: new Date('2024-01-16T09:00:00'),
      },
      {
        orderId: order1.id,
        status: 'delivered',
        notes: 'Package delivered',
        changedBy: adminUser.id,
        createdAt: new Date('2024-01-18T14:30:00'),
      },
    ]);

    // Order 2: Shipped order for customer2
    const [order2] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-2024-002',
      userId: customer2.id,
      status: 'shipped',
      subtotal: '499.98',
      tax: '40.00',
      shipping: '10.00',
      total: '549.98',
      shippingAddressLine1: '456 Oak Avenue',
      shippingCity: 'New York',
      shippingState: 'NY',
      shippingPostalCode: '10001',
      shippingCountry: 'USA',
      paymentMethod: 'card',
      lastFourDigits: '5555',
      trackingNumber: 'TRK987654321',
      carrierName: 'UPS',
      createdAt: new Date('2024-01-20'),
    }).returning();

    await db.insert(schema.orderItems).values([
      {
        orderId: order2.id,
        productId: insertedProducts[3].id, // Wireless Headphones
        productName: insertedProducts[3].name,
        quantity: 1,
        priceAtPurchase: '299.99',
        subtotal: '299.99',
      },
      {
        orderId: order2.id,
        productId: insertedProducts[4].id, // Studio Monitor Headphones
        productName: insertedProducts[4].name,
        quantity: 1,
        priceAtPurchase: '199.99',
        subtotal: '199.99',
      },
    ]);

    await db.insert(schema.orderStatusHistory).values([
      {
        orderId: order2.id,
        status: 'pending',
        notes: 'Order placed',
        changedBy: customer2.id,
        createdAt: new Date('2024-01-20T14:00:00'),
      },
      {
        orderId: order2.id,
        status: 'processing',
        notes: 'Payment confirmed',
        changedBy: adminUser.id,
        createdAt: new Date('2024-01-20T15:00:00'),
      },
      {
        orderId: order2.id,
        status: 'shipped',
        notes: 'Package shipped',
        changedBy: adminUser.id,
        createdAt: new Date('2024-01-21T10:00:00'),
      },
    ]);

    // Order 3: Processing order for customer3
    const [order3] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-2024-003',
      userId: customer3.id,
      status: 'processing',
      subtotal: '109.98',
      tax: '8.80',
      shipping: '8.00',
      total: '126.78',
      shippingAddressLine1: '789 Pine Road',
      shippingCity: 'Seattle',
      shippingState: 'WA',
      shippingPostalCode: '98101',
      shippingCountry: 'USA',
      paymentMethod: 'card',
      lastFourDigits: '1234',
      createdAt: new Date('2024-01-22'),
    }).returning();

    await db.insert(schema.orderItems).values([
      {
        orderId: order3.id,
        productId: insertedProducts[6].id, // Slim Fit Jeans
        productName: insertedProducts[6].name,
        quantity: 1,
        priceAtPurchase: '49.99',
        subtotal: '49.99',
      },
      {
        orderId: order3.id,
        productId: insertedProducts[5].id, // Classic T-Shirt
        productName: insertedProducts[5].name,
        quantity: 1,
        priceAtPurchase: '24.99',
        subtotal: '24.99',
      },
      {
        orderId: order3.id,
        productId: insertedProducts[8].id, // Yoga Leggings
        productName: insertedProducts[8].name,
        quantity: 1,
        priceAtPurchase: '39.99',
        subtotal: '39.99',
      },
    ]);

    await db.insert(schema.orderStatusHistory).values([
      {
        orderId: order3.id,
        status: 'pending',
        notes: 'Order placed',
        changedBy: customer3.id,
        createdAt: new Date('2024-01-22T09:00:00'),
      },
      {
        orderId: order3.id,
        status: 'processing',
        notes: 'Payment confirmed',
        changedBy: adminUser.id,
        createdAt: new Date('2024-01-22T10:00:00'),
      },
    ]);

    console.log(`✓ Created 3 orders with items and status history`);

    // 8. Create Reviews
    console.log('Creating reviews...');
    
    // Reviews for delivered products
    await db.insert(schema.reviews).values([
      {
        userId: customer1.id,
        productId: insertedProducts[0].id, // UltraBook Pro 15
        rating: 5,
        comment: 'Excellent laptop! Fast, lightweight, and the battery life is amazing. Perfect for my work as a developer.',
        isVerifiedPurchase: true,
        helpfulCount: 12,
        createdAt: new Date('2024-01-19'),
      },
      {
        userId: customer2.id,
        productId: insertedProducts[3].id, // Wireless Headphones
        rating: 4,
        comment: 'Great sound quality and noise cancellation works well. Only downside is they can feel a bit tight after long use.',
        isVerifiedPurchase: true,
        helpfulCount: 8,
        createdAt: new Date('2024-01-21'),
      },
      {
        userId: customer2.id,
        productId: insertedProducts[4].id, // Studio Monitor Headphones
        rating: 5,
        comment: 'Perfect for music production. Flat response and very comfortable for long studio sessions.',
        isVerifiedPurchase: true,
        helpfulCount: 5,
        createdAt: new Date('2024-01-21'),
      },
      {
        userId: customer3.id,
        productId: insertedProducts[1].id, // Business Laptop Elite
        rating: 4,
        comment: 'Good value for money. Handles all my business tasks smoothly. Would recommend for office work.',
        isVerifiedPurchase: false,
        helpfulCount: 3,
        createdAt: new Date('2024-01-10'),
      },
      {
        userId: customer1.id,
        productId: insertedProducts[2].id, // Gaming Desktop
        rating: 5,
        comment: 'Beast of a machine! Runs all my games at max settings with no issues. Worth every penny.',
        isVerifiedPurchase: false,
        helpfulCount: 15,
        createdAt: new Date('2024-01-12'),
      },
    ]);

    // Update product ratings based on reviews
    await db.update(schema.products)
      .set({ averageRating: '5.00', reviewCount: 1 })
      .where(eq(schema.products.id, insertedProducts[0].id));

    await db.update(schema.products)
      .set({ averageRating: '4.00', reviewCount: 1 })
      .where(eq(schema.products.id, insertedProducts[3].id));

    await db.update(schema.products)
      .set({ averageRating: '5.00', reviewCount: 1 })
      .where(eq(schema.products.id, insertedProducts[4].id));

    await db.update(schema.products)
      .set({ averageRating: '4.00', reviewCount: 1 })
      .where(eq(schema.products.id, insertedProducts[1].id));

    await db.update(schema.products)
      .set({ averageRating: '5.00', reviewCount: 1 })
      .where(eq(schema.products.id, insertedProducts[2].id));

    console.log(`✓ Created 5 reviews and updated product ratings`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@zivara.com / password123');
    console.log('   Customer 1: john.doe@example.com / password123');
    console.log('   Customer 2: jane.smith@example.com / password123');
    console.log('   Customer 3: bob.wilson@example.com / password123');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 4 (1 admin, 3 customers)`);
    console.log(`   - Categories: 11 (3-level hierarchy)`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Product Images: ${productImages.length}`);
    console.log(`   - Orders: 3`);
    console.log(`   - Reviews: 5`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Close database connection
    await client.end();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n🎉 Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
