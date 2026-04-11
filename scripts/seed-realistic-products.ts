import { db, client } from '../src/db/index';
import * as schema from '../src/db/schema';
import { eq, like } from 'drizzle-orm';

/**
 * Seed realistic demo products with Unsplash images.
 * Keeps existing categories, replaces all products.
 */

interface ProductSeed {
  name: string;
  price: string;
  discount: string | null;
  desc: string;
  images: string[]; // Unsplash URLs
  rating: string;
  reviews: number;
}

// Unsplash base for product images
const U = 'https://images.unsplash.com';

const productsByCategory: Record<string, ProductSeed[]> = {
  // ── ELECTRONICS: Smartphones ──
  smartphones: [
    { name: 'iPhone 15 Pro Max 256GB', price: '1199.99', discount: null, desc: 'Titanium design, A17 Pro chip, 48MP camera system with 5x optical zoom, USB-C, Action button.', images: [`${U}/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop`], rating: '4.70', reviews: 2847 },
    { name: 'Samsung Galaxy S24 Ultra', price: '1299.99', discount: '1149.99', desc: '6.8" QHD+ Dynamic AMOLED, Snapdragon 8 Gen 3, 200MP camera, S Pen, titanium frame.', images: [`${U}/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop`], rating: '4.60', reviews: 1923 },
    { name: 'Google Pixel 8 Pro', price: '999.99', discount: '899.99', desc: 'Tensor G3 chip, AI-powered camera, 6.7" LTPO OLED, 7 years of updates.', images: [`${U}/photo-1598327105666-5b89351aff97?w=800&h=800&fit=crop`], rating: '4.50', reviews: 1456 },
    { name: 'OnePlus 12 5G', price: '799.99', discount: null, desc: 'Hasselblad camera, 100W SUPERVOOC charging, Snapdragon 8 Gen 3.', images: [`${U}/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop`], rating: '4.40', reviews: 876 },
  ],
  // ── ELECTRONICS: Laptops ──
  'laptops-computers': [
    { name: 'MacBook Pro 16" M3 Pro', price: '2499.99', discount: null, desc: 'Apple M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display, 22-hour battery.', images: [`${U}/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop`], rating: '4.80', reviews: 3241 },
    { name: 'Dell XPS 15 OLED', price: '1899.99', discount: '1699.99', desc: 'Intel Core i7-13700H, RTX 4060, 15.6" 3.5K OLED, 16GB RAM, 512GB SSD.', images: [`${U}/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop`], rating: '4.50', reviews: 1876 },
    { name: 'ASUS ROG Zephyrus G14', price: '1599.99', discount: null, desc: 'AMD Ryzen 9, RTX 4070, 14" QHD+ 165Hz, 32GB RAM, perfect for gaming.', images: [`${U}/photo-1593642702821-c8da6771f0c6?w=800&h=800&fit=crop`], rating: '4.60', reviews: 1234 },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: '1749.99', discount: '1549.99', desc: 'Intel Core i7, 14" 2.8K OLED, 16GB RAM, military-grade durability.', images: [`${U}/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop`], rating: '4.50', reviews: 987 },
  ],
  // ── ELECTRONICS: Audio ──
  'headphones-audio': [
    { name: 'Sony WH-1000XM5 Wireless', price: '399.99', discount: '328.00', desc: 'Industry-leading noise cancellation, 30-hour battery, multipoint connection.', images: [`${U}/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop`], rating: '4.70', reviews: 4521 },
    { name: 'Apple AirPods Pro 2nd Gen', price: '249.99', discount: null, desc: 'Active Noise Cancellation, Adaptive Transparency, USB-C, personalized spatial audio.', images: [`${U}/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop`], rating: '4.70', reviews: 6234 },
    { name: 'Bose QuietComfort Ultra', price: '429.99', discount: '379.99', desc: 'Immersive audio, world-class noise cancellation, up to 24 hours battery.', images: [`${U}/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop`], rating: '4.60', reviews: 2345 },
  ],
  // ── ELECTRONICS: TVs ──
  'tv-home-theater': [
    { name: 'LG C3 65" OLED 4K TV', price: '1799.99', discount: '1496.99', desc: 'Self-lit OLED pixels, α9 Gen6 AI Processor, Dolby Vision & Atmos, webOS.', images: [`${U}/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop`], rating: '4.80', reviews: 3456 },
    { name: 'Samsung 75" Neo QLED 4K', price: '2199.99', discount: '1899.99', desc: 'Quantum Matrix Technology, Neural Quantum Processor, anti-reflection screen.', images: [`${U}/photo-1461151304267-38535e780c79?w=800&h=800&fit=crop`], rating: '4.60', reviews: 1876 },
  ],
  // ── ELECTRONICS: Gaming ──
  gaming: [
    { name: 'PlayStation 5 Slim', price: '499.99', discount: null, desc: '1TB SSD, 4K gaming, DualSense controller, backwards compatible.', images: [`${U}/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop`], rating: '4.80', reviews: 8765 },
    { name: 'Xbox Series X', price: '499.99', discount: '449.99', desc: '12 teraflops, 4K@120fps, 1TB SSD, Quick Resume, Game Pass ready.', images: [`${U}/photo-1621259182978-fbf93132d53d?w=800&h=800&fit=crop`], rating: '4.70', reviews: 5432 },
    { name: 'Nintendo Switch OLED', price: '349.99', discount: null, desc: '7-inch OLED screen, enhanced audio, 64GB storage, tabletop mode.', images: [`${U}/photo-1578303512597-81e6cc155b3e?w=800&h=800&fit=crop`], rating: '4.70', reviews: 7654 },
  ],
  // ── ELECTRONICS: Cameras ──
  cameras: [
    { name: 'Sony Alpha a7 IV Mirrorless', price: '2498.00', discount: null, desc: '33MP full-frame sensor, 4K 60p video, real-time Eye AF, 10fps burst.', images: [`${U}/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop`], rating: '4.80', reviews: 1234 },
    { name: 'Canon EOS R6 Mark II', price: '2499.99', discount: '2299.99', desc: '24.2MP full-frame, 40fps burst, 4K 60p, subject detection AF.', images: [`${U}/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop`], rating: '4.70', reviews: 987 },
  ],
  // ── ELECTRONICS: Wearables ──
  wearables: [
    { name: 'Apple Watch Ultra 2', price: '799.99', discount: null, desc: '49mm titanium case, precision dual-frequency GPS, 36-hour battery, dive computer.', images: [`${U}/photo-1546868871-af0de0ae72be?w=800&h=800&fit=crop`], rating: '4.70', reviews: 2345 },
    { name: 'Samsung Galaxy Watch 6 Classic', price: '399.99', discount: '349.99', desc: 'Rotating bezel, BioActive sensor, sleep coaching, Wear OS.', images: [`${U}/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop`], rating: '4.50', reviews: 1567 },
  ],
  // ── MEN'S FASHION ──
  'mens-clothing': [
    { name: "Levi's 501 Original Fit Jeans", price: '69.50', discount: '59.99', desc: 'Iconic straight fit, button fly, 100% cotton denim, sits at waist.', images: [`${U}/photo-1542272604-787c3835535d?w=800&h=800&fit=crop`], rating: '4.50', reviews: 12456 },
    { name: 'Nike Dri-FIT Training T-Shirt', price: '35.00', discount: null, desc: 'Sweat-wicking technology, standard fit, soft jersey fabric.', images: [`${U}/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop`], rating: '4.40', reviews: 8765 },
    { name: 'Ralph Lauren Oxford Shirt', price: '110.00', discount: '89.99', desc: 'Classic fit, button-down collar, signature pony embroidery.', images: [`${U}/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop`], rating: '4.60', reviews: 3456 },
    { name: 'Patagonia Better Sweater Fleece', price: '139.00', discount: null, desc: '100% recycled polyester fleece, Fair Trade Certified, zippered pockets.', images: [`${U}/photo-1489987707025-afc232f7ea0f?w=800&h=800&fit=crop`], rating: '4.70', reviews: 5678 },
  ],
  'mens-shoes': [
    { name: 'Nike Air Max 270', price: '150.00', discount: '119.99', desc: 'Max Air unit for cushioning, breathable mesh upper, lifestyle sneaker.', images: [`${U}/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop`], rating: '4.50', reviews: 9876 },
    { name: 'Adidas Ultraboost 23', price: '190.00', discount: null, desc: 'BOOST midsole, Primeknit+ upper, Continental rubber outsole.', images: [`${U}/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop`], rating: '4.60', reviews: 6543 },
    { name: 'Cole Haan Grand Crosscourt II', price: '110.00', discount: '84.99', desc: 'Lightweight, Grand.OS technology, leather upper, tennis-inspired.', images: [`${U}/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop`], rating: '4.40', reviews: 4321 },
  ],
  'mens-accessories': [
    { name: 'Ray-Ban Aviator Classic', price: '163.00', discount: '143.00', desc: 'Gold frame, green G-15 lenses, iconic pilot shape, 100% UV protection.', images: [`${U}/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop`], rating: '4.70', reviews: 15678 },
    { name: 'Fossil Grant Chronograph Watch', price: '139.00', discount: '99.99', desc: 'Roman numeral dial, genuine leather strap, 44mm case.', images: [`${U}/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop`], rating: '4.40', reviews: 7654 },
  ],
  // ── WOMEN'S FASHION ──
  'womens-clothing': [
    { name: 'Zara Satin Midi Dress', price: '89.90', discount: '69.99', desc: 'Flowing satin fabric, V-neckline, adjustable straps, midi length.', images: [`${U}/photo-1496747611176-843222e1e57c?w=800&h=800&fit=crop`], rating: '4.30', reviews: 3456 },
    { name: 'Lululemon Align High-Rise Pant 25"', price: '98.00', discount: null, desc: 'Nulu fabric, buttery soft, 4-way stretch, hidden waistband pocket.', images: [`${U}/photo-1506629082955-511b1aa562c8?w=800&h=800&fit=crop`], rating: '4.80', reviews: 18765 },
    { name: 'Everlane The Cashmere Crew', price: '130.00', discount: '98.00', desc: 'Grade-A cashmere, relaxed fit, ribbed trim, ethically sourced.', images: [`${U}/photo-1434389677669-e08b4cda3a0a?w=800&h=800&fit=crop`], rating: '4.50', reviews: 2345 },
  ],
  'womens-shoes': [
    { name: 'Steve Madden Maxima Platform Sneaker', price: '89.95', discount: '74.99', desc: 'Chunky platform sole, lace-up front, padded collar, street style.', images: [`${U}/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop`], rating: '4.30', reviews: 5678 },
    { name: 'Sam Edelman Hazel Pointed Toe Pump', price: '140.00', discount: null, desc: 'Classic stiletto heel, cushioned footbed, versatile design.', images: [`${U}/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop`], rating: '4.50', reviews: 4321 },
  ],
  'womens-handbags': [
    { name: 'Coach Willow Tote Bag', price: '395.00', discount: '295.00', desc: 'Polished pebble leather, zip-top closure, interior pockets, detachable strap.', images: [`${U}/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop`], rating: '4.60', reviews: 3456 },
    { name: 'Longchamp Le Pliage Original', price: '155.00', discount: null, desc: 'Iconic foldable tote, nylon with leather trim, zip closure.', images: [`${U}/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop`], rating: '4.70', reviews: 8765 },
  ],
  'womens-jewelry': [
    { name: 'Pandora Moments Snake Chain Bracelet', price: '75.00', discount: '65.00', desc: 'Sterling silver, barrel clasp, compatible with Pandora charms.', images: [`${U}/photo-1515562141589-67f0d569b6c4?w=800&h=800&fit=crop`], rating: '4.60', reviews: 12345 },
    { name: 'Mejuri Bold Hoop Earrings', price: '68.00', discount: null, desc: '14k solid gold, click-top closure, lightweight, everyday luxury.', images: [`${U}/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop`], rating: '4.50', reviews: 4567 },
  ],
  // ── HOME & KITCHEN ──
  'kitchen-and-dining': [
    { name: 'KitchenAid Artisan Stand Mixer', price: '449.99', discount: '379.99', desc: '5-quart stainless steel bowl, 10 speeds, tilt-head design, 59-point planetary mixing.', images: [`${U}/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop`], rating: '4.80', reviews: 23456 },
    { name: 'Ninja Foodi 6-in-1 Air Fryer', price: '129.99', discount: '99.99', desc: 'Air fry, broil, roast, bake, reheat, dehydrate. 4-quart ceramic-coated basket.', images: [`${U}/photo-1585515320310-259814833e62?w=800&h=800&fit=crop`], rating: '4.70', reviews: 15678 },
    { name: 'Instant Pot Duo Plus 6-Quart', price: '119.99', discount: '89.99', desc: '9-in-1 pressure cooker, slow cooker, rice cooker, steamer, sauté pan.', images: [`${U}/photo-1556909172-54557c7e4fb7?w=800&h=800&fit=crop`], rating: '4.70', reviews: 34567 },
  ],
  furniture: [
    { name: 'West Elm Mid-Century Sofa', price: '1599.00', discount: '1299.00', desc: 'Solid wood legs, down-blend cushions, kiln-dried hardwood frame.', images: [`${U}/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop`], rating: '4.40', reviews: 2345 },
    { name: 'IKEA KALLAX Shelf Unit', price: '89.99', discount: null, desc: '4x4 cube storage, white finish, versatile room divider or bookshelf.', images: [`${U}/photo-1594620302200-9a762244a156?w=800&h=800&fit=crop`], rating: '4.50', reviews: 8765 },
    { name: 'Casper Original Mattress Queen', price: '1095.00', discount: '895.00', desc: 'Zoned Support foam, AirScape perforated breathable layer, 100-night trial.', images: [`${U}/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop`], rating: '4.50', reviews: 6789 },
  ],
  'bath-and-bedding': [
    { name: 'Brooklinen Luxe Core Sheet Set', price: '169.00', discount: '143.99', desc: '480 thread count, long-staple cotton sateen, oeko-tex certified.', images: [`${U}/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop`], rating: '4.60', reviews: 9876 },
    { name: 'Parachute Cloud Cotton Towels', price: '79.00', discount: null, desc: 'Turkish cotton, lightweight, quick-drying, OEKO-TEX certified.', images: [`${U}/photo-1564013799919-ab600027ffc6?w=800&h=800&fit=crop`], rating: '4.50', reviews: 5432 },
  ],
  'home-decor': [
    { name: 'Philips Hue White & Color Starter Kit', price: '199.99', discount: '169.99', desc: '4 smart bulbs + bridge, 16 million colors, voice control, app scheduling.', images: [`${U}/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop`], rating: '4.60', reviews: 12345 },
    { name: 'West Elm Sculptural Glass Table Lamp', price: '149.00', discount: null, desc: 'Champagne glass base, linen shade, 3-way switch, mid-century modern.', images: [`${U}/photo-1507473885765-e6ed057ab3fe?w=800&h=800&fit=crop`], rating: '4.40', reviews: 2345 },
  ],
  'home-appliances': [
    { name: 'Dyson V15 Detect Cordless Vacuum', price: '749.99', discount: '649.99', desc: 'Laser reveals microscopic dust, piezo sensor counts particles, 60-min runtime.', images: [`${U}/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop`], rating: '4.70', reviews: 8765 },
    { name: 'iRobot Roomba j7+ Robot Vacuum', price: '599.99', discount: '449.99', desc: 'PrecisionVision Navigation, auto-empty base, smart mapping, obstacle avoidance.', images: [`${U}/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop`], rating: '4.40', reviews: 6543 },
  ],
  // ── BEAUTY & HEALTH ──
  skincare: [
    { name: 'CeraVe Moisturizing Cream 16oz', price: '18.99', discount: '15.99', desc: 'Essential ceramides, hyaluronic acid, MVE delivery technology, fragrance-free.', images: [`${U}/photo-1570194065650-d99fb4a38691?w=800&h=800&fit=crop`], rating: '4.70', reviews: 45678 },
    { name: 'La Roche-Posay Anthelios SPF 60', price: '35.99', discount: null, desc: 'Broad spectrum UVA/UVB, Cell-Ox Shield technology, lightweight texture.', images: [`${U}/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop`], rating: '4.60', reviews: 12345 },
    { name: 'The Ordinary Niacinamide 10% + Zinc 1%', price: '6.50', discount: null, desc: 'Targets blemishes, balances sebum, minimizes pores, vegan.', images: [`${U}/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop`], rating: '4.40', reviews: 34567 },
  ],
  makeup: [
    { name: 'Charlotte Tilbury Pillow Talk Lipstick', price: '34.00', discount: null, desc: 'Matte revolution formula, nude-pink shade, 3D pigments, hydrating.', images: [`${U}/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop`], rating: '4.60', reviews: 8765 },
    { name: 'Maybelline Lash Sensational Mascara', price: '11.99', discount: '8.99', desc: 'Fanning brush, 10 layers of lashes, washable formula.', images: [`${U}/photo-1631214524020-7e18db9a8f92?w=800&h=800&fit=crop`], rating: '4.40', reviews: 23456 },
  ],
  haircare: [
    { name: 'Olaplex No.3 Hair Perfector', price: '30.00', discount: '28.00', desc: 'Bond-building treatment, repairs damaged hair, salon-quality at home.', images: [`${U}/photo-1527799820374-dcf8d9d4a388?w=800&h=800&fit=crop`], rating: '4.50', reviews: 15678 },
    { name: 'Dyson Airwrap Multi-Styler', price: '599.99', discount: null, desc: 'Coanda airflow styling, multiple attachments, no extreme heat damage.', images: [`${U}/photo-1522338242992-e1a54571a9f7?w=800&h=800&fit=crop`], rating: '4.40', reviews: 6789 },
  ],
  fragrances: [
    { name: 'Dior Sauvage Eau de Parfum 100ml', price: '150.00', discount: '135.00', desc: 'Ambroxan and vanilla notes, refillable bottle, long-lasting.', images: [`${U}/photo-1541643600914-78b084683601?w=800&h=800&fit=crop`], rating: '4.70', reviews: 23456 },
    { name: 'Chanel No. 5 Eau de Parfum 50ml', price: '140.00', discount: null, desc: 'Iconic floral aldehyde, jasmine and rose, timeless elegance.', images: [`${U}/photo-1541643600914-78b084683601?w=800&h=800&fit=crop`], rating: '4.80', reviews: 34567 },
  ],
  // ── SPORTS & OUTDOORS ──
  fitness: [
    { name: 'Bowflex SelectTech 552 Dumbbells', price: '429.00', discount: '349.99', desc: 'Adjustable 5-52.5 lbs each, replaces 15 sets of weights, compact design.', images: [`${U}/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop`], rating: '4.70', reviews: 12345 },
    { name: 'Peloton Bike+', price: '2495.00', discount: null, desc: '24" rotating HD touchscreen, auto-follow resistance, Apple GymKit.', images: [`${U}/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop`], rating: '4.40', reviews: 5678 },
    { name: 'Manduka PRO Yoga Mat 6mm', price: '120.00', discount: '108.00', desc: 'Lifetime guarantee, closed-cell surface, dense cushioning, non-toxic.', images: [`${U}/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop`], rating: '4.80', reviews: 8765 },
  ],
  'outdoor-recreation': [
    { name: 'The North Face Wawona 6 Tent', price: '400.00', discount: '339.99', desc: '6-person, 3-season, full-mesh body, vestibule storage, easy setup.', images: [`${U}/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop`], rating: '4.50', reviews: 3456 },
    { name: 'YETI Tundra 45 Hard Cooler', price: '325.00', discount: null, desc: 'Rotomolded construction, PermaFrost insulation, bear-resistant certified.', images: [`${U}/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop`], rating: '4.70', reviews: 6789 },
    { name: 'Hydro Flask 32oz Wide Mouth', price: '44.95', discount: '39.99', desc: 'TempShield insulation, 24hr cold / 12hr hot, BPA-free, dishwasher safe.', images: [`${U}/photo-1461896836934-bd45ba8fcf9b?w=800&h=800&fit=crop`], rating: '4.70', reviews: 23456 },
  ],
  'sports-outdoors': [
    { name: 'Wilson NFL Official Game Football', price: '129.99', discount: null, desc: 'Exclusive leather, hand-sewn, official size and weight.', images: [`${U}/photo-1461896836934-bd45ba8fcf9b?w=800&h=800&fit=crop`], rating: '4.60', reviews: 4567 },
    { name: 'Spalding NBA Official Game Ball', price: '169.99', discount: '149.99', desc: 'Full-grain Horween leather, official size 7, indoor use.', images: [`${U}/photo-1461896836934-bd45ba8fcf9b?w=800&h=800&fit=crop`], rating: '4.50', reviews: 3456 },
  ],
  // ── TOYS & GAMES ──
  'toys-games': [
    { name: 'LEGO Star Wars Millennium Falcon', price: '849.99', discount: null, desc: '7541 pieces, Ultimate Collector Series, minifigures included.', images: [`${U}/photo-1558060370-d644479cb6f7?w=800&h=800&fit=crop`], rating: '4.90', reviews: 4567 },
    { name: 'Barbie Dreamhouse 2024', price: '199.99', discount: '169.99', desc: '3 stories, 10 rooms, pool with slide, 75+ accessories.', images: [`${U}/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop`], rating: '4.60', reviews: 8765 },
    { name: 'Monopoly Classic Board Game', price: '24.99', discount: '19.99', desc: 'Classic property trading game, 2-8 players, ages 8+.', images: [`${U}/photo-1611371805429-8b5c1b2c34ba?w=800&h=800&fit=crop`], rating: '4.70', reviews: 34567 },
    { name: 'Hot Wheels Ultimate Garage', price: '89.99', discount: '74.99', desc: 'Multi-level parking, car wash, gas station, holds 100+ cars.', images: [`${U}/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop`], rating: '4.50', reviews: 5678 },
  ],
  // ── BOOKS ──
  books: [
    { name: 'Atomic Habits by James Clear', price: '27.00', discount: '16.99', desc: 'Proven framework for building good habits and breaking bad ones. #1 NYT Bestseller.', images: [`${U}/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop`], rating: '4.80', reviews: 98765 },
    { name: 'The Midnight Library by Matt Haig', price: '28.00', discount: '14.99', desc: 'Between life and death, a library of infinite possibilities. GoodReads Choice Award.', images: [`${U}/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop`], rating: '4.20', reviews: 45678 },
    { name: 'Educated by Tara Westover', price: '18.00', discount: null, desc: 'Memoir of a woman who leaves her survivalist family to earn a PhD from Cambridge.', images: [`${U}/photo-1524578271613-d550eacf6090?w=800&h=800&fit=crop`], rating: '4.70', reviews: 56789 },
    { name: 'Project Hail Mary by Andy Weir', price: '28.99', discount: '18.99', desc: 'A lone astronaut must save Earth. From the author of The Martian.', images: [`${U}/photo-1495446815901-a7297e633e8d?w=800&h=800&fit=crop`], rating: '4.80', reviews: 34567 },
  ],
  // ── PET SUPPLIES ──
  'pet-supplies': [
    { name: 'Blue Buffalo Life Protection Dog Food 30lb', price: '64.98', discount: '54.99', desc: 'Real chicken, brown rice, wholesome grains, LifeSource Bits antioxidants.', images: [`${U}/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop`], rating: '4.60', reviews: 23456 },
    { name: 'KONG Classic Dog Toy Large', price: '14.99', discount: null, desc: 'Natural rubber, unpredictable bounce, stuffable, vet recommended.', images: [`${U}/photo-1535930749574-1399327ce78f?w=800&h=800&fit=crop`], rating: '4.70', reviews: 45678 },
    { name: 'Purina Pro Plan Cat Food 16lb', price: '49.98', discount: '42.99', desc: 'Real chicken, probiotics, high protein, supports immune health.', images: [`${U}/photo-1514888286974-6c03e2ca1dba?w=800&h=800&fit=crop`], rating: '4.50', reviews: 12345 },
  ],
  // ── AUTOMOTIVE ──
  automotive: [
    { name: 'Chemical Guys Car Wash Kit', price: '49.99', discount: '39.99', desc: '16-piece kit, foam cannon, microfiber towels, pH-balanced soap.', images: [`${U}/photo-1489824904134-891ab64532f1?w=800&h=800&fit=crop`], rating: '4.50', reviews: 8765 },
    { name: 'NOCO Boost Plus Jump Starter', price: '99.95', discount: '84.99', desc: '1000 amp, lithium-ion, portable, USB power bank, LED flashlight.', images: [`${U}/photo-1489824904134-891ab64532f1?w=800&h=800&fit=crop`], rating: '4.70', reviews: 12345 },
  ],
  // ── OFFICE PRODUCTS ──
  'office-products': [
    { name: 'Herman Miller Aeron Chair', price: '1395.00', discount: '1195.00', desc: 'Ergonomic mesh, PostureFit SL, adjustable arms, 12-year warranty.', images: [`${U}/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop`], rating: '4.70', reviews: 6789 },
    { name: 'Logitech MX Master 3S Mouse', price: '99.99', discount: '89.99', desc: 'Quiet clicks, 8K DPI, MagSpeed scroll, USB-C, multi-device.', images: [`${U}/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop`], rating: '4.70', reviews: 15678 },
  ],
  // ── GARDEN ──
  garden: [
    { name: 'Fiskars Bypass Pruning Shears', price: '14.99', discount: '12.99', desc: 'Precision-ground steel blade, low-friction coating, ergonomic handle.', images: [`${U}/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop`], rating: '4.60', reviews: 23456 },
    { name: 'Miracle-Gro All Purpose Plant Food 5lb', price: '14.49', discount: null, desc: 'Feeds every 1-2 weeks, instant results, for flowers and vegetables.', images: [`${U}/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop`], rating: '4.50', reviews: 34567 },
  ],
};

async function seedRealisticProducts() {
  console.log('🌱 Seeding realistic products with Unsplash images...\n');

  try {
    // Get all existing categories
    const allCategories = await db.select().from(schema.categories);
    const categoryBySlug = new Map(allCategories.map(c => [c.slug, c]));
    console.log(`Found ${allCategories.length} categories in DB\n`);

    // Clear existing products and dependent data
    console.log('Clearing existing products and related data...');
    await db.delete(schema.orderItems);
    await db.delete(schema.cartItems);
    await db.delete(schema.reviews);
    await db.delete(schema.inventory);
    await db.delete(schema.productImages);
    await db.delete(schema.wishlistItems);
    await db.delete(schema.productSupplierLinks);
    await db.delete(schema.products);
    console.log('✓ Cleared existing products and related data\n');

    let totalProducts = 0;
    let totalImages = 0;
    let skuCounter = 0;

    for (const [categorySlug, products] of Object.entries(productsByCategory)) {
      const category = categoryBySlug.get(categorySlug);
      if (!category) {
        // Try to find parent category for top-level slugs like 'automotive'
        // These might be top-level categories
        console.log(`⚠ Category "${categorySlug}" not found, skipping ${products.length} products`);
        continue;
      }

      console.log(`Seeding ${products.length} products for "${category.name}" (${categorySlug})...`);

      for (const p of products) {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        skuCounter++;

        // Insert product
        const [product] = await db.insert(schema.products).values({
          name: p.name,
          slug: `${slug}-${skuCounter}`,
          description: p.desc,
          price: p.price,
          discountPrice: p.discount,
          categoryId: category.id,
          sku: `ZIV-${String(skuCounter).padStart(4, '0')}`,
          isActive: true,
          averageRating: p.rating,
          reviewCount: p.reviews,
        }).returning();

        // Insert images
        for (let i = 0; i < p.images.length; i++) {
          await db.insert(schema.productImages).values({
            productId: product.id,
            imageUrl: p.images[i],
            thumbnailUrl: p.images[i].replace('800', '200'),
            altText: `${p.name} - Image ${i + 1}`,
            displayOrder: i,
            isPrimary: i === 0,
          });
          totalImages++;
        }

        // Insert inventory
        await db.insert(schema.inventory).values({
          productId: product.id,
          quantity: 50 + (skuCounter * 7) % 200, // deterministic stock
          lowStockThreshold: 10,
        });

        totalProducts++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Images: ${totalImages}`);
    console.log(`   Inventory: ${totalProducts} entries`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedRealisticProducts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
