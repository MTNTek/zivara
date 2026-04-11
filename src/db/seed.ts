import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { db, client } from './index';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('Clearing existing data...');
    // Use TRUNCATE CASCADE to handle all FK dependencies cleanly
    await db.execute(sql`
      TRUNCATE TABLE 
        supplier_price_history, sub_order_items, sub_orders,
        markup_rules, product_supplier_links, sync_jobs, suppliers,
        exchange_rates, wishlist_items, price_history, reviews,
        order_status_history, order_items, orders,
        cart_items, inventory, product_images, products,
        categories, contact_messages, user_addresses,
        accounts, sessions, verifications, users
      CASCADE
    `);
    console.log('✓ Existing data cleared');

    // 1. Create Users
    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 12);
    const [adminUser] = await db.insert(schema.users).values({ email: 'admin@zivara.com', passwordHash, name: 'Admin User', role: 'admin', isActive: true }).returning();
    const [customer1] = await db.insert(schema.users).values({ email: 'john.doe@example.com', passwordHash, name: 'John Doe', role: 'customer', isActive: true }).returning();
    const [customer2] = await db.insert(schema.users).values({ email: 'jane.smith@example.com', passwordHash, name: 'Jane Smith', role: 'customer', isActive: true }).returning();
    const [customer3] = await db.insert(schema.users).values({ email: 'bob.wilson@example.com', passwordHash, name: 'Bob Wilson', role: 'customer', isActive: true }).returning();
    console.log('✓ Created 4 users');
    const allUsers = [adminUser, customer1, customer2, customer3];
    for (const user of allUsers) {
      await db.insert(schema.accounts).values({ userId: user.id, accountId: user.id, providerId: 'credential', password: passwordHash });
    }
    console.log('✓ Created auth accounts');

    // 2. Create Categories
    console.log('Creating categories...');
    const cat = async (name: string, slug: string, desc: string, parentId?: string, order = 0) => {
      const [c] = await db.insert(schema.categories).values({ name, slug, description: desc, parentId, displayOrder: order }).returning();
      return c;
    };
    const electronics = await cat('Electronics', 'electronics', 'Electronic devices and accessories', undefined, 1);
    const mensFashion = await cat("Men's Fashion", 'mens-fashion', "Men's clothing and accessories", undefined, 2);
    const womensFashion = await cat("Women's Fashion", 'womens-fashion', "Women's clothing and accessories", undefined, 3);
    const homeKitchen = await cat('Home & Kitchen', 'home-kitchen', 'Home improvement and kitchen essentials', undefined, 4);
    const beautyHealth = await cat('Beauty & Health', 'beauty-health', 'Beauty products and health supplements', undefined, 5);
    const sportsOutdoors = await cat('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', undefined, 6);
    const toysGames = await cat('Toys & Games', 'toys-games', 'Toys, games and entertainment', undefined, 7);
    const books = await cat('Books', 'books', 'Books, magazines and publications', undefined, 8);
    const automotive = await cat('Automotive', 'automotive', 'Car accessories and tools', undefined, 9);
    const petSupplies = await cat('Pet Supplies', 'pet-supplies', 'Pet food, toys and accessories', undefined, 10);
    const officeProducts = await cat('Office Products', 'office-products', 'Office and school supplies', undefined, 11);
    const garden = await cat('Garden', 'garden', 'Gardening tools and outdoor living', undefined, 12);

    // Subcategories
    const smartphones = await cat('Smartphones & Accessories', 'smartphones', 'Phones and phone accessories', electronics.id, 1);
    const laptops = await cat('Laptops & Computers', 'laptops-computers', 'Laptops, desktops and components', electronics.id, 2);
    const headphones = await cat('Headphones & Audio', 'headphones-audio', 'Headphones, earbuds and speakers', electronics.id, 3);
    const tvHome = await cat('TV & Home Theater', 'tv-home-theater', 'Televisions and home entertainment', electronics.id, 4);
    const gaming = await cat('Gaming', 'gaming', 'Gaming consoles and accessories', electronics.id, 5);
    const smartHome = await cat('Smart Home', 'smart-home', 'Smart home devices and automation', electronics.id, 6);
    const cameras = await cat('Cameras & Photography', 'cameras', 'Digital cameras and photography gear', electronics.id, 7);
    const wearables = await cat('Wearables', 'wearables', 'Smartwatches and fitness trackers', electronics.id, 8);
    const mensClothing = await cat('Clothing', 'mens-clothing', "Men's clothing", mensFashion.id, 1);
    const mensShoes = await cat('Shoes', 'mens-shoes', "Men's footwear", mensFashion.id, 2);
    const mensWatches = await cat('Watches', 'mens-watches', "Men's watches", mensFashion.id, 3);
    const mensAccessories = await cat('Accessories', 'mens-accessories', "Men's accessories", mensFashion.id, 4);
    const womensClothing = await cat('Clothing', 'womens-clothing', "Women's clothing", womensFashion.id, 1);
    const womensShoes = await cat('Shoes', 'womens-shoes', "Women's footwear", womensFashion.id, 2);
    const womensHandbags = await cat('Handbags', 'womens-handbags', "Women's handbags and purses", womensFashion.id, 3);
    const womensJewelry = await cat('Jewelry', 'womens-jewelry', "Women's jewelry", womensFashion.id, 4);
    const furniture = await cat('Furniture', 'furniture', 'Home furniture', homeKitchen.id, 1);
    const kitchenAppliances = await cat('Kitchen Appliances', 'kitchen-appliances', 'Kitchen appliances and gadgets', homeKitchen.id, 2);
    const bedding = await cat('Bedding', 'bedding', 'Bedding and linens', homeKitchen.id, 3);
    const homeDecor = await cat('Home Decor', 'home-decor', 'Decorative items for the home', homeKitchen.id, 4);
    const lighting = await cat('Lighting', 'lighting', 'Lamps and lighting fixtures', homeKitchen.id, 5);
    const skincare = await cat('Skincare', 'skincare', 'Skincare products', beautyHealth.id, 1);
    const makeup = await cat('Makeup', 'makeup', 'Makeup and cosmetics', beautyHealth.id, 2);
    const haircare = await cat('Haircare', 'haircare', 'Hair care products', beautyHealth.id, 3);
    const fragrances = await cat('Fragrances', 'fragrances', 'Perfumes and colognes', beautyHealth.id, 4);
    const fitness = await cat('Exercise & Fitness', 'fitness', 'Fitness equipment and accessories', sportsOutdoors.id, 1);
    const outdoorRec = await cat('Outdoor Recreation', 'outdoor-recreation', 'Outdoor activities and gear', sportsOutdoors.id, 2);
    const cycling = await cat('Cycling', 'cycling', 'Bikes and cycling gear', sportsOutdoors.id, 3);
    const boardGames = await cat('Board Games', 'board-games', 'Board games and puzzles', toysGames.id, 1);
    const buildingToys = await cat('Building Toys', 'building-toys', 'Building blocks and construction sets', toysGames.id, 2);
    const educationalToys = await cat('Educational Toys', 'educational-toys', 'Learning and educational toys', toysGames.id, 3);
    const fiction = await cat('Fiction', 'fiction', 'Fiction books', books.id, 1);
    const nonFiction = await cat('Non-Fiction', 'non-fiction', 'Non-fiction books', books.id, 2);
    const carAccessories = await cat('Car Accessories', 'car-accessories', 'Car accessories and parts', automotive.id, 1);
    const carElectronics = await cat('Car Electronics', 'car-electronics', 'Car electronic devices', automotive.id, 2);
    const autoTools = await cat('Tools & Equipment', 'auto-tools', 'Automotive tools', automotive.id, 3);
    const dogSupplies = await cat('Dog Supplies', 'dog-supplies', 'Dog food, toys and accessories', petSupplies.id, 1);
    const catSupplies = await cat('Cat Supplies', 'cat-supplies', 'Cat food, toys and accessories', petSupplies.id, 2);
    const officeSupplies = await cat('Office Supplies', 'office-supplies', 'Pens, paper and office essentials', officeProducts.id, 1);
    const officeFurniture = await cat('Office Furniture', 'office-furniture', 'Desks, chairs and office furniture', officeProducts.id, 2);
    const gardenTools = await cat('Gardening Tools', 'gardening-tools', 'Tools for gardening', garden.id, 1);
    const outdoorFurniture = await cat('Outdoor Furniture', 'outdoor-furniture', 'Patio and outdoor furniture', garden.id, 2);
    console.log('✓ Created all categories');

    // 3. Create Products
    console.log('Creating products...');
    type P = { name: string; slug: string; description: string; price: string; discountPrice?: string; categoryId: string; sku: string; images: { url: string; alt: string }[] };
    const img = (id: string, alt: string) => [{ url: `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop`, alt }];

    const allProductSeeds: P[] = [
      // ── Subcategory products (2-3 each) ──
      // Electronics subs
      { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, and 48MP camera.', price: '1199.99', discountPrice: '1099.99', categoryId: smartphones.id, sku: 'ELEC-SP-001', images: img('1695048133142-1a20484d2569', 'iPhone 15 Pro Max') },
      { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'Samsung Galaxy S24 Ultra with Galaxy AI, S Pen, and 200MP camera.', price: '1299.99', categoryId: smartphones.id, sku: 'ELEC-SP-002', images: img('1610945265064-0e34e5519bbf', 'Samsung Galaxy S24') },
      { name: 'Phone Case Collection', slug: 'phone-case-collection', description: 'Premium protective phone cases for all major smartphone brands.', price: '29.99', categoryId: smartphones.id, sku: 'ELEC-SP-003', images: img('1601784551446-20c9e07cdbdb', 'Phone Cases') },
      { name: 'MacBook Pro 16" M3 Max', slug: 'macbook-pro-16-m3', description: 'Apple MacBook Pro 16-inch with M3 Max chip, 36GB RAM, 1TB SSD.', price: '3499.99', discountPrice: '3299.99', categoryId: laptops.id, sku: 'ELEC-LP-001', images: img('1517336714731-489689fd1ca8', 'MacBook Pro') },
      { name: 'Dell XPS 15', slug: 'dell-xps-15', description: 'Dell XPS 15 with Intel Core i9, 32GB RAM, OLED display.', price: '1899.99', categoryId: laptops.id, sku: 'ELEC-LP-002', images: img('1593642632559-0c6d3fc62b89', 'Dell XPS Laptop') },
      { name: 'Sony WH-1000XM5', slug: 'sony-wh1000xm5', description: 'Industry-leading noise canceling wireless headphones.', price: '349.99', discountPrice: '299.99', categoryId: headphones.id, sku: 'ELEC-HP-001', images: img('1505740420928-5e560c06d30e', 'Sony Headphones') },
      { name: 'AirPods Pro 2nd Gen', slug: 'airpods-pro-2', description: 'Apple AirPods Pro with adaptive audio, USB-C charging case.', price: '249.99', categoryId: headphones.id, sku: 'ELEC-HP-002', images: img('1606220588913-b3aacb4d2f46', 'AirPods Pro') },
      { name: 'LG C3 65" OLED TV', slug: 'lg-c3-65-oled', description: 'LG 65-inch OLED evo TV with Dolby Vision and Dolby Atmos.', price: '1799.99', discountPrice: '1499.99', categoryId: tvHome.id, sku: 'ELEC-TV-001', images: img('1593359677879-a4bb92f829d1', 'LG OLED TV') },
      { name: 'Sonos Arc Soundbar', slug: 'sonos-arc-soundbar', description: 'Premium smart soundbar with Dolby Atmos and spatial audio.', price: '899.99', categoryId: tvHome.id, sku: 'ELEC-TV-002', images: img('1545454675-3531b543be5d', 'Sonos Soundbar') },
      { name: 'PlayStation 5 Console', slug: 'playstation-5', description: 'Sony PS5 console with DualSense controller and 825GB SSD.', price: '499.99', categoryId: gaming.id, sku: 'ELEC-GM-001', images: img('1606144042614-b2417e99c4e3', 'PlayStation 5') },
      { name: 'Xbox Series X', slug: 'xbox-series-x', description: 'Microsoft Xbox Series X with 1TB SSD and 4K gaming.', price: '499.99', categoryId: gaming.id, sku: 'ELEC-GM-002', images: img('1621259182978-fbf93132d53d', 'Xbox Series X') },
      { name: 'Amazon Echo Show 10', slug: 'echo-show-10', description: 'Smart display with motion tracking, premium sound, and Alexa.', price: '249.99', categoryId: smartHome.id, sku: 'ELEC-SH-001', images: img('1558089687-f282ffcbc126', 'Echo Show') },
      { name: 'Philips Hue Starter Kit', slug: 'philips-hue-starter', description: 'Smart lighting starter kit with bridge and 4 color bulbs.', price: '179.99', categoryId: smartHome.id, sku: 'ELEC-SH-002', images: img('1558618666-fcd25c85f82e', 'Philips Hue') },
      { name: 'Sony Alpha A7 IV', slug: 'sony-alpha-a7iv', description: 'Full-frame mirrorless camera with 33MP sensor and 4K video.', price: '2499.99', categoryId: cameras.id, sku: 'ELEC-CM-001', images: img('1516035069371-29a1b244cc32', 'Sony Alpha') },
      { name: 'Canon EOS R6 Mark II', slug: 'canon-eos-r6-ii', description: 'Professional mirrorless camera with 24.2MP and advanced autofocus.', price: '2299.99', categoryId: cameras.id, sku: 'ELEC-CM-002', images: img('1502920917128-1aa500764cbd', 'Canon Camera') },
      { name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'Rugged smartwatch with precision GPS, 36-hour battery life.', price: '799.99', categoryId: wearables.id, sku: 'ELEC-WR-001', images: img('1434493789847-2f02dc6ca35d', 'Apple Watch') },
      { name: 'Fitbit Charge 6', slug: 'fitbit-charge-6', description: 'Advanced fitness tracker with GPS, heart rate, and stress management.', price: '159.99', categoryId: wearables.id, sku: 'ELEC-WR-002', images: img('1575311373937-040b8e1fd5b6', 'Fitbit') },
      // Fashion subs
      { name: 'Classic Cotton T-Shirt', slug: 'classic-cotton-tshirt', description: 'Premium 100% cotton crew neck t-shirt.', price: '29.99', categoryId: mensClothing.id, sku: 'MEN-CL-001', images: img('1521572163474-6864f9cf17ab', 'Cotton T-Shirt') },
      { name: 'Slim Fit Chino Pants', slug: 'slim-fit-chinos', description: 'Modern slim fit chino pants with stretch comfort.', price: '59.99', categoryId: mensClothing.id, sku: 'MEN-CL-002', images: img('1473966968600-fa801b869a1a', 'Chino Pants') },
      { name: 'Leather Oxford Shoes', slug: 'leather-oxford-shoes', description: 'Handcrafted genuine leather oxford dress shoes.', price: '149.99', categoryId: mensShoes.id, sku: 'MEN-SH-001', images: img('1614252369475-531eba835eb1', 'Oxford Shoes') },
      { name: 'Running Sneakers Pro', slug: 'running-sneakers-pro', description: 'Lightweight performance running shoes with cushioned sole.', price: '129.99', categoryId: mensShoes.id, sku: 'MEN-SH-002', images: img('1542291026-7eec264c27ff', 'Running Sneakers') },
      { name: 'Automatic Dress Watch', slug: 'automatic-dress-watch', description: 'Swiss automatic movement dress watch with sapphire crystal.', price: '499.99', discountPrice: '399.99', categoryId: mensWatches.id, sku: 'MEN-WT-001', images: img('1524592094714-0f0654e20314', 'Dress Watch') },
      { name: 'Sport Chronograph Watch', slug: 'sport-chronograph', description: 'Stainless steel chronograph with water resistance to 100m.', price: '299.99', categoryId: mensWatches.id, sku: 'MEN-WT-002', images: img('1522312346375-d1a52e2b99b3', 'Chronograph') },
      { name: 'Italian Leather Belt', slug: 'italian-leather-belt', description: 'Genuine Italian leather belt with brushed nickel buckle.', price: '59.99', categoryId: mensAccessories.id, sku: 'MEN-AC-001', images: img('1553062407-98eeb64c6a62', 'Leather Belt') },
      { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses-men', description: 'Classic aviator sunglasses with polarized lenses.', price: '79.99', categoryId: mensAccessories.id, sku: 'MEN-AC-002', images: img('1572635196237-14b3f281503f', 'Aviator Sunglasses') },
      { name: 'Floral Maxi Dress', slug: 'floral-maxi-dress', description: 'Elegant floral print maxi dress with flowing silhouette.', price: '89.99', categoryId: womensClothing.id, sku: 'WOM-CL-001', images: img('1572804013309-59a88b7e92f1', 'Floral Dress') },
      { name: 'Cashmere Sweater', slug: 'cashmere-sweater-women', description: 'Luxurious 100% cashmere crew neck sweater.', price: '159.99', categoryId: womensClothing.id, sku: 'WOM-CL-002', images: img('1576566588028-4147f3842f27', 'Cashmere Sweater') },
      { name: 'Leather Ankle Boots', slug: 'leather-ankle-boots', description: 'Stylish leather ankle boots with block heel.', price: '139.99', categoryId: womensShoes.id, sku: 'WOM-SH-001', images: img('1543163521-1bf539c55dd2', 'Ankle Boots') },
      { name: 'Classic Stiletto Heels', slug: 'classic-stiletto-heels', description: 'Elegant pointed-toe stiletto heels for formal occasions.', price: '119.99', categoryId: womensShoes.id, sku: 'WOM-SH-002', images: img('1515347619252-60a4bf4fff4f', 'Stiletto Heels') },
      { name: 'Leather Tote Bag', slug: 'leather-tote-bag', description: 'Spacious genuine leather tote bag with interior organizer.', price: '199.99', discountPrice: '169.99', categoryId: womensHandbags.id, sku: 'WOM-HB-001', images: img('1584917865442-de89df76afd3', 'Tote Bag') },
      { name: 'Crossbody Chain Bag', slug: 'crossbody-chain-bag', description: 'Elegant crossbody bag with gold chain strap.', price: '129.99', categoryId: womensHandbags.id, sku: 'WOM-HB-002', images: img('1548036328-c9fa89d128fa', 'Crossbody Bag') },
      { name: 'Diamond Pendant Necklace', slug: 'diamond-pendant-necklace', description: 'Sterling silver necklace with cubic zirconia pendant.', price: '89.99', categoryId: womensJewelry.id, sku: 'WOM-JW-001', images: img('1599643478518-a784e5dc4c8f', 'Pendant Necklace') },
      { name: 'Gold Hoop Earrings', slug: 'gold-hoop-earrings', description: '14K gold-plated hoop earrings, lightweight and hypoallergenic.', price: '49.99', categoryId: womensJewelry.id, sku: 'WOM-JW-002', images: img('1535632066927-ab7c9ab60908', 'Hoop Earrings') },
      // Home & Kitchen subs
      { name: 'Mid-Century Modern Sofa', slug: 'mid-century-modern-sofa', description: 'Elegant mid-century modern sofa with tufted cushions.', price: '899.99', discountPrice: '749.99', categoryId: furniture.id, sku: 'HOME-FR-001', images: img('1555041469-a586c61ea9bc', 'Modern Sofa') },
      { name: 'Solid Wood Dining Table', slug: 'solid-wood-dining-table', description: 'Handcrafted solid oak dining table seats 6-8.', price: '1299.99', categoryId: furniture.id, sku: 'HOME-FR-002', images: img('1617806118233-18e1de247200', 'Dining Table') },
      { name: 'Professional Stand Mixer', slug: 'professional-stand-mixer', description: 'Heavy-duty stand mixer with 10 speed settings.', price: '349.99', categoryId: kitchenAppliances.id, sku: 'HOME-KA-001', images: img('1594385208974-2f8bb07b7a45', 'Stand Mixer') },
      { name: 'Smart Air Fryer Oven', slug: 'smart-air-fryer-oven', description: 'Digital air fryer oven with 12 cooking presets.', price: '199.99', categoryId: kitchenAppliances.id, sku: 'HOME-KA-002', images: img('1585515320310-259814833e62', 'Air Fryer') },
      { name: 'Egyptian Cotton Sheet Set', slug: 'egyptian-cotton-sheets', description: '1000 thread count Egyptian cotton sheet set, queen.', price: '149.99', categoryId: bedding.id, sku: 'HOME-BD-001', images: img('1522771739844-6a9f6d5f14af', 'Cotton Sheets') },
      { name: 'Memory Foam Pillow Set', slug: 'memory-foam-pillows', description: 'Cooling gel memory foam pillows, set of 2.', price: '79.99', categoryId: bedding.id, sku: 'HOME-BD-002', images: img('1584100936595-c0654b55a2e2', 'Foam Pillows') },
      { name: 'Abstract Canvas Wall Art', slug: 'abstract-canvas-art', description: 'Large abstract canvas print, gallery-wrapped, 36x48.', price: '129.99', categoryId: homeDecor.id, sku: 'HOME-DC-001', images: img('1513519245088-0e12902e35ca', 'Canvas Art') },
      { name: 'Ceramic Vase Collection', slug: 'ceramic-vase-collection', description: 'Set of 3 handmade ceramic vases in earth tones.', price: '69.99', categoryId: homeDecor.id, sku: 'HOME-DC-002', images: img('1578500494198-246f612d3b3d', 'Ceramic Vases') },
      { name: 'Modern Pendant Light', slug: 'modern-pendant-light', description: 'Minimalist pendant light with brass finish.', price: '159.99', categoryId: lighting.id, sku: 'HOME-LT-001', images: img('1524484485831-a92ffc0de03f', 'Pendant Light') },
      { name: 'LED Floor Lamp', slug: 'led-floor-lamp', description: 'Adjustable LED floor lamp with dimmer control.', price: '89.99', categoryId: lighting.id, sku: 'HOME-LT-002', images: img('1507473885765-e6ed057ab6fe', 'Floor Lamp') },
      // Beauty, Sports, Toys, Books, Auto, Pet, Office, Garden subs
      { name: 'Vitamin C Serum', slug: 'vitamin-c-serum', description: 'Brightening vitamin C serum with hyaluronic acid.', price: '34.99', categoryId: skincare.id, sku: 'BEA-SK-001', images: img('1620916566398-39f1143ab7be', 'Vitamin C Serum') },
      { name: 'Retinol Night Cream', slug: 'retinol-night-cream', description: 'Anti-aging retinol night cream with peptides.', price: '49.99', categoryId: skincare.id, sku: 'BEA-SK-002', images: img('1556228578-0d85b1a4d571', 'Night Cream') },
      { name: 'Professional Makeup Palette', slug: 'pro-makeup-palette', description: '24-shade eyeshadow palette with matte and shimmer.', price: '54.99', categoryId: makeup.id, sku: 'BEA-MK-001', images: img('1512496015851-a90fb38ba796', 'Makeup Palette') },
      { name: 'Matte Lipstick Set', slug: 'matte-lipstick-set', description: 'Long-lasting matte lipstick set with 6 shades.', price: '39.99', categoryId: makeup.id, sku: 'BEA-MK-002', images: img('1586495777744-4413f21062fa', 'Lipstick Set') },
      { name: 'Argan Oil Hair Treatment', slug: 'argan-oil-treatment', description: 'Moroccan argan oil hair treatment for shine.', price: '24.99', categoryId: haircare.id, sku: 'BEA-HC-001', images: img('1527799820374-dcf8d9d4a388', 'Argan Oil') },
      { name: 'Professional Hair Dryer', slug: 'professional-hair-dryer', description: 'Ionic hair dryer with multiple heat settings.', price: '79.99', categoryId: haircare.id, sku: 'BEA-HC-002', images: img('1522338140262-f46f5913618a', 'Hair Dryer') },
      { name: 'Luxury Eau de Parfum', slug: 'luxury-eau-de-parfum', description: 'Premium eau de parfum with jasmine and sandalwood.', price: '129.99', categoryId: fragrances.id, sku: 'BEA-FR-001', images: img('1541643600914-78b084683601', 'Luxury Perfume') },
      { name: 'Fresh Cologne Collection', slug: 'fresh-cologne-collection', description: 'Set of 3 fresh citrus colognes for everyday wear.', price: '89.99', categoryId: fragrances.id, sku: 'BEA-FR-002', images: img('1523293182086-7651a899d37f', 'Cologne Set') },
      { name: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', description: 'Adjustable dumbbells 5-52.5 lbs with quick-change.', price: '349.99', discountPrice: '299.99', categoryId: fitness.id, sku: 'SPO-FT-001', images: img('1534438327276-14e5300c3a48', 'Dumbbell Set') },
      { name: 'Premium Yoga Mat', slug: 'premium-yoga-mat', description: 'Extra thick non-slip yoga mat with carrying strap.', price: '49.99', categoryId: fitness.id, sku: 'SPO-FT-002', images: img('1601925260368-ae2f83cf8b7f', 'Yoga Mat') },
      { name: '4-Person Camping Tent', slug: '4-person-camping-tent', description: 'Waterproof 4-person tent with easy setup.', price: '199.99', categoryId: outdoorRec.id, sku: 'SPO-OR-001', images: img('1504280390367-361c6d9f38f4', 'Camping Tent') },
      { name: 'Hiking Backpack 65L', slug: 'hiking-backpack-65l', description: 'Professional hiking backpack with rain cover.', price: '149.99', categoryId: outdoorRec.id, sku: 'SPO-OR-002', images: img('1622260614153-03223fb72052', 'Hiking Backpack') },
      { name: 'Carbon Road Bike', slug: 'carbon-road-bike', description: 'Lightweight carbon fiber road bike with Shimano.', price: '2499.99', categoryId: cycling.id, sku: 'SPO-CY-001', images: img('1485965120184-e220f721d03e', 'Road Bike') },
      { name: 'Cycling Helmet Pro', slug: 'cycling-helmet-pro', description: 'Aerodynamic cycling helmet with MIPS protection.', price: '129.99', categoryId: cycling.id, sku: 'SPO-CY-002', images: img('1557803175-2f0c0c4e3f0e', 'Cycling Helmet') },
      { name: 'Strategy Board Game Collection', slug: 'strategy-board-games', description: 'Collection of 3 popular strategy board games.', price: '59.99', categoryId: boardGames.id, sku: 'TOY-BG-001', images: img('1611371805429-8b5c1b2c34ba', 'Board Games') },
      { name: '1000-Piece Puzzle Set', slug: '1000-piece-puzzle', description: 'Beautiful landscape 1000-piece jigsaw puzzle.', price: '24.99', categoryId: boardGames.id, sku: 'TOY-BG-002', images: img('1606503153255-59d8b8b82176', 'Jigsaw Puzzle') },
      { name: 'Architecture Building Set', slug: 'architecture-building-set', description: 'Advanced building block set with 2500+ pieces.', price: '89.99', categoryId: buildingToys.id, sku: 'TOY-BT-001', images: img('1587654780291-39c9404d7dd0', 'Building Set') },
      { name: 'Magnetic Tiles Set', slug: 'magnetic-tiles-set', description: 'Colorful magnetic building tiles, 100-piece set.', price: '49.99', categoryId: buildingToys.id, sku: 'TOY-BT-002', images: img('1596461404969-9ae70f2830c1', 'Magnetic Tiles') },
      { name: 'Kids Science Kit', slug: 'kids-science-kit', description: 'STEM science experiment kit with 50+ experiments.', price: '39.99', categoryId: educationalToys.id, sku: 'TOY-ED-001', images: img('1596464716127-f2a82984de30', 'Science Kit') },
      { name: 'Coding Robot for Kids', slug: 'coding-robot-kids', description: 'Programmable robot that teaches coding basics.', price: '79.99', categoryId: educationalToys.id, sku: 'TOY-ED-002', images: img('1535378917042-10a22c95931a', 'Coding Robot') },
      { name: 'Bestseller Fiction Collection', slug: 'bestseller-fiction', description: 'Curated collection of 5 bestselling fiction novels.', price: '49.99', categoryId: fiction.id, sku: 'BOK-FI-001', images: img('1544947950-fa07a98d237f', 'Fiction Books') },
      { name: 'Sci-Fi Anthology', slug: 'sci-fi-anthology', description: 'Award-winning science fiction anthology.', price: '19.99', categoryId: fiction.id, sku: 'BOK-FI-002', images: img('1532012197267-da84d127e765', 'Sci-Fi Book') },
      { name: 'Business Leadership Guide', slug: 'business-leadership-guide', description: 'Comprehensive guide to modern business leadership.', price: '29.99', categoryId: nonFiction.id, sku: 'BOK-NF-001', images: img('1589998059171-988d887df646', 'Business Book') },
      { name: 'Mindfulness & Meditation', slug: 'mindfulness-meditation-book', description: 'Practical guide to mindfulness and meditation.', price: '18.99', categoryId: nonFiction.id, sku: 'BOK-NF-002', images: img('1506880018603-83d5b814b5a6', 'Meditation Book') },
      { name: 'Car Phone Mount', slug: 'car-phone-mount', description: 'Universal magnetic car phone mount with 360 rotation.', price: '24.99', categoryId: carAccessories.id, sku: 'AUT-CA-001', images: img('1549399542-7e3f8b79c341', 'Car Phone Mount') },
      { name: 'Dash Cam Pro 4K', slug: 'dash-cam-pro-4k', description: '4K dash camera with night vision and GPS.', price: '149.99', categoryId: carElectronics.id, sku: 'AUT-CE-001', images: img('1558618666-fcd25c85f82e', 'Dash Cam') },
      { name: 'Mechanic Tool Set 256pc', slug: 'mechanic-tool-set', description: 'Professional 256-piece mechanic tool set.', price: '299.99', discountPrice: '249.99', categoryId: autoTools.id, sku: 'AUT-TL-001', images: img('1530124566582-a45a7e3f2809', 'Tool Set') },
      { name: 'Premium Dog Food 30lb', slug: 'premium-dog-food', description: 'Grain-free premium dog food with real chicken.', price: '54.99', categoryId: dogSupplies.id, sku: 'PET-DG-001', images: img('1601758228041-f3b2795255f1', 'Dog Food') },
      { name: 'Interactive Dog Toy Set', slug: 'interactive-dog-toys', description: 'Set of 5 interactive and durable dog toys.', price: '29.99', categoryId: dogSupplies.id, sku: 'PET-DG-002', images: img('1535930749574-1399327ce78f', 'Dog Toys') },
      { name: 'Cat Tree Tower', slug: 'cat-tree-tower', description: 'Multi-level cat tree with scratching posts and hammock.', price: '89.99', categoryId: catSupplies.id, sku: 'PET-CT-001', images: img('1545249390-6bdfa286032f', 'Cat Tree') },
      { name: 'Automatic Cat Feeder', slug: 'automatic-cat-feeder', description: 'WiFi-enabled automatic cat feeder with portion control.', price: '69.99', categoryId: catSupplies.id, sku: 'PET-CT-002', images: img('1574158622682-e40e69881006', 'Cat Feeder') },
      { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Adjustable ergonomic office chair with lumbar support.', price: '399.99', discountPrice: '349.99', categoryId: officeFurniture.id, sku: 'OFF-FN-001', images: img('1580480055273-228ff5388ef8', 'Office Chair') },
      { name: 'Standing Desk Converter', slug: 'standing-desk-converter', description: 'Height-adjustable standing desk converter.', price: '249.99', categoryId: officeFurniture.id, sku: 'OFF-FN-002', images: img('1518455027359-f3f8164ba6bd', 'Standing Desk') },
      { name: 'Premium Notebook Set', slug: 'premium-notebook-set', description: 'Set of 5 premium hardcover notebooks with dotted pages.', price: '34.99', categoryId: officeSupplies.id, sku: 'OFF-SP-001', images: img('1531346878377-a5be20888e57', 'Notebook Set') },
      { name: 'Wireless Keyboard & Mouse', slug: 'wireless-keyboard-mouse', description: 'Slim wireless keyboard and mouse combo.', price: '59.99', categoryId: officeSupplies.id, sku: 'OFF-SP-002', images: img('1587829741301-dc798b83add3', 'Keyboard Mouse') },
      { name: 'Garden Tool Set 12pc', slug: 'garden-tool-set', description: 'Complete 12-piece stainless steel garden tool set.', price: '49.99', categoryId: gardenTools.id, sku: 'GAR-TL-001', images: img('1416879595882-3373a0480b5b', 'Garden Tools') },
      { name: 'Cordless Hedge Trimmer', slug: 'cordless-hedge-trimmer', description: '20V cordless hedge trimmer with 22-inch blade.', price: '129.99', categoryId: gardenTools.id, sku: 'GAR-TL-002', images: img('1416879595882-3373a0480b5b', 'Hedge Trimmer') },
      { name: 'Patio Dining Set', slug: 'patio-dining-set', description: '7-piece outdoor patio dining set, weather-resistant.', price: '799.99', discountPrice: '649.99', categoryId: outdoorFurniture.id, sku: 'GAR-OF-001', images: img('1600210492486-724fe5c67fb0', 'Patio Set') },
      { name: 'Outdoor Lounge Chair Set', slug: 'outdoor-lounge-chairs', description: 'Set of 2 adjustable outdoor lounge chairs.', price: '349.99', categoryId: outdoorFurniture.id, sku: 'GAR-OF-002', images: img('1506439773649-6e0eb8cfb237', 'Lounge Chairs') },
      // ══════════════════════════════════════════════
      // ── ROOT CATEGORY PRODUCTS (15 per category) ──
      // ══════════════════════════════════════════════

      // ── Electronics (15) ──
      { name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'Waterproof portable Bluetooth speaker with 24-hour battery and 360-degree sound.', price: '79.99', discountPrice: '59.99', categoryId: electronics.id, sku: 'RE-001', images: img('1608043152269-423dbba4e7e1', 'Bluetooth Speaker') },
      { name: 'USB-C Hub Multiport Adapter', slug: 'usb-c-hub-adapter', description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W PD charging.', price: '49.99', categoryId: electronics.id, sku: 'RE-002', images: img('1625842268584-8f3296236761', 'USB-C Hub') },
      { name: 'Wireless Charging Pad', slug: 'wireless-charging-pad', description: 'Fast wireless charging pad compatible with all Qi-enabled devices, 15W max.', price: '29.99', categoryId: electronics.id, sku: 'RE-003', images: img('1586953208448-b95a79798f07', 'Wireless Charger') },
      { name: 'Mechanical Gaming Keyboard', slug: 'mechanical-gaming-keyboard', description: 'RGB mechanical keyboard with Cherry MX switches and aluminum frame.', price: '149.99', categoryId: electronics.id, sku: 'RE-004', images: img('1587829741301-dc798b83add3', 'Gaming Keyboard') },
      { name: 'Wireless Gaming Mouse', slug: 'wireless-gaming-mouse', description: 'Ultra-lightweight wireless gaming mouse with 25K DPI sensor.', price: '79.99', categoryId: electronics.id, sku: 'RE-005', images: img('1527864438517-0ad1c7d3d74c', 'Gaming Mouse') },
      { name: '4K Webcam Pro', slug: '4k-webcam-pro', description: '4K webcam with auto-focus, noise-canceling mic, and ring light.', price: '129.99', categoryId: electronics.id, sku: 'RE-006', images: img('1587826080692-f439cd0b70e8', 'Webcam') },
      { name: 'Portable SSD 2TB', slug: 'portable-ssd-2tb', description: 'Ultra-fast portable SSD with 2TB storage and USB 3.2 Gen 2.', price: '179.99', discountPrice: '149.99', categoryId: electronics.id, sku: 'RE-007', images: img('1597872200969-2b65d56bd16b', 'Portable SSD') },
      { name: 'Smart Power Strip', slug: 'smart-power-strip', description: 'WiFi smart power strip with 4 outlets, 4 USB ports, and voice control.', price: '34.99', categoryId: electronics.id, sku: 'RE-008', images: img('1558618666-fcd25c85f82e', 'Smart Power Strip') },
      { name: 'Noise Canceling Earbuds', slug: 'noise-canceling-earbuds', description: 'True wireless earbuds with active noise cancellation and 30hr battery.', price: '99.99', categoryId: electronics.id, sku: 'RE-009', images: img('1606220588913-b3aacb4d2f46', 'Wireless Earbuds') },
      { name: 'Digital Drawing Tablet', slug: 'digital-drawing-tablet', description: '10-inch drawing tablet with 8192 pressure levels and tilt support.', price: '69.99', categoryId: electronics.id, sku: 'RE-010', images: img('1625842268584-8f3296236761', 'Drawing Tablet') },
      { name: 'Mini Projector HD', slug: 'mini-projector-hd', description: 'Portable mini projector with 1080p native resolution and WiFi.', price: '199.99', categoryId: electronics.id, sku: 'RE-011', images: img('1593359677879-a4bb92f829d1', 'Mini Projector') },
      { name: 'Smart Doorbell Camera', slug: 'smart-doorbell-camera', description: 'Video doorbell with 2K resolution, night vision, and two-way audio.', price: '149.99', categoryId: electronics.id, sku: 'RE-012', images: img('1558089687-f282ffcbc126', 'Doorbell Camera') },
      { name: 'Portable Power Station', slug: 'portable-power-station', description: '500W portable power station with solar charging capability.', price: '399.99', discountPrice: '349.99', categoryId: electronics.id, sku: 'RE-013', images: img('1586953208448-b95a79798f07', 'Power Station') },
      { name: 'Electric Scooter', slug: 'electric-scooter-commuter', description: 'Foldable electric scooter with 25-mile range and 15.5 mph top speed.', price: '499.99', categoryId: electronics.id, sku: 'RE-014', images: img('1558618666-fcd25c85f82e', 'Electric Scooter') },
      { name: 'Robot Vacuum & Mop', slug: 'robot-vacuum-mop-combo', description: '2-in-1 robot vacuum and mop with LiDAR navigation and auto-empty.', price: '549.99', discountPrice: '449.99', categoryId: electronics.id, sku: 'RE-015', images: img('1558618666-fcd25c85f82e', 'Robot Vacuum Mop') },
      // ── Men's Fashion (15) ──
      { name: 'Premium Leather Jacket', slug: 'premium-leather-jacket', description: 'Genuine lambskin leather jacket with quilted lining and biker design.', price: '299.99', discountPrice: '249.99', categoryId: mensFashion.id, sku: 'RM-001', images: img('1551028719-00167b16eac5', 'Leather Jacket') },
      { name: 'Casual Denim Jeans', slug: 'casual-denim-jeans', description: 'Classic straight-fit denim jeans with comfort stretch fabric.', price: '69.99', categoryId: mensFashion.id, sku: 'RM-002', images: img('1542272604-787c3835535d', 'Denim Jeans') },
      { name: 'Formal Dress Shirt', slug: 'formal-dress-shirt', description: 'Wrinkle-free cotton dress shirt with spread collar.', price: '49.99', categoryId: mensFashion.id, sku: 'RM-003', images: img('1602810318383-e386cc2a3ccf', 'Dress Shirt') },
      { name: 'Quilted Puffer Vest', slug: 'quilted-puffer-vest', description: 'Lightweight quilted puffer vest with water-resistant shell.', price: '89.99', categoryId: mensFashion.id, sku: 'RM-004', images: img('1551028719-00167b16eac5', 'Puffer Vest') },
      { name: 'Merino Wool Sweater', slug: 'merino-wool-sweater-men', description: 'Fine merino wool crew neck sweater, machine washable.', price: '79.99', categoryId: mensFashion.id, sku: 'RM-005', images: img('1576566588028-4147f3842f27', 'Wool Sweater') },
      { name: 'Cargo Jogger Pants', slug: 'cargo-jogger-pants', description: 'Tapered cargo jogger pants with elastic waist and cuffs.', price: '54.99', categoryId: mensFashion.id, sku: 'RM-006', images: img('1473966968600-fa801b869a1a', 'Cargo Joggers') },
      { name: 'Linen Summer Shirt', slug: 'linen-summer-shirt', description: 'Breathable linen button-down shirt for warm weather.', price: '44.99', categoryId: mensFashion.id, sku: 'RM-007', images: img('1602810318383-e386cc2a3ccf', 'Linen Shirt') },
      { name: 'Performance Polo Shirt', slug: 'performance-polo-shirt', description: 'Moisture-wicking performance polo with UPF 50+ protection.', price: '39.99', categoryId: mensFashion.id, sku: 'RM-008', images: img('1521572163474-6864f9cf17ab', 'Polo Shirt') },
      { name: 'Waterproof Rain Jacket', slug: 'waterproof-rain-jacket-men', description: 'Lightweight waterproof rain jacket with packable hood.', price: '99.99', categoryId: mensFashion.id, sku: 'RM-009', images: img('1551028719-00167b16eac5', 'Rain Jacket') },
      { name: 'Stretch Dress Pants', slug: 'stretch-dress-pants', description: 'Slim-fit stretch dress pants with wrinkle-free fabric.', price: '64.99', categoryId: mensFashion.id, sku: 'RM-010', images: img('1473966968600-fa801b869a1a', 'Dress Pants') },
      { name: 'Canvas Sneakers Classic', slug: 'canvas-sneakers-classic', description: 'Classic canvas low-top sneakers in multiple colors.', price: '49.99', categoryId: mensFashion.id, sku: 'RM-011', images: img('1542291026-7eec264c27ff', 'Canvas Sneakers') },
      { name: 'Leather Wallet Bifold', slug: 'leather-wallet-bifold', description: 'Genuine leather bifold wallet with RFID blocking.', price: '39.99', categoryId: mensFashion.id, sku: 'RM-012', images: img('1553062407-98eeb64c6a62', 'Leather Wallet') },
      { name: 'Fleece Zip-Up Hoodie', slug: 'fleece-zip-hoodie-men', description: 'Heavyweight fleece zip-up hoodie with kangaroo pockets.', price: '59.99', categoryId: mensFashion.id, sku: 'RM-013', images: img('1521572163474-6864f9cf17ab', 'Fleece Hoodie') },
      { name: 'Swim Trunks Quick-Dry', slug: 'swim-trunks-quick-dry', description: 'Quick-dry swim trunks with mesh liner and zip pocket.', price: '34.99', categoryId: mensFashion.id, sku: 'RM-014', images: img('1473966968600-fa801b869a1a', 'Swim Trunks') },
      { name: 'Thermal Base Layer Set', slug: 'thermal-base-layer-set', description: 'Thermal base layer top and bottom set for cold weather.', price: '44.99', categoryId: mensFashion.id, sku: 'RM-015', images: img('1521572163474-6864f9cf17ab', 'Thermal Base Layer') },
      // ── Women's Fashion (15) ──
      { name: 'Silk Wrap Dress', slug: 'silk-wrap-dress', description: 'Elegant silk wrap dress with adjustable tie waist.', price: '149.99', categoryId: womensFashion.id, sku: 'RW-001', images: img('1595777457583-95e059d581b8', 'Silk Wrap Dress') },
      { name: 'Designer Sunglasses', slug: 'designer-sunglasses-women', description: 'Oversized cat-eye sunglasses with UV400 polarized lenses.', price: '89.99', categoryId: womensFashion.id, sku: 'RW-002', images: img('1511499767150-a48a237f0083', 'Designer Sunglasses') },
      { name: 'Cozy Knit Cardigan', slug: 'cozy-knit-cardigan', description: 'Oversized chunky knit cardigan with button front.', price: '79.99', categoryId: womensFashion.id, sku: 'RW-003', images: img('1434389677669-e08b4cda3a20', 'Knit Cardigan') },
      { name: 'High-Waist Yoga Leggings', slug: 'high-waist-yoga-leggings', description: 'Buttery soft high-waist yoga leggings with hidden pocket.', price: '39.99', categoryId: womensFashion.id, sku: 'RW-004', images: img('1506629082955-511b1aa562c8', 'Yoga Leggings') },
      { name: 'Trench Coat Classic', slug: 'trench-coat-classic-women', description: 'Double-breasted trench coat with belted waist, water-resistant.', price: '179.99', discountPrice: '149.99', categoryId: womensFashion.id, sku: 'RW-005', images: img('1434389677669-e08b4cda3a20', 'Trench Coat') },
      { name: 'Satin Blouse', slug: 'satin-blouse-women', description: 'Elegant satin blouse with bow tie neck, perfect for office.', price: '54.99', categoryId: womensFashion.id, sku: 'RW-006', images: img('1572804013309-59a88b7e92f1', 'Satin Blouse') },
      { name: 'Pleated Midi Skirt', slug: 'pleated-midi-skirt', description: 'Flowing pleated midi skirt with elastic waistband.', price: '49.99', categoryId: womensFashion.id, sku: 'RW-007', images: img('1595777457583-95e059d581b8', 'Midi Skirt') },
      { name: 'Denim Jacket Oversized', slug: 'denim-jacket-oversized-women', description: 'Oversized denim jacket with distressed details.', price: '69.99', categoryId: womensFashion.id, sku: 'RW-008', images: img('1551028719-00167b16eac5', 'Denim Jacket') },
      { name: 'Cocktail Party Dress', slug: 'cocktail-party-dress', description: 'Sequin cocktail dress with V-neck and open back.', price: '129.99', categoryId: womensFashion.id, sku: 'RW-009', images: img('1595777457583-95e059d581b8', 'Cocktail Dress') },
      { name: 'Cashmere Scarf', slug: 'cashmere-scarf-women', description: 'Pure cashmere oversized scarf in solid colors.', price: '69.99', categoryId: womensFashion.id, sku: 'RW-010', images: img('1434389677669-e08b4cda3a20', 'Cashmere Scarf') },
      { name: 'Platform Sneakers', slug: 'platform-sneakers-women', description: 'Chunky platform sneakers with leather upper.', price: '89.99', categoryId: womensFashion.id, sku: 'RW-011', images: img('1542291026-7eec264c27ff', 'Platform Sneakers') },
      { name: 'Pearl Stud Earrings', slug: 'pearl-stud-earrings', description: 'Freshwater pearl stud earrings with sterling silver posts.', price: '34.99', categoryId: womensFashion.id, sku: 'RW-012', images: img('1535632066927-ab7c9ab60908', 'Pearl Earrings') },
      { name: 'Linen Wide-Leg Pants', slug: 'linen-wide-leg-pants', description: 'Relaxed linen wide-leg pants with drawstring waist.', price: '59.99', categoryId: womensFashion.id, sku: 'RW-013', images: img('1506629082955-511b1aa562c8', 'Wide-Leg Pants') },
      { name: 'Leather Crossbody Purse', slug: 'leather-crossbody-purse', description: 'Compact leather crossbody purse with adjustable strap.', price: '79.99', categoryId: womensFashion.id, sku: 'RW-014', images: img('1548036328-c9fa89d128fa', 'Crossbody Purse') },
      { name: 'Wool Blend Coat', slug: 'wool-blend-coat-women', description: 'Tailored wool blend coat with notch lapel and single button.', price: '199.99', discountPrice: '169.99', categoryId: womensFashion.id, sku: 'RW-015', images: img('1434389677669-e08b4cda3a20', 'Wool Coat') },
      // ── Home & Kitchen (15) ──
      { name: 'Robot Vacuum Cleaner', slug: 'robot-vacuum-cleaner', description: 'Smart robot vacuum with LiDAR navigation and auto-empty base.', price: '449.99', discountPrice: '379.99', categoryId: homeKitchen.id, sku: 'RH-001', images: img('1558618666-fcd25c85f82e', 'Robot Vacuum') },
      { name: 'Stainless Steel Cookware Set', slug: 'stainless-cookware-set', description: '10-piece tri-ply stainless steel cookware set.', price: '249.99', categoryId: homeKitchen.id, sku: 'RH-002', images: img('1556909114-f6e7ad7d3136', 'Cookware Set') },
      { name: 'Scented Candle Gift Set', slug: 'scented-candle-gift-set', description: 'Set of 6 premium soy wax scented candles.', price: '39.99', categoryId: homeKitchen.id, sku: 'RH-003', images: img('1602028915047-37269d1a73f7', 'Scented Candles') },
      { name: 'Instant Pot Duo 8-Qt', slug: 'instant-pot-duo-8qt', description: '7-in-1 electric pressure cooker, slow cooker, rice cooker.', price: '99.99', discountPrice: '79.99', categoryId: homeKitchen.id, sku: 'RH-004', images: img('1585515320310-259814833e62', 'Instant Pot') },
      { name: 'Cast Iron Skillet 12"', slug: 'cast-iron-skillet-12', description: 'Pre-seasoned cast iron skillet, oven safe to 500°F.', price: '39.99', categoryId: homeKitchen.id, sku: 'RH-005', images: img('1556909114-f6e7ad7d3136', 'Cast Iron Skillet') },
      { name: 'Knife Block Set 15pc', slug: 'knife-block-set-15pc', description: 'Professional 15-piece knife set with wooden block.', price: '129.99', categoryId: homeKitchen.id, sku: 'RH-006', images: img('1556909114-f6e7ad7d3136', 'Knife Set') },
      { name: 'Espresso Machine', slug: 'espresso-machine-home', description: 'Semi-automatic espresso machine with milk frother.', price: '299.99', categoryId: homeKitchen.id, sku: 'RH-007', images: img('1594385208974-2f8bb07b7a45', 'Espresso Machine') },
      { name: 'Weighted Blanket 15lb', slug: 'weighted-blanket-15lb', description: 'Premium weighted blanket with cooling bamboo cover.', price: '69.99', categoryId: homeKitchen.id, sku: 'RH-008', images: img('1522771739844-6a9f6d5f14af', 'Weighted Blanket') },
      { name: 'Throw Pillow Set of 4', slug: 'throw-pillow-set-4', description: 'Decorative throw pillow covers, 18x18, boho design.', price: '29.99', categoryId: homeKitchen.id, sku: 'RH-009', images: img('1584100936595-c0654b55a2e2', 'Throw Pillows') },
      { name: 'Bamboo Cutting Board Set', slug: 'bamboo-cutting-board-set', description: 'Set of 3 organic bamboo cutting boards with juice groove.', price: '24.99', categoryId: homeKitchen.id, sku: 'RH-010', images: img('1556909114-f6e7ad7d3136', 'Cutting Boards') },
      { name: 'Glass Food Storage Set', slug: 'glass-food-storage-set', description: '24-piece glass food storage containers with snap-lock lids.', price: '44.99', categoryId: homeKitchen.id, sku: 'RH-011', images: img('1556909114-f6e7ad7d3136', 'Food Storage') },
      { name: 'Blackout Curtains Pair', slug: 'blackout-curtains-pair', description: 'Thermal insulated blackout curtains, 84 inches, set of 2.', price: '34.99', categoryId: homeKitchen.id, sku: 'RH-012', images: img('1513519245088-0e12902e35ca', 'Blackout Curtains') },
      { name: 'Bath Towel Set 6pc', slug: 'bath-towel-set-6pc', description: 'Luxury Turkish cotton bath towel set, 600 GSM.', price: '49.99', categoryId: homeKitchen.id, sku: 'RH-013', images: img('1522771739844-6a9f6d5f14af', 'Bath Towels') },
      { name: 'Blender High-Performance', slug: 'blender-high-performance', description: 'Professional high-speed blender with 64oz container.', price: '159.99', categoryId: homeKitchen.id, sku: 'RH-014', images: img('1594385208974-2f8bb07b7a45', 'Blender') },
      { name: 'Area Rug 5x7 Modern', slug: 'area-rug-5x7-modern', description: 'Soft plush area rug with modern geometric pattern, 5x7 ft.', price: '89.99', categoryId: homeKitchen.id, sku: 'RH-015', images: img('1513519245088-0e12902e35ca', 'Area Rug') },
      // ── Beauty & Health (15) ──
      { name: 'Complete Skincare Routine Kit', slug: 'skincare-routine-kit', description: 'All-in-one skincare kit with cleanser, toner, serum, moisturizer, SPF.', price: '89.99', discountPrice: '69.99', categoryId: beautyHealth.id, sku: 'RB-001', images: img('1556228578-0d85b1a4d571', 'Skincare Kit') },
      { name: 'Electric Toothbrush Pro', slug: 'electric-toothbrush-pro', description: 'Sonic electric toothbrush with 5 modes and travel case.', price: '59.99', categoryId: beautyHealth.id, sku: 'RB-002', images: img('1559591937-2a2c6f352b28', 'Electric Toothbrush') },
      { name: 'Essential Oil Diffuser', slug: 'essential-oil-diffuser', description: 'Ultrasonic aromatherapy diffuser with LED mood lighting.', price: '34.99', categoryId: beautyHealth.id, sku: 'RB-003', images: img('1608571423902-eed4a5ad8108', 'Oil Diffuser') },
      { name: 'Jade Roller & Gua Sha Set', slug: 'jade-roller-gua-sha', description: 'Natural jade facial roller and gua sha stone set.', price: '19.99', categoryId: beautyHealth.id, sku: 'RB-004', images: img('1620916566398-39f1143ab7be', 'Jade Roller') },
      { name: 'Hair Straightener Flat Iron', slug: 'hair-straightener-flat-iron', description: 'Titanium flat iron with adjustable temp up to 450°F.', price: '49.99', categoryId: beautyHealth.id, sku: 'RB-005', images: img('1522338140262-f46f5913618a', 'Flat Iron') },
      { name: 'Collagen Peptides Powder', slug: 'collagen-peptides-powder', description: 'Grass-fed collagen peptides powder, unflavored, 20oz.', price: '29.99', categoryId: beautyHealth.id, sku: 'RB-006', images: img('1556228578-0d85b1a4d571', 'Collagen Powder') },
      { name: 'LED Face Mask Therapy', slug: 'led-face-mask-therapy', description: 'LED light therapy face mask with 7 color modes.', price: '79.99', categoryId: beautyHealth.id, sku: 'RB-007', images: img('1620916566398-39f1143ab7be', 'LED Face Mask') },
      { name: 'Massage Gun Deep Tissue', slug: 'massage-gun-deep-tissue', description: 'Percussion massage gun with 6 heads and 30 speeds.', price: '99.99', discountPrice: '79.99', categoryId: beautyHealth.id, sku: 'RB-008', images: img('1559591937-2a2c6f352b28', 'Massage Gun') },
      { name: 'Teeth Whitening Kit', slug: 'teeth-whitening-kit', description: 'Professional teeth whitening kit with LED accelerator.', price: '39.99', categoryId: beautyHealth.id, sku: 'RB-009', images: img('1559591937-2a2c6f352b28', 'Whitening Kit') },
      { name: 'Biotin Hair Growth Gummies', slug: 'biotin-hair-gummies', description: 'Hair growth gummies with biotin, folic acid, and vitamins.', price: '24.99', categoryId: beautyHealth.id, sku: 'RB-010', images: img('1556228578-0d85b1a4d571', 'Hair Gummies') },
      { name: 'Facial Cleansing Brush', slug: 'facial-cleansing-brush', description: 'Silicone facial cleansing brush with sonic vibration.', price: '29.99', categoryId: beautyHealth.id, sku: 'RB-011', images: img('1620916566398-39f1143ab7be', 'Cleansing Brush') },
      { name: 'Nail Polish Set 12-Pack', slug: 'nail-polish-set-12', description: 'Gel nail polish set with 12 trending colors and UV lamp.', price: '34.99', categoryId: beautyHealth.id, sku: 'RB-012', images: img('1586495777744-4413f21062fa', 'Nail Polish Set') },
      { name: 'Body Lotion Gift Set', slug: 'body-lotion-gift-set', description: 'Luxury body lotion gift set with 4 scents, shea butter.', price: '29.99', categoryId: beautyHealth.id, sku: 'RB-013', images: img('1556228578-0d85b1a4d571', 'Body Lotion Set') },
      { name: 'Heated Eye Mask', slug: 'heated-eye-mask-usb', description: 'USB heated eye mask with lavender scent for relaxation.', price: '19.99', categoryId: beautyHealth.id, sku: 'RB-014', images: img('1608571423902-eed4a5ad8108', 'Heated Eye Mask') },
      { name: 'Vitamin D3 + K2 Supplement', slug: 'vitamin-d3-k2-supplement', description: 'High-potency vitamin D3 5000 IU with K2, 120 capsules.', price: '18.99', categoryId: beautyHealth.id, sku: 'RB-015', images: img('1556228578-0d85b1a4d571', 'Vitamin D3 K2') },
      // ── Sports & Outdoors (15) ──
      { name: 'Resistance Band Set', slug: 'resistance-band-set', description: 'Set of 5 resistance bands with handles and door anchor.', price: '29.99', categoryId: sportsOutdoors.id, sku: 'RS-001', images: img('1598289431512-b97b0917affc', 'Resistance Bands') },
      { name: 'Insulated Water Bottle 32oz', slug: 'insulated-water-bottle', description: 'Double-wall vacuum insulated stainless steel bottle.', price: '34.99', categoryId: sportsOutdoors.id, sku: 'RS-002', images: img('1602143407151-7111542de6e8', 'Water Bottle') },
      { name: 'Sports Duffle Bag', slug: 'sports-duffle-bag', description: 'Large gym duffle bag with shoe compartment.', price: '44.99', categoryId: sportsOutdoors.id, sku: 'RS-003', images: img('1553062407-98eeb64c6a62', 'Duffle Bag') },
      { name: 'Jump Rope Speed Pro', slug: 'jump-rope-speed-pro', description: 'Weighted speed jump rope with ball bearings and foam handles.', price: '14.99', categoryId: sportsOutdoors.id, sku: 'RS-004', images: img('1598289431512-b97b0917affc', 'Jump Rope') },
      { name: 'Foam Roller Set', slug: 'foam-roller-set', description: 'High-density foam roller set with massage ball and stick.', price: '29.99', categoryId: sportsOutdoors.id, sku: 'RS-005', images: img('1601925260368-ae2f83cf8b7f', 'Foam Roller') },
      { name: 'Camping Hammock', slug: 'camping-hammock-double', description: 'Double camping hammock with tree straps, holds 500 lbs.', price: '34.99', categoryId: sportsOutdoors.id, sku: 'RS-006', images: img('1504280390367-361c6d9f38f4', 'Camping Hammock') },
      { name: 'Fishing Rod Combo', slug: 'fishing-rod-combo', description: 'Telescopic fishing rod and reel combo with tackle box.', price: '59.99', categoryId: sportsOutdoors.id, sku: 'RS-007', images: img('1504280390367-361c6d9f38f4', 'Fishing Rod') },
      { name: 'Compression Socks 6-Pack', slug: 'compression-socks-6pack', description: 'Graduated compression socks for running and recovery.', price: '24.99', categoryId: sportsOutdoors.id, sku: 'RS-008', images: img('1598289431512-b97b0917affc', 'Compression Socks') },
      { name: 'Kayak Inflatable 2-Person', slug: 'kayak-inflatable-2person', description: 'Inflatable 2-person kayak with paddles and pump.', price: '249.99', discountPrice: '199.99', categoryId: sportsOutdoors.id, sku: 'RS-009', images: img('1504280390367-361c6d9f38f4', 'Inflatable Kayak') },
      { name: 'Workout Gloves', slug: 'workout-gloves-padded', description: 'Padded workout gloves with wrist support for weightlifting.', price: '19.99', categoryId: sportsOutdoors.id, sku: 'RS-010', images: img('1534438327276-14e5300c3a48', 'Workout Gloves') },
      { name: 'Trekking Poles Pair', slug: 'trekking-poles-pair', description: 'Collapsible aluminum trekking poles with cork grips.', price: '39.99', categoryId: sportsOutdoors.id, sku: 'RS-011', images: img('1622260614153-03223fb72052', 'Trekking Poles') },
      { name: 'Cooler Backpack 30-Can', slug: 'cooler-backpack-30can', description: 'Insulated cooler backpack holds 30 cans, leak-proof.', price: '49.99', categoryId: sportsOutdoors.id, sku: 'RS-012', images: img('1622260614153-03223fb72052', 'Cooler Backpack') },
      { name: 'Ab Roller Wheel', slug: 'ab-roller-wheel-kit', description: 'Ab roller wheel with knee pad and resistance bands.', price: '24.99', categoryId: sportsOutdoors.id, sku: 'RS-013', images: img('1534438327276-14e5300c3a48', 'Ab Roller') },
      { name: 'Binoculars 12x42', slug: 'binoculars-12x42', description: 'Professional binoculars with BAK4 prism and FMC lens.', price: '89.99', categoryId: sportsOutdoors.id, sku: 'RS-014', images: img('1504280390367-361c6d9f38f4', 'Binoculars') },
      { name: 'Pickleball Paddle Set', slug: 'pickleball-paddle-set', description: 'Graphite pickleball paddle set with 4 balls and bag.', price: '69.99', categoryId: sportsOutdoors.id, sku: 'RS-015', images: img('1598289431512-b97b0917affc', 'Pickleball Set') },
      // ── Toys & Games (15) ──
      { name: 'Remote Control Car', slug: 'remote-control-car', description: 'High-speed RC car with 4WD and rechargeable battery.', price: '49.99', categoryId: toysGames.id, sku: 'RT-001', images: img('1581235707960-35f13de9905e', 'RC Car') },
      { name: 'Art Supplies Kit for Kids', slug: 'art-supplies-kit-kids', description: '150-piece art set with crayons, markers, and watercolors.', price: '34.99', categoryId: toysGames.id, sku: 'RT-002', images: img('1513364776144-60967b0f800f', 'Art Supplies') },
      { name: 'Plush Teddy Bear Giant', slug: 'plush-teddy-bear-giant', description: 'Giant 4-foot plush teddy bear, super soft.', price: '59.99', categoryId: toysGames.id, sku: 'RT-003', images: img('1559715541-5daf8a0296d0', 'Giant Teddy Bear') },
      { name: 'Play Kitchen Set', slug: 'play-kitchen-set-kids', description: 'Wooden play kitchen set with accessories and sounds.', price: '129.99', discountPrice: '99.99', categoryId: toysGames.id, sku: 'RT-004', images: img('1596461404969-9ae70f2830c1', 'Play Kitchen') },
      { name: 'RC Drone with Camera', slug: 'rc-drone-camera-kids', description: 'Beginner-friendly drone with 720p camera and auto-hover.', price: '69.99', categoryId: toysGames.id, sku: 'RT-005', images: img('1581235707960-35f13de9905e', 'RC Drone') },
      { name: 'Dollhouse Wooden', slug: 'dollhouse-wooden-large', description: 'Large wooden dollhouse with furniture and 4 rooms.', price: '89.99', categoryId: toysGames.id, sku: 'RT-006', images: img('1596461404969-9ae70f2830c1', 'Wooden Dollhouse') },
      { name: 'Nerf Blaster Elite', slug: 'nerf-blaster-elite', description: 'Motorized Nerf blaster with 25-dart drum and rapid fire.', price: '44.99', categoryId: toysGames.id, sku: 'RT-007', images: img('1581235707960-35f13de9905e', 'Nerf Blaster') },
      { name: 'Slime Making Kit', slug: 'slime-making-kit', description: 'DIY slime making kit with glitter, beads, and 18 colors.', price: '19.99', categoryId: toysGames.id, sku: 'RT-008', images: img('1513364776144-60967b0f800f', 'Slime Kit') },
      { name: 'Train Set Electric', slug: 'train-set-electric-kids', description: 'Electric train set with tracks, bridge, and sound effects.', price: '79.99', categoryId: toysGames.id, sku: 'RT-009', images: img('1596461404969-9ae70f2830c1', 'Train Set') },
      { name: 'Water Gun Super Soaker', slug: 'water-gun-super-soaker', description: 'High-capacity water gun with 40ft range, set of 2.', price: '24.99', categoryId: toysGames.id, sku: 'RT-010', images: img('1581235707960-35f13de9905e', 'Water Gun') },
      { name: 'Play-Doh Mega Set', slug: 'play-doh-mega-set', description: 'Play-Doh mega set with 36 cans and 10 tools.', price: '29.99', categoryId: toysGames.id, sku: 'RT-011', images: img('1513364776144-60967b0f800f', 'Play-Doh Set') },
      { name: 'Trampoline 12ft', slug: 'trampoline-12ft-enclosure', description: '12ft trampoline with safety enclosure and ladder.', price: '299.99', discountPrice: '249.99', categoryId: toysGames.id, sku: 'RT-012', images: img('1596461404969-9ae70f2830c1', 'Trampoline') },
      { name: 'Card Game Collection', slug: 'card-game-collection', description: 'Collection of 5 popular card games for family night.', price: '29.99', categoryId: toysGames.id, sku: 'RT-013', images: img('1611371805429-8b5c1b2c34ba', 'Card Games') },
      { name: 'Ride-On Balance Bike', slug: 'ride-on-balance-bike', description: 'Lightweight balance bike for toddlers ages 2-5.', price: '59.99', categoryId: toysGames.id, sku: 'RT-014', images: img('1596461404969-9ae70f2830c1', 'Balance Bike') },
      { name: 'Marble Run Set 200pc', slug: 'marble-run-set-200pc', description: '200-piece marble run building set with glow marbles.', price: '39.99', categoryId: toysGames.id, sku: 'RT-015', images: img('1587654780291-39c9404d7dd0', 'Marble Run') },
      // ── Books (15) ──
      { name: 'Cookbook: World Flavors', slug: 'cookbook-world-flavors', description: 'International cookbook with 200+ recipes from 50 countries.', price: '35.99', categoryId: books.id, sku: 'RK-001', images: img('1466637574441-749b8f19452f', 'Cookbook') },
      { name: 'Photography Art Book', slug: 'photography-art-book', description: 'Coffee table book featuring award-winning landscape photography.', price: '49.99', categoryId: books.id, sku: 'RK-002', images: img('1544947950-fa07a98d237f', 'Art Book') },
      { name: 'Journal & Planner 2026', slug: 'journal-planner-2026', description: 'Premium hardcover daily planner with monthly and weekly layouts.', price: '24.99', categoryId: books.id, sku: 'RK-003', images: img('1531346878377-a5be20888e57', 'Journal Planner') },
      { name: 'Mystery Thriller Box Set', slug: 'mystery-thriller-box-set', description: 'Box set of 6 bestselling mystery thriller novels.', price: '39.99', categoryId: books.id, sku: 'RK-004', images: img('1544947950-fa07a98d237f', 'Thriller Box Set') },
      { name: 'Self-Help Bestseller', slug: 'self-help-bestseller', description: 'Top-rated self-help book on habits and personal growth.', price: '16.99', categoryId: books.id, sku: 'RK-005', images: img('1589998059171-988d887df646', 'Self-Help Book') },
      { name: 'History of the World', slug: 'history-of-the-world-book', description: 'Illustrated comprehensive history of world civilizations.', price: '29.99', categoryId: books.id, sku: 'RK-006', images: img('1532012197267-da84d127e765', 'History Book') },
      { name: 'Coloring Book for Adults', slug: 'coloring-book-adults', description: 'Intricate mandala coloring book with 100 designs.', price: '12.99', categoryId: books.id, sku: 'RK-007', images: img('1513364776144-60967b0f800f', 'Coloring Book') },
      { name: 'Programming Python Guide', slug: 'programming-python-guide', description: 'Comprehensive Python programming guide for beginners.', price: '44.99', categoryId: books.id, sku: 'RK-008', images: img('1589998059171-988d887df646', 'Python Book') },
      { name: 'Romance Novel Collection', slug: 'romance-novel-collection', description: 'Collection of 5 bestselling romance novels.', price: '34.99', categoryId: books.id, sku: 'RK-009', images: img('1544947950-fa07a98d237f', 'Romance Novels') },
      { name: 'Graphic Novel Anthology', slug: 'graphic-novel-anthology', description: 'Award-winning graphic novel anthology, hardcover edition.', price: '27.99', categoryId: books.id, sku: 'RK-010', images: img('1532012197267-da84d127e765', 'Graphic Novel') },
      { name: 'Gardening Encyclopedia', slug: 'gardening-encyclopedia', description: 'Complete gardening encyclopedia with seasonal guides.', price: '32.99', categoryId: books.id, sku: 'RK-011', images: img('1466637574441-749b8f19452f', 'Gardening Book') },
      { name: 'Travel Guide Collection', slug: 'travel-guide-collection', description: 'Set of 3 travel guides covering Europe, Asia, and Americas.', price: '44.99', categoryId: books.id, sku: 'RK-012', images: img('1532012197267-da84d127e765', 'Travel Guides') },
      { name: 'Poetry Anthology Modern', slug: 'poetry-anthology-modern', description: 'Modern poetry anthology featuring 50 contemporary poets.', price: '18.99', categoryId: books.id, sku: 'RK-013', images: img('1544947950-fa07a98d237f', 'Poetry Book') },
      { name: 'Fitness & Nutrition Guide', slug: 'fitness-nutrition-guide', description: 'Complete guide to fitness training and meal planning.', price: '22.99', categoryId: books.id, sku: 'RK-014', images: img('1589998059171-988d887df646', 'Fitness Guide') },
      { name: 'Children Picture Book Set', slug: 'children-picture-book-set', description: 'Set of 10 illustrated children picture books, ages 3-8.', price: '29.99', categoryId: books.id, sku: 'RK-015', images: img('1544947950-fa07a98d237f', 'Picture Books') },
      // ── Automotive (15) ──
      { name: 'Car Cleaning Kit Premium', slug: 'car-cleaning-kit-premium', description: 'Complete car detailing kit with wash, wax, and microfiber towels.', price: '59.99', categoryId: automotive.id, sku: 'RA-001', images: img('1520340356584-f9917d1eea6f', 'Car Cleaning Kit') },
      { name: 'Portable Jump Starter', slug: 'portable-jump-starter', description: 'Compact car jump starter with 2000A peak and USB power bank.', price: '89.99', categoryId: automotive.id, sku: 'RA-002', images: img('1549399542-7e3f8b79c341', 'Jump Starter') },
      { name: 'Car Seat Covers Set', slug: 'car-seat-covers-set', description: 'Universal fit faux leather car seat covers, full set.', price: '79.99', categoryId: automotive.id, sku: 'RA-003', images: img('1549399542-7e3f8b79c341', 'Seat Covers') },
      { name: 'Tire Inflator Portable', slug: 'tire-inflator-portable', description: 'Portable tire inflator with digital gauge and auto shut-off.', price: '39.99', categoryId: automotive.id, sku: 'RA-004', images: img('1530124566582-a45a7e3f2809', 'Tire Inflator') },
      { name: 'Car Floor Mats All-Weather', slug: 'car-floor-mats-all-weather', description: 'Heavy-duty all-weather car floor mats, universal trim-to-fit.', price: '44.99', categoryId: automotive.id, sku: 'RA-005', images: img('1549399542-7e3f8b79c341', 'Floor Mats') },
      { name: 'LED Headlight Bulbs H11', slug: 'led-headlight-bulbs-h11', description: 'Ultra-bright LED headlight bulbs, 300% brighter, plug and play.', price: '34.99', categoryId: automotive.id, sku: 'RA-006', images: img('1549399542-7e3f8b79c341', 'LED Headlights') },
      { name: 'Car Trunk Organizer', slug: 'car-trunk-organizer', description: 'Collapsible car trunk organizer with multiple compartments.', price: '29.99', categoryId: automotive.id, sku: 'RA-007', images: img('1549399542-7e3f8b79c341', 'Trunk Organizer') },
      { name: 'Windshield Sun Shade', slug: 'windshield-sun-shade', description: 'Foldable windshield sun shade with reflective coating.', price: '14.99', categoryId: automotive.id, sku: 'RA-008', images: img('1549399542-7e3f8b79c341', 'Sun Shade') },
      { name: 'Car Vacuum Cordless', slug: 'car-vacuum-cordless', description: 'Handheld cordless car vacuum with strong suction and HEPA filter.', price: '49.99', categoryId: automotive.id, sku: 'RA-009', images: img('1530124566582-a45a7e3f2809', 'Car Vacuum') },
      { name: 'Steering Wheel Cover', slug: 'steering-wheel-cover-leather', description: 'Genuine leather steering wheel cover with anti-slip design.', price: '19.99', categoryId: automotive.id, sku: 'RA-010', images: img('1549399542-7e3f8b79c341', 'Wheel Cover') },
      { name: 'Car Air Freshener Set', slug: 'car-air-freshener-set', description: 'Premium car air freshener set with 6 scents, lasts 60 days each.', price: '16.99', categoryId: automotive.id, sku: 'RA-011', images: img('1549399542-7e3f8b79c341', 'Air Freshener') },
      { name: 'Blind Spot Mirrors', slug: 'blind-spot-mirrors-pair', description: 'Adjustable blind spot mirrors with 360-degree rotation, pair.', price: '9.99', categoryId: automotive.id, sku: 'RA-012', images: img('1549399542-7e3f8b79c341', 'Blind Spot Mirrors') },
      { name: 'Emergency Roadside Kit', slug: 'emergency-roadside-kit', description: 'Complete emergency roadside kit with jumper cables, flashlight, first aid.', price: '49.99', categoryId: automotive.id, sku: 'RA-013', images: img('1530124566582-a45a7e3f2809', 'Roadside Kit') },
      { name: 'Car Phone Holder Mount', slug: 'car-phone-holder-mount', description: 'Magnetic car phone mount for dashboard and air vent.', price: '15.99', categoryId: automotive.id, sku: 'RA-014', images: img('1549399542-7e3f8b79c341', 'Phone Holder') },
      { name: 'OBD2 Scanner Diagnostic', slug: 'obd2-scanner-diagnostic', description: 'OBD2 diagnostic scanner with Bluetooth and app connectivity.', price: '29.99', categoryId: automotive.id, sku: 'RA-015', images: img('1530124566582-a45a7e3f2809', 'OBD2 Scanner') },
      // ── Pet Supplies (15) ──
      { name: 'Pet Grooming Kit', slug: 'pet-grooming-kit', description: 'Professional pet grooming set with clippers, scissors, and combs.', price: '39.99', categoryId: petSupplies.id, sku: 'RP-001', images: img('1516734212186-a967f81ad0d7', 'Pet Grooming Kit') },
      { name: 'Pet Carrier Backpack', slug: 'pet-carrier-backpack', description: 'Ventilated pet carrier backpack, holds up to 15 lbs.', price: '49.99', categoryId: petSupplies.id, sku: 'RP-002', images: img('1583337130417-13104dec14c3', 'Pet Carrier') },
      { name: 'Orthopedic Pet Bed', slug: 'orthopedic-pet-bed', description: 'Memory foam orthopedic pet bed with washable cover.', price: '69.99', categoryId: petSupplies.id, sku: 'RP-003', images: img('1541781774459-bb2af2f05b55', 'Pet Bed') },
      { name: 'Retractable Dog Leash', slug: 'retractable-dog-leash', description: 'Heavy-duty retractable dog leash, 26ft, for dogs up to 110 lbs.', price: '24.99', categoryId: petSupplies.id, sku: 'RP-004', images: img('1601758228041-f3b2795255f1', 'Dog Leash') },
      { name: 'Pet Water Fountain', slug: 'pet-water-fountain', description: 'Stainless steel pet water fountain with 3 flow settings, 2L.', price: '34.99', categoryId: petSupplies.id, sku: 'RP-005', images: img('1574158622682-e40e69881006', 'Water Fountain') },
      { name: 'Dog Harness No-Pull', slug: 'dog-harness-no-pull', description: 'No-pull dog harness with front and back clip, reflective.', price: '29.99', categoryId: petSupplies.id, sku: 'RP-006', images: img('1601758228041-f3b2795255f1', 'Dog Harness') },
      { name: 'Cat Litter Self-Cleaning', slug: 'cat-litter-self-cleaning', description: 'Automatic self-cleaning cat litter box with odor control.', price: '149.99', discountPrice: '119.99', categoryId: petSupplies.id, sku: 'RP-007', images: img('1574158622682-e40e69881006', 'Self-Cleaning Litter') },
      { name: 'Pet GPS Tracker', slug: 'pet-gps-tracker', description: 'Lightweight GPS tracker for pets with real-time location.', price: '49.99', categoryId: petSupplies.id, sku: 'RP-008', images: img('1583337130417-13104dec14c3', 'Pet GPS') },
      { name: 'Dog Training Treats', slug: 'dog-training-treats-bag', description: 'Natural dog training treats, grain-free, 1lb bag.', price: '14.99', categoryId: petSupplies.id, sku: 'RP-009', images: img('1601758228041-f3b2795255f1', 'Dog Treats') },
      { name: 'Cat Scratching Post', slug: 'cat-scratching-post-tall', description: 'Tall sisal cat scratching post with platform top, 32 inches.', price: '39.99', categoryId: petSupplies.id, sku: 'RP-010', images: img('1545249390-6bdfa286032f', 'Scratching Post') },
      { name: 'Pet Shampoo Natural', slug: 'pet-shampoo-natural', description: 'All-natural pet shampoo with oatmeal and aloe vera.', price: '12.99', categoryId: petSupplies.id, sku: 'RP-011', images: img('1516734212186-a967f81ad0d7', 'Pet Shampoo') },
      { name: 'Dog Raincoat Waterproof', slug: 'dog-raincoat-waterproof', description: 'Waterproof dog raincoat with reflective strips, adjustable.', price: '24.99', categoryId: petSupplies.id, sku: 'RP-012', images: img('1601758228041-f3b2795255f1', 'Dog Raincoat') },
      { name: 'Interactive Cat Toy Set', slug: 'interactive-cat-toy-set', description: 'Set of 10 interactive cat toys with feathers and bells.', price: '16.99', categoryId: petSupplies.id, sku: 'RP-013', images: img('1574158622682-e40e69881006', 'Cat Toys') },
      { name: 'Pet First Aid Kit', slug: 'pet-first-aid-kit', description: 'Complete pet first aid kit with 75 essential items.', price: '29.99', categoryId: petSupplies.id, sku: 'RP-014', images: img('1583337130417-13104dec14c3', 'Pet First Aid') },
      { name: 'Elevated Dog Bowl Set', slug: 'elevated-dog-bowl-set', description: 'Raised stainless steel dog bowl set with bamboo stand.', price: '34.99', categoryId: petSupplies.id, sku: 'RP-015', images: img('1601758228041-f3b2795255f1', 'Elevated Bowls') },
      // ── Office Products (15) ──
      { name: 'Desk Organizer Set', slug: 'desk-organizer-set', description: 'Bamboo desk organizer with pen holder and phone stand.', price: '29.99', categoryId: officeProducts.id, sku: 'RO-001', images: img('1507925921958-8a62f3d1a50d', 'Desk Organizer') },
      { name: 'Monitor Light Bar', slug: 'monitor-light-bar', description: 'LED monitor light bar with adjustable color temperature.', price: '39.99', categoryId: officeProducts.id, sku: 'RO-002', images: img('1593642632559-0c6d3fc62b89', 'Monitor Light') },
      { name: 'Desk Fan Ultra-Quiet', slug: 'desk-fan-quiet', description: 'Ultra-quiet USB desk fan with 3 speeds and adjustable tilt.', price: '24.99', categoryId: officeProducts.id, sku: 'RO-003', images: img('1558618666-fcd25c85f82e', 'Desk Fan') },
      { name: 'Whiteboard Magnetic 36x24', slug: 'whiteboard-magnetic-36x24', description: 'Magnetic dry erase whiteboard with aluminum frame, 36x24.', price: '44.99', categoryId: officeProducts.id, sku: 'RO-004', images: img('1507925921958-8a62f3d1a50d', 'Whiteboard') },
      { name: 'Label Maker Machine', slug: 'label-maker-machine', description: 'Portable label maker with QWERTY keyboard and multiple fonts.', price: '29.99', categoryId: officeProducts.id, sku: 'RO-005', images: img('1531346878377-a5be20888e57', 'Label Maker') },
      { name: 'Document Scanner Portable', slug: 'document-scanner-portable', description: 'Portable document scanner with auto-feed and WiFi.', price: '199.99', categoryId: officeProducts.id, sku: 'RO-006', images: img('1593642632559-0c6d3fc62b89', 'Document Scanner') },
      { name: 'Desk Pad Large', slug: 'desk-pad-large-leather', description: 'Large leather desk pad with non-slip base, 36x17 inches.', price: '19.99', categoryId: officeProducts.id, sku: 'RO-007', images: img('1507925921958-8a62f3d1a50d', 'Desk Pad') },
      { name: 'Pen Set Executive', slug: 'pen-set-executive', description: 'Executive pen set with ballpoint and rollerball in gift box.', price: '34.99', categoryId: officeProducts.id, sku: 'RO-008', images: img('1531346878377-a5be20888e57', 'Executive Pens') },
      { name: 'File Cabinet 3-Drawer', slug: 'file-cabinet-3-drawer', description: 'Mobile 3-drawer file cabinet with lock and casters.', price: '89.99', categoryId: officeProducts.id, sku: 'RO-009', images: img('1580480055273-228ff5388ef8', 'File Cabinet') },
      { name: 'Desk Lamp LED Adjustable', slug: 'desk-lamp-led-adjustable', description: 'LED desk lamp with 5 brightness levels and USB charging port.', price: '34.99', categoryId: officeProducts.id, sku: 'RO-010', images: img('1507473885765-e6ed057ab6fe', 'Desk Lamp') },
      { name: 'Paper Shredder Cross-Cut', slug: 'paper-shredder-cross-cut', description: '12-sheet cross-cut paper shredder with 5-gallon bin.', price: '59.99', categoryId: officeProducts.id, sku: 'RO-011', images: img('1593642632559-0c6d3fc62b89', 'Paper Shredder') },
      { name: 'Sticky Notes Variety Pack', slug: 'sticky-notes-variety-pack', description: 'Sticky notes variety pack with 24 pads in assorted colors.', price: '12.99', categoryId: officeProducts.id, sku: 'RO-012', images: img('1531346878377-a5be20888e57', 'Sticky Notes') },
      { name: 'Laptop Stand Adjustable', slug: 'laptop-stand-adjustable', description: 'Aluminum laptop stand with adjustable height and angle.', price: '39.99', categoryId: officeProducts.id, sku: 'RO-013', images: img('1593642632559-0c6d3fc62b89', 'Laptop Stand') },
      { name: 'Bookshelf 5-Tier', slug: 'bookshelf-5-tier-industrial', description: 'Industrial 5-tier bookshelf with metal frame and wood shelves.', price: '79.99', categoryId: officeProducts.id, sku: 'RO-014', images: img('1580480055273-228ff5388ef8', 'Bookshelf') },
      { name: 'Wrist Rest Keyboard Pad', slug: 'wrist-rest-keyboard-pad', description: 'Memory foam keyboard wrist rest with non-slip base.', price: '14.99', categoryId: officeProducts.id, sku: 'RO-015', images: img('1587829741301-dc798b83add3', 'Wrist Rest') },
      // ── Garden (15) ──
      { name: 'Solar Garden Lights 12-Pack', slug: 'solar-garden-lights', description: 'Waterproof solar-powered LED pathway lights, auto on/off.', price: '39.99', categoryId: garden.id, sku: 'RG-001', images: img('1558171813-4c088753af8f', 'Solar Lights') },
      { name: 'Raised Garden Bed Kit', slug: 'raised-garden-bed-kit', description: 'Cedar wood raised garden bed, 4x8 feet, easy assembly.', price: '129.99', categoryId: garden.id, sku: 'RG-002', images: img('1416879595882-3373a0480b5b', 'Raised Bed') },
      { name: 'Expandable Garden Hose 100ft', slug: 'expandable-garden-hose', description: 'Lightweight expandable garden hose with 10-pattern nozzle.', price: '34.99', categoryId: garden.id, sku: 'RG-003', images: img('1416879595882-3373a0480b5b', 'Garden Hose') },
      { name: 'Compost Bin Tumbler', slug: 'compost-bin-tumbler', description: 'Dual-chamber compost tumbler, 43 gallon capacity.', price: '89.99', categoryId: garden.id, sku: 'RG-004', images: img('1416879595882-3373a0480b5b', 'Compost Bin') },
      { name: 'Garden Kneeler Seat', slug: 'garden-kneeler-seat', description: 'Foldable garden kneeler and seat with tool pouch.', price: '29.99', categoryId: garden.id, sku: 'RG-005', images: img('1416879595882-3373a0480b5b', 'Garden Kneeler') },
      { name: 'Sprinkler System Timer', slug: 'sprinkler-system-timer', description: 'WiFi smart sprinkler timer with 8 zones and weather adjust.', price: '69.99', categoryId: garden.id, sku: 'RG-006', images: img('1558171813-4c088753af8f', 'Sprinkler Timer') },
      { name: 'Bird Feeder Cedar', slug: 'bird-feeder-cedar-large', description: 'Large cedar wood bird feeder with squirrel guard.', price: '39.99', categoryId: garden.id, sku: 'RG-007', images: img('1416879595882-3373a0480b5b', 'Bird Feeder') },
      { name: 'Outdoor String Lights 48ft', slug: 'outdoor-string-lights-48ft', description: 'Weatherproof LED string lights with 15 Edison bulbs.', price: '29.99', categoryId: garden.id, sku: 'RG-008', images: img('1558171813-4c088753af8f', 'String Lights') },
      { name: 'Potting Soil Premium 40qt', slug: 'potting-soil-premium-40qt', description: 'Premium organic potting soil with slow-release fertilizer.', price: '19.99', categoryId: garden.id, sku: 'RG-009', images: img('1416879595882-3373a0480b5b', 'Potting Soil') },
      { name: 'Garden Wagon Cart', slug: 'garden-wagon-cart', description: 'Heavy-duty garden wagon cart with 400 lb capacity.', price: '99.99', categoryId: garden.id, sku: 'RG-010', images: img('1416879595882-3373a0480b5b', 'Garden Wagon') },
      { name: 'Herb Garden Starter Kit', slug: 'herb-garden-starter-kit', description: 'Indoor herb garden kit with 6 varieties and grow light.', price: '34.99', categoryId: garden.id, sku: 'RG-011', images: img('1416879595882-3373a0480b5b', 'Herb Garden') },
      { name: 'Pressure Washer Electric', slug: 'pressure-washer-electric', description: 'Electric pressure washer with 2000 PSI and foam cannon.', price: '179.99', discountPrice: '149.99', categoryId: garden.id, sku: 'RG-012', images: img('1416879595882-3373a0480b5b', 'Pressure Washer') },
      { name: 'Outdoor Planter Set', slug: 'outdoor-planter-set-3', description: 'Set of 3 weather-resistant outdoor planters, modern design.', price: '49.99', categoryId: garden.id, sku: 'RG-013', images: img('1558171813-4c088753af8f', 'Outdoor Planters') },
      { name: 'Leaf Blower Cordless', slug: 'leaf-blower-cordless-20v', description: '20V cordless leaf blower with variable speed, lightweight.', price: '79.99', categoryId: garden.id, sku: 'RG-014', images: img('1416879595882-3373a0480b5b', 'Leaf Blower') },
      { name: 'Fire Pit Table Propane', slug: 'fire-pit-table-propane', description: 'Outdoor propane fire pit table with lava rocks and cover.', price: '299.99', discountPrice: '249.99', categoryId: garden.id, sku: 'RG-015', images: img('1600210492486-724fe5c67fb0', 'Fire Pit Table') },
    ];

    console.log(`Inserting ${allProductSeeds.length} products...`);
    const createdProducts: Array<typeof schema.products.$inferSelect> = [];
    
    // Batch insert products in chunks of 50 for performance
    const CHUNK_SIZE = 50;
    for (let i = 0; i < allProductSeeds.length; i += CHUNK_SIZE) {
      const chunk = allProductSeeds.slice(i, i + CHUNK_SIZE);
      const inserted = await db.insert(schema.products).values(
        chunk.map(p => ({
          name: p.name, slug: p.slug, description: p.description,
          price: p.price, discountPrice: p.discountPrice,
          categoryId: p.categoryId, sku: p.sku, isActive: true,
          averageRating: (3.5 + Math.random() * 1.5).toFixed(2),
          reviewCount: Math.floor(Math.random() * 50) + 5,
        }))
      ).returning();
      createdProducts.push(...inserted);
      console.log(`  Inserted ${Math.min(i + CHUNK_SIZE, allProductSeeds.length)}/${allProductSeeds.length} products...`);
    }

    // Batch insert images
    const allImages: Array<{ productId: string; imageUrl: string; thumbnailUrl: string; altText: string; displayOrder: number; isPrimary: boolean }> = [];
    for (let i = 0; i < createdProducts.length; i++) {
      const p = allProductSeeds[i];
      for (let j = 0; j < p.images.length; j++) {
        allImages.push({
          productId: createdProducts[i].id,
          imageUrl: p.images[j].url,
          thumbnailUrl: p.images[j].url.replace('w=800&h=800', 'w=200&h=200'),
          altText: p.images[j].alt,
          displayOrder: j,
          isPrimary: j === 0,
        });
      }
    }
    for (let i = 0; i < allImages.length; i += CHUNK_SIZE) {
      await db.insert(schema.productImages).values(allImages.slice(i, i + CHUNK_SIZE));
    }

    // Batch insert inventory
    const allInventory = createdProducts.map(p => ({
      productId: p.id,
      quantity: Math.floor(Math.random() * 200) + 10,
      lowStockThreshold: 10,
    }));
    for (let i = 0; i < allInventory.length; i += CHUNK_SIZE) {
      await db.insert(schema.inventory).values(allInventory.slice(i, i + CHUNK_SIZE));
    }
    console.log(`✓ Created ${createdProducts.length} products with images and inventory`);

    // 4. User Addresses
    console.log('Creating user addresses...');
    await db.insert(schema.userAddresses).values([
      { userId: customer1.id, label: 'Home', addressLine1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', isDefault: true },
      { userId: customer1.id, label: 'Work', addressLine1: '456 Office Blvd', city: 'New York', state: 'NY', postalCode: '10002', country: 'US', isDefault: false },
      { userId: customer2.id, label: 'Home', addressLine1: '789 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'US', isDefault: true },
      { userId: customer3.id, label: 'Home', addressLine1: '321 Pine Rd', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'US', isDefault: true },
    ]);
    console.log('✓ Created user addresses');

    // 5. Orders
    console.log('Creating orders...');
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const customers = [customer1, customer2, customer3];
    const orderProducts = createdProducts.slice(0, 12);
    for (let i = 0; i < 8; i++) {
      const customer = customers[i % 3];
      const status = statuses[i % 4];
      const items = orderProducts.slice(i % 6, (i % 6) + 2);
      const subtotal = items.reduce((sum: number, p: typeof schema.products.$inferSelect) => sum + parseFloat(p.price), 0);
      const tax = subtotal * 0.08;
      const shipping = subtotal > 100 ? 0 : 9.99;
      const total = subtotal + tax + shipping;
      const [order] = await db.insert(schema.orders).values({
        orderNumber: `ZIV-2025-${String(i + 1).padStart(4, '0')}`,
        userId: customer.id, status,
        subtotal: subtotal.toFixed(2), tax: tax.toFixed(2),
        shipping: shipping.toFixed(2), total: total.toFixed(2),
        shippingAddressLine1: '123 Main St', shippingCity: 'New York',
        shippingState: 'NY', shippingPostalCode: '10001', shippingCountry: 'US',
        paymentMethod: 'card', lastFourDigits: '4242',
      }).returning();
      for (const item of items) {
        await db.insert(schema.orderItems).values({
          orderId: order.id, productId: item.id, productName: item.name,
          quantity: 1, priceAtPurchase: item.price, subtotal: item.price,
        });
      }
      await db.insert(schema.orderStatusHistory).values({
        orderId: order.id, status, notes: `Order ${status}`, changedBy: adminUser.id,
      });
    }
    console.log('✓ Created 8 orders');

    // 6. Reviews
    console.log('Creating reviews...');
    const comments = [
      'Great product, exactly as described!', 'Good quality for the price.',
      'Exceeded my expectations.', 'Decent product but shipping took a while.',
      'Amazing quality! Will buy again.', 'Works perfectly. Five stars!',
      'Not bad, could be better for the price.', 'Love it! Perfect gift idea.',
    ];
    const reviewProducts = createdProducts.slice(0, 30);
    for (let i = 0; i < reviewProducts.length; i++) {
      const numReviews = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numReviews; j++) {
        await db.insert(schema.reviews).values({
          userId: customers[j % 3].id, productId: reviewProducts[i].id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: comments[(i + j) % comments.length],
          isVerifiedPurchase: Math.random() > 0.3,
          helpfulCount: Math.floor(Math.random() * 15),
        });
      }
    }
    console.log('✓ Created reviews');
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();
