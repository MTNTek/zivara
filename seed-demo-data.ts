import { db, client } from './src/db/index';
import * as schema from './src/db/schema';

/**
 * Seed demo data (categories and products only, no users)
 * Users will register through the UI, first user becomes admin
 */

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
    ],
    tablets: [
      { name: 'iPad Pro 12.9"', price: '1099.99', discount: null, desc: 'M2 chip, Liquid Retina XDR display, Apple Pencil support' },
      { name: 'Samsung Galaxy Tab S9', price: '799.99', discount: '749.99', desc: 'Dynamic AMOLED display, S Pen included, IP68 water resistant' },
      { name: 'Microsoft Surface Pro 9', price: '999.99', discount: null, desc: '2-in-1 tablet, Intel Core i5, 13-inch touchscreen' },
    ],
    headphones: [
      { name: 'Sony WH-1000XM5', price: '399.99', discount: '349.99', desc: 'Industry-leading noise cancellation, 30-hour battery' },
      { name: 'Apple AirPods Max', price: '549.99', discount: null, desc: 'Spatial audio, Active Noise Cancellation, premium build' },
      { name: 'Bose QuietComfort Ultra', price: '429.99', discount: '399.99', desc: 'World-class noise cancellation, immersive audio' },
    ],
  },
  fashion: {
    mensClothing: [
      { name: 'Levi\'s 501 Original Jeans', price: '69.99', discount: '59.99', desc: 'Classic straight fit, button fly, 100% cotton' },
      { name: 'Nike Dri-FIT T-Shirt', price: '29.99', discount: null, desc: 'Moisture-wicking fabric, athletic fit' },
      { name: 'Adidas Essentials Hoodie', price: '59.99', discount: '49.99', desc: 'Comfortable fleece, kangaroo pocket' },
    ],
    womensClothing: [
      { name: 'Zara Floral Summer Dress', price: '79.99', discount: '69.99', desc: 'Flowing midi dress, floral print, lightweight' },
      { name: 'Lululemon Align Leggings', price: '98.00', discount: null, desc: 'High-rise, buttery soft, 4-way stretch' },
      { name: 'H&M Oversized Blazer', price: '69.99', discount: '59.99', desc: 'Relaxed fit, notched lapels, professional' },
    ],
    shoes: [
      { name: 'Nike Air Max 270', price: '150.00', discount: '129.99', desc: 'Max Air cushioning, breathable mesh upper' },
      { name: 'Adidas Ultraboost 22', price: '190.00', discount: null, desc: 'Boost cushioning, Primeknit upper, energy return' },
      { name: 'Converse Chuck Taylor All Star', price: '60.00', discount: '54.99', desc: 'Classic canvas sneaker, iconic design' },
    ],
  },
  homeKitchen: [
    { name: 'KitchenAid Stand Mixer', price: '449.99', discount: '399.99', desc: '5-quart capacity, 10 speeds, tilt-head design' },
    { name: 'Ninja Air Fryer', price: '129.99', discount: '99.99', desc: '4-quart capacity, 400°F max temp, easy clean basket' },
    { name: 'Instant Pot Duo 7-in-1', price: '99.99', discount: '89.99', desc: 'Pressure cooker, slow cooker, rice cooker' },
    { name: 'Dyson V15 Detect Vacuum', price: '749.99', discount: null, desc: 'Laser detection, 60-minute runtime, HEPA filtration' },
  ],
  beauty: [
    { name: 'Dyson Airwrap Styler', price: '599.99', discount: null, desc: 'Multi-styler, Coanda effect, heat protection' },
    { name: 'Foreo Luna 3', price: '219.00', discount: '199.99', desc: 'Facial cleansing brush, T-Sonic pulsations' },
    { name: 'Olaplex Hair Repair Set', price: '90.00', discount: '79.99', desc: 'Bond building treatment, salon quality' },
  ],
  sports: [
    { name: 'Bowflex SelectTech Dumbbells', price: '549.00', discount: '499.99', desc: 'Adjustable 5-52.5 lbs, space-saving' },
    { name: 'Hydro Flask Water Bottle', price: '44.95', discount: null, desc: '32oz, double-wall insulated, BPA-free' },
    { name: 'TRX Suspension Trainer', price: '179.95', discount: '159.99', desc: 'Full-body workout, portable, door anchor' },
  ],
  toys: [
    { name: 'LEGO Star Wars Millennium Falcon', price: '849.99', discount: null, desc: '7541 pieces, ultimate collector series' },
    { name: 'Nintendo Switch OLED', price: '349.99', discount: '329.99', desc: '7-inch OLED screen, enhanced audio, 64GB' },
    { name: 'Barbie Dreamhouse', price: '199.99', discount: '179.99', desc: '3 stories, 8 rooms, pool and slide' },
  ],
  books: [
    { name: 'Atomic Habits by James Clear', price: '27.00', discount: '24.99', desc: 'Bestselling self-help, habit formation' },
    { name: 'The Midnight Library', price: '28.00', discount: null, desc: 'Fiction by Matt Haig, life choices' },
    { name: 'Educated by Tara Westover', price: '18.00', discount: '16.99', desc: 'Memoir, overcoming obstacles' },
  ],
};

async function seedDemoData() {
  console.log('🌱 Seeding demo data (categories and products only)...\n');

  try {
    // Clear existing products and categories
    console.log('Clearing existing products and categories...');
    await db.delete(schema.reviews);
    await db.delete(schema.inventory);
    await db.delete(schema.productImages);
    await db.delete(schema.products);
    await db.delete(schema.categories);
    console.log('✓ Cleared existing data\n');

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
    ]).returning();
    console.log(`✓ Created ${mainCategories.length} categories\n`);

    // Create products
    console.log('Creating products...');
    const allProducts = [];
    let productCount = 0;

    // Electronics products
    const electronicsCategory = mainCategories.find(c => c.slug === 'electronics')!;
    for (const [subcategory, items] of Object.entries(productData.electronics)) {
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
    for (const [subcategory, items] of Object.entries(productData.fashion)) {
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
    console.log(`✓ Created ${insertedProducts.length} products\n`);

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
    console.log(`✓ Created ${productImages.length} product images\n`);

    // Create inventory
    console.log('Creating inventory...');
    const inventoryData = insertedProducts.map((product) => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 150) + 50,
      lowStockThreshold: 10,
    }));
    await db.insert(schema.inventory).values(inventoryData);
    console.log(`✓ Created inventory for ${inventoryData.length} products\n`);

    console.log('✅ Demo data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${mainCategories.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Product Images: ${productImages.length}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Go to http://localhost:3000/login');
    console.log('   3. You will be redirected to /register');
    console.log('   4. Create your first account - it will automatically be an admin!');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedDemoData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
