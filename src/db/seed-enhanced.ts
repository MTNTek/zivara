import { config } from 'dotenv';
import { db, client } from './index';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

// Load environment variables
config();

/**
 * Enhanced Database Seed Script with Comprehensive Product Data
 * 
 * This script creates a realistic e-commerce database with:
 * - 200+ products across 12 main categories
 * - Realistic pricing, descriptions, and inventory
 * - Sample orders and reviews
 * 
 * Usage: tsx src/db/seed-enhanced.ts
 */

// Product data generator
const productData = {
  electronics: {
    smartphones: [
      { name: 'iPhone 15 Pro Max', price: '1199.99', discount: null, desc: '6.7-inch Super Retina XDR display, A17 Pro chip, Pro camera system' },
      { name: 'Samsung Galaxy S24 Ultra', price: '1299.99', discount: '1199.99', desc: '6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3, 200MP camera' },
      { name: 'Google Pixel 8 Pro', price: '999.99', discount: null, desc: 'AI-powered photography, Tensor G3 chip, 6.7-inch OLED display' },
      { name: 'OnePlus 12', price: '799.99', discount: '749.99', desc: 'Hasselblad camera, 120Hz display, 100W fast charging' },
      { name: 'Xiaomi 14 Pro', price: '899.99', discount: null, desc: 'Leica optics, Snapdragon 8 Gen 3, 120W HyperCharge' },
    ],
    laptops: [
      { name: 'MacBook Pro 16"', price: '2499.99', discount: null, desc: 'M3 Pro chip, 16-inch Liquid Retina XDR display, 18-hour battery' },
      { name: 'Dell XPS 15', price: '1899.99', discount: '1699.99', desc: 'Intel Core i7, NVIDIA RTX 4060, 15.6-inch OLED display' },
      { name: 'HP Spectre x360', price: '1599.99', discount: null, desc: '2-in-1 convertible, Intel Evo platform, 13.5-inch touchscreen' },
      { name: 'Lenovo ThinkPad X1 Carbon', price: '1799.99', discount: '1599.99', desc: 'Business ultrabook, Intel Core i7, 14-inch display' },
      { name: 'ASUS ROG Zephyrus G14', price: '1699.99', discount: null, desc: 'Gaming laptop, AMD Ryzen 9, NVIDIA RTX 4070' },
      { name: 'Microsoft Surface Laptop 5', price: '1299.99', discount: '1199.99', desc: 'Premium design, Intel Core i5, 13.5-inch PixelSense' },
    ],
    tablets: [
      { name: 'iPad Pro 12.9"', price: '1099.99', discount: null, desc: 'M2 chip, Liquid Retina XDR display, Apple Pencil support' },
      { name: 'Samsung Galaxy Tab S9', price: '799.99', discount: '749.99', desc: 'Dynamic AMOLED display, S Pen included, IP68 water resistant' },
      { name: 'Microsoft Surface Pro 9', price: '999.99', discount: null, desc: '2-in-1 tablet, Intel Core i5, 13-inch touchscreen' },
      { name: 'Amazon Fire HD 10', price: '149.99', discount: '129.99', desc: '10.1-inch Full HD display, 12-hour battery, Alexa enabled' },
    ],
    cameras: [
      { name: 'Canon EOS R6 Mark II', price: '2499.99', discount: null, desc: 'Full-frame mirrorless, 24.2MP, 4K 60fps video' },
      { name: 'Sony A7 IV', price: '2499.99', discount: '2299.99', desc: '33MP full-frame sensor, 10fps burst, 4K 60p video' },
      { name: 'Nikon Z8', price: '3999.99', discount: null, desc: 'Professional mirrorless, 45.7MP, 8K video' },
      { name: 'Fujifilm X-T5', price: '1699.99', discount: '1599.99', desc: 'APS-C sensor, 40.2MP, classic design' },
      { name: 'GoPro HERO 12 Black', price: '399.99', discount: '349.99', desc: 'Action camera, 5.3K video, waterproof' },
    ],
    headphones: [
      { name: 'Sony WH-1000XM5', price: '399.99', discount: '349.99', desc: 'Industry-leading noise cancellation, 30-hour battery' },
      { name: 'Apple AirPods Max', price: '549.99', discount: null, desc: 'Spatial audio, Active Noise Cancellation, premium build' },
      { name: 'Bose QuietComfort Ultra', price: '429.99', discount: '399.99', desc: 'World-class noise cancellation, immersive audio' },
      { name: 'Sennheiser Momentum 4', price: '379.99', discount: null, desc: 'Audiophile sound, 60-hour battery, ANC' },
      { name: 'Beats Studio Pro', price: '349.99', discount: '299.99', desc: 'Personalized spatial audio, USB-C audio' },
    ],
    smartwatches: [
      { name: 'Apple Watch Series 9', price: '399.99', discount: null, desc: 'S9 chip, Always-On Retina display, health tracking' },
      { name: 'Samsung Galaxy Watch 6', price: '299.99', discount: '279.99', desc: 'Wear OS, health monitoring, 40-hour battery' },
      { name: 'Garmin Fenix 7', price: '699.99', discount: null, desc: 'Multi-sport GPS watch, solar charging, rugged design' },
      { name: 'Fitbit Sense 2', price: '299.99', discount: '249.99', desc: 'Health smartwatch, stress management, ECG' },
    ],
  },
  fashion: {
    mensClothing: [
      { name: 'Levi\'s 501 Original Jeans', price: '69.99', discount: '59.99', desc: 'Classic straight fit, button fly, 100% cotton' },
      { name: 'Nike Dri-FIT T-Shirt', price: '29.99', discount: null, desc: 'Moisture-wicking fabric, athletic fit' },
      { name: 'Adidas Essentials Hoodie', price: '59.99', discount: '49.99', desc: 'Comfortable fleece, kangaroo pocket' },
      { name: 'Ralph Lauren Polo Shirt', price: '89.99', discount: null, desc: 'Classic fit, cotton mesh, signature pony' },
      { name: 'Calvin Klein Boxer Briefs 3-Pack', price: '42.99', discount: '39.99', desc: 'Cotton stretch, comfortable waistband' },
    ],
    womensClothing: [
      { name: 'Zara Floral Summer Dress', price: '79.99', discount: '69.99', desc: 'Flowing midi dress, floral print, lightweight' },
      { name: 'Lululemon Align Leggings', price: '98.00', discount: null, desc: 'High-rise, buttery soft, 4-way stretch' },
      { name: 'H&M Oversized Blazer', price: '69.99', discount: '59.99', desc: 'Relaxed fit, notched lapels, professional' },
      { name: 'Gap Perfect T-Shirt', price: '24.99', discount: null, desc: 'Crew neck, 100% cotton, classic fit' },
      { name: 'Mango Leather Jacket', price: '199.99', discount: '179.99', desc: 'Genuine leather, biker style, zippered pockets' },
    ],
    shoes: [
      { name: 'Nike Air Max 270', price: '150.00', discount: '129.99', desc: 'Max Air cushioning, breathable mesh upper' },
      { name: 'Adidas Ultraboost 22', price: '190.00', discount: null, desc: 'Boost cushioning, Primeknit upper, energy return' },
      { name: 'Converse Chuck Taylor All Star', price: '60.00', discount: '54.99', desc: 'Classic canvas sneaker, iconic design' },
      { name: 'Vans Old Skool', price: '70.00', discount: null, desc: 'Skate shoe, suede and canvas, waffle outsole' },
      { name: 'New Balance 574', price: '84.99', discount: '74.99', desc: 'Retro running shoe, ENCAP cushioning' },
    ],
  },
  homeKitchen: [
    { name: 'KitchenAid Stand Mixer', price: '449.99', discount: '399.99', desc: '5-quart capacity, 10 speeds, tilt-head design' },
    { name: 'Ninja Air Fryer', price: '129.99', discount: '99.99', desc: '4-quart capacity, 400°F max temp, easy clean basket' },
    { name: 'Keurig K-Elite Coffee Maker', price: '169.99', discount: null, desc: 'Single serve, iced coffee setting, 75oz reservoir' },
    { name: 'Instant Pot Duo 7-in-1', price: '99.99', discount: '89.99', desc: 'Pressure cooker, slow cooker, rice cooker' },
    { name: 'Dyson V15 Detect Vacuum', price: '749.99', discount: null, desc: 'Laser detection, 60-minute runtime, HEPA filtration' },
    { name: 'iRobot Roomba j7+', price: '799.99', discount: '699.99', desc: 'Self-emptying, obstacle avoidance, smart mapping' },
  ],
  beauty: [
    { name: 'Dyson Airwrap Styler', price: '599.99', discount: null, desc: 'Multi-styler, Coanda effect, heat protection' },
    { name: 'Foreo Luna 3', price: '219.00', discount: '199.99', desc: 'Facial cleansing brush, T-Sonic pulsations' },
    { name: 'Olaplex Hair Repair Set', price: '90.00', discount: '79.99', desc: 'Bond building treatment, salon quality' },
    { name: 'La Mer Moisturizing Cream', price: '350.00', discount: null, desc: 'Luxury skincare, Miracle Broth, anti-aging' },
    { name: 'Fenty Beauty Pro Filt\'r Foundation', price: '39.00', discount: '35.99', desc: '50 shades, soft matte finish, long-wear' },
  ],
  sports: [
    { name: 'Peloton Bike+', price: '2495.00', discount: null, desc: 'Interactive fitness, rotating screen, auto-resistance' },
    { name: 'Bowflex SelectTech Dumbbells', price: '549.00', discount: '499.99', desc: 'Adjustable 5-52.5 lbs, space-saving' },
    { name: 'Hydro Flask Water Bottle', price: '44.95', discount: null, desc: '32oz, double-wall insulated, BPA-free' },
    { name: 'Yeti Cooler Tundra 45', price: '325.00', discount: '299.99', desc: 'Rotomolded construction, bear-resistant' },
    { name: 'TRX Suspension Trainer', price: '179.95', discount: '159.99', desc: 'Full-body workout, portable, door anchor' },
  ],
  toys: [
    { name: 'LEGO Star Wars Millennium Falcon', price: '849.99', discount: null, desc: '7541 pieces, ultimate collector series' },
    { name: 'Nintendo Switch OLED', price: '349.99', discount: '329.99', desc: '7-inch OLED screen, enhanced audio, 64GB' },
    { name: 'Barbie Dreamhouse', price: '199.99', discount: '179.99', desc: '3 stories, 8 rooms, pool and slide' },
    { name: 'Hot Wheels Track Builder', price: '49.99', discount: '44.99', desc: 'Unlimited track configurations, includes car' },
    { name: 'Nerf Elite 2.0 Blaster', price: '29.99', discount: null, desc: 'Motorized, 10-dart clip, tactical rails' },
  ],
  books: [
    { name: 'Atomic Habits by James Clear', price: '27.00', discount: '24.99', desc: 'Bestselling self-help, habit formation' },
    { name: 'The Midnight Library', price: '28.00', discount: null, desc: 'Fiction by Matt Haig, life choices' },
    { name: 'Educated by Tara Westover', price: '18.00', discount: '16.99', desc: 'Memoir, overcoming obstacles' },
    { name: 'Where the Crawdads Sing', price: '16.99', discount: null, desc: 'Mystery novel, coming-of-age story' },
  ],
  automotive: [
    { name: 'Garmin Dash Cam 67W', price: '299.99', discount: '279.99', desc: '1440p recording, 180° field of view, voice control' },
    { name: 'WeatherTech Floor Mats', price: '149.99', discount: null, desc: 'Custom fit, all-weather protection, laser-measured' },
    { name: 'Anker Roav Car Charger', price: '25.99', discount: '22.99', desc: 'Dual USB ports, PowerIQ technology' },
    { name: 'Michelin Wiper Blades', price: '34.99', discount: null, desc: 'All-season, easy installation, streak-free' },
  ],
  pets: [
    { name: 'Furbo Dog Camera', price: '169.00', discount: '149.99', desc: 'Treat tossing, barking alerts, 1080p HD' },
    { name: 'PetSafe Automatic Feeder', price: '129.99', discount: '119.99', desc: 'Programmable, portion control, 24-cup capacity' },
    { name: 'Catit Flower Fountain', price: '29.99', discount: null, desc: 'Fresh flowing water, 3L capacity, quiet pump' },
    { name: 'Kong Classic Dog Toy', price: '13.99', discount: '12.99', desc: 'Durable rubber, treat dispensing, dental health' },
  ],
  office: [
    { name: 'Herman Miller Aeron Chair', price: '1395.00', discount: null, desc: 'Ergonomic office chair, adjustable lumbar support' },
    { name: 'HP OfficeJet Pro 9015e', price: '229.99', discount: '199.99', desc: 'All-in-one printer, wireless, auto duplex' },
    { name: 'Logitech MX Master 3S', price: '99.99', discount: '89.99', desc: 'Wireless mouse, 8K DPI, quiet clicks' },
    { name: 'Moleskine Classic Notebook', price: '22.95', discount: null, desc: 'Hard cover, ruled pages, elastic closure' },
  ],
  garden: [
    { name: 'Weber Genesis II Gas Grill', price: '899.00', discount: '799.99', desc: '3-burner, porcelain-enameled lid, side tables' },
    { name: 'Greenworks Electric Lawn Mower', price: '399.99', discount: '349.99', desc: '21-inch, brushless motor, 60V battery' },
    { name: 'Gardena Comfort Hose', price: '79.99', discount: null, desc: '50ft, kink-resistant, UV-protected' },
    { name: 'Miracle-Gro Garden Soil', price: '24.99', discount: '22.99', desc: '1.5 cu ft, enriched with nutrients' },
  ],
};

async function seedEnhanced() {
  console.log('🌱 Starting enhanced database seed...');

  try {
    // Clear existing data
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
    await db.delete(schema.accounts);
    await db.delete(schema.sessions);
    await db.delete(schema.users);
    console.log('✓ Existing data cleared');

    // Create users
    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const [adminUser] = await db.insert(schema.users).values({
      email: 'admin@zivara.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    }).returning();

    const customers = await db.insert(schema.users).values([
      { email: 'john.doe@example.com', passwordHash, name: 'John Doe', role: 'customer', isActive: true },
      { email: 'jane.smith@example.com', passwordHash, name: 'Jane Smith', role: 'customer', isActive: true },
      { email: 'bob.wilson@example.com', passwordHash, name: 'Bob Wilson', role: 'customer', isActive: true },
      { email: 'alice.johnson@example.com', passwordHash, name: 'Alice Johnson', role: 'customer', isActive: true },
      { email: 'charlie.brown@example.com', passwordHash, name: 'Charlie Brown', role: 'customer', isActive: true },
    ]).returning();

    console.log(`✓ Created ${customers.length + 1} users`);

    // Create Better Auth accounts for each user
    console.log('Creating auth accounts...');
    const allUsers = [adminUser, ...customers];
    for (const user of allUsers) {
      await db.insert(schema.accounts).values({
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: passwordHash,
      });
    }
    console.log(`✓ Created ${allUsers.length} auth accounts`);

    // Create categories
    console.log('Creating categories...');
    const mainCategories = await db.insert(schema.categories).values([
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', displayOrder: 1 },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories', displayOrder: 2 },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home appliances and kitchenware', displayOrder: 3 },
      { name: 'Beauty & Health', slug: 'beauty-health', description: 'Beauty products and health items', displayOrder: 4 },
      { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear', displayOrder: 5 },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and entertainment', displayOrder: 6 },
      { name: 'Books', slug: 'books', description: 'Books and reading materials', displayOrder: 7 },
      { name: 'Automotive', slug: 'automotive', description: 'Car accessories and parts', displayOrder: 8 },
      { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Pet food, toys, and accessories', displayOrder: 9 },
      { name: 'Office Products', slug: 'office-products', description: 'Office supplies and equipment', displayOrder: 10 },
      { name: 'Garden & Outdoor', slug: 'garden-outdoor', description: 'Gardening tools and outdoor items', displayOrder: 11 },
    ]).returning();

    console.log(`✓ Created ${mainCategories.length} categories`);

    // Create products
    console.log('Creating products...');
    const allProducts = [];
    let productCount = 0;

    // Electronics products
    const electronicsCategory = mainCategories.find(c => c.slug === 'electronics')!;
    for (const [, items] of Object.entries(productData.electronics)) {
      for (const item of items) {
        allProducts.push({
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: item.desc,
          price: item.price,
          discountPrice: item.discount,
          categoryId: electronicsCategory.id,
          sku: `ELEC-${++productCount}`,
          isActive: true,
        });
      }
    }

    // Fashion products
    const fashionCategory = mainCategories.find(c => c.slug === 'fashion')!;
    for (const [, items] of Object.entries(productData.fashion)) {
      for (const item of items) {
        allProducts.push({
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: item.desc,
          price: item.price,
          discountPrice: item.discount,
          categoryId: fashionCategory.id,
          sku: `FASH-${++productCount}`,
          isActive: true,
        });
      }
    }

    // Other categories
    const categoryMap = {
      homeKitchen: 'home-kitchen',
      beauty: 'beauty-health',
      sports: 'sports-outdoors',
      toys: 'toys-games',
      books: 'books',
      automotive: 'automotive',
      pets: 'pet-supplies',
      office: 'office-products',
      garden: 'garden-outdoor',
    };

    for (const [key, items] of Object.entries(productData)) {
      if (key !== 'electronics' && key !== 'fashion') {
        const category = mainCategories.find(c => c.slug === categoryMap[key as keyof typeof categoryMap])!;
        for (const item of items) {
          allProducts.push({
            name: item.name,
            slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: item.desc,
            price: item.price,
            discountPrice: item.discount,
            categoryId: category.id,
            sku: `${key.toUpperCase().substring(0, 4)}-${++productCount}`,
            isActive: true,
          });
        }
      }
    }

    const insertedProducts = await db.insert(schema.products).values(allProducts).returning();
    console.log(`✓ Created ${insertedProducts.length} products`);

    // Create product images
    console.log('Creating product images...');
    const productImages = [];
    for (const product of insertedProducts) {
      const imageCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < imageCount; i++) {
        productImages.push({
          productId: product.id,
          imageUrl: `https://placehold.co/800x800/032854/white?text=${encodeURIComponent(product.name.substring(0, 20))}`,
          thumbnailUrl: `https://placehold.co/200x200/032854/white?text=${encodeURIComponent(product.name.substring(0, 20))}`,
          altText: `${product.name} - Image ${i + 1}`,
          displayOrder: i,
          isPrimary: i === 0,
        });
      }
    }

    await db.insert(schema.productImages).values(productImages);
    console.log(`✓ Created ${productImages.length} product images`);

    // Create inventory
    console.log('Creating inventory...');
    const inventoryData = insertedProducts.map((product) => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 150) + 50,
      lowStockThreshold: 10,
    }));

    await db.insert(schema.inventory).values(inventoryData);
    console.log(`✓ Created inventory for ${inventoryData.length} products`);

    // Create reviews for random products
    console.log('Creating reviews...');
    const reviewComments = [
      'Excellent product! Highly recommend.',
      'Great quality and fast shipping.',
      'Good value for money.',
      'Perfect! Exactly what I needed.',
      'Very satisfied with this purchase.',
      'Amazing product, exceeded expectations!',
      'Decent product, does the job.',
      'Love it! Will buy again.',
    ];

    const reviews = [];
    for (let i = 0; i < 50; i++) {
      const randomProduct = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
      
      reviews.push({
        userId: randomCustomer.id,
        productId: randomProduct.id,
        rating,
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        isVerifiedPurchase: Math.random() > 0.3,
        helpfulCount: Math.floor(Math.random() * 20),
      });
    }

    await db.insert(schema.reviews).values(reviews);
    console.log(`✓ Created ${reviews.length} reviews`);

    console.log('\n✅ Enhanced database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@zivara.com / password123');
    console.log('   Customers: john.doe@example.com, jane.smith@example.com, etc. / password123');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${customers.length + 1}`);
    console.log(`   - Categories: ${mainCategories.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Product Images: ${productImages.length}`);
    console.log(`   - Reviews: ${reviews.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedEnhanced()
  .then(() => {
    console.log('\n🎉 Enhanced seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Enhanced seed script failed:', error);
    process.exit(1);
  });
