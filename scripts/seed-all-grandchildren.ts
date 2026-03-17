import { db, client } from '../src/db/index';
import { categories } from '../src/db/schema';
import { eq } from 'drizzle-orm';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// parentSlug -> childName -> grandchildren
const grandchildrenData: Record<string, Record<string, string[]>> = {
  // ── Electronics ──
  electronics: {
    'Smartphones & Accessories': [
      'Android Phones', 'iPhones', 'Phone Cases', 'Screen Protectors',
      'Chargers & Cables', 'Power Banks', 'Phone Holders', 'Refurbished Phones',
    ],
    'Laptops & Computers': [
      'Gaming Laptops', 'Ultrabooks', 'Chromebooks', 'Desktops',
      'Monitors', 'Keyboards & Mice', 'Storage Devices', 'Networking',
    ],
    'Headphones & Audio': [
      'Over-Ear Headphones', 'Earbuds', 'Wireless Earbuds', 'Speakers',
      'Soundbars', 'Microphones', 'Audio Accessories', 'Home Audio',
    ],
    'TV & Home Theater': [
      'Smart TVs', 'LED TVs', 'OLED TVs', 'Projectors',
      'Streaming Devices', 'TV Mounts', 'Home Theater Systems', 'TV Accessories',
    ],
    'Gaming': [
      'Consoles', 'Controllers', 'Gaming Headsets', 'Gaming Keyboards',
      'Gaming Mice', 'Gaming Chairs', 'VR Headsets', 'Gaming Accessories',
    ],
    'Smart Home': [
      'Smart Speakers', 'Smart Displays', 'Smart Lighting', 'Smart Plugs',
      'Security Cameras', 'Smart Locks', 'Smart Thermostats', 'Robot Vacuums',
    ],
    'Cameras & Photography': [
      'DSLR Cameras', 'Mirrorless Cameras', 'Action Cameras', 'Drones',
      'Camera Lenses', 'Tripods', 'Camera Bags', 'Memory Cards',
    ],
    'Wearables': [
      'Smart Watches', 'Fitness Trackers', 'Smart Rings', 'Smart Glasses',
    ],
  },

  // ── Men's Fashion ──
  'mens-fashion': {
    'Clothing': [
      'T-Shirts & Polos', 'Shirts', 'Jeans & Pants', 'Shorts',
      'Jackets & Coats', 'Hoodies & Sweatshirts', 'Suits & Blazers', 'Activewear',
    ],
    'Shoes': [
      'Sneakers', 'Formal Shoes', 'Sandals & Slippers', 'Boots',
      'Loafers', 'Running Shoes', 'Sports Shoes', 'Flip Flops',
    ],
    'Watches': [
      'Analog Watches', 'Digital Watches', 'Smart Watches', 'Luxury Watches',
      'Sports Watches', 'Watch Bands', 'Watch Accessories', 'Watch Gift Sets',
    ],
    'Accessories': [
      'Wallets', 'Belts', 'Sunglasses', 'Ties & Bow Ties',
      'Hats & Caps', 'Bags & Backpacks', 'Cufflinks', 'Scarves',
    ],
  },

  // ── Women's Fashion ──
  'womens-fashion': {
    'Clothing': [
      'Dresses', 'Tops & Tees', 'Jeans & Pants', 'Skirts',
      'Abayas & Modest Wear', 'Jackets & Coats', 'Activewear', 'Sleepwear',
    ],
    'Shoes': [
      'Heels', 'Flats', 'Sneakers', 'Sandals',
      'Boots', 'Wedges', 'Mules', 'Slippers',
    ],
    'Handbags': [
      'Tote Bags', 'Crossbody Bags', 'Shoulder Bags', 'Clutches',
      'Backpacks', 'Wallets', 'Travel Bags', 'Laptop Bags',
    ],
    'Jewelry': [
      'Necklaces', 'Earrings', 'Bracelets', 'Rings',
      'Anklets', 'Brooches', 'Jewelry Sets', 'Body Jewelry',
    ],
  },

  // ── Beauty & Health ──
  'beauty-health': {
    'Skincare': [
      'Moisturizers', 'Serums', 'Sunscreen', 'Cleansers',
      'Toners', 'Eye Cream', 'Face Masks', 'Lip Care',
    ],
    'Makeup': [
      'Foundation', 'Lipstick', 'Mascara', 'Eyeshadow',
      'Concealer', 'Blush', 'Primer', 'Setting Spray',
    ],
    'Haircare': [
      'Shampoo', 'Conditioner', 'Hair Oil', 'Hair Masks',
      'Styling Tools', 'Hair Dryers', 'Straighteners', 'Hair Accessories',
    ],
    'Fragrances': [
      "Women's Perfumes", "Men's Cologne", 'Unisex Fragrances', 'Gift Sets',
      'Body Mists', 'Oud & Incense', 'Fragrance Oils', 'Travel Size',
    ],
  },

  // ── Sports & Outdoors ──
  'sports-outdoors': {
    'Exercise & Fitness': [
      'Treadmills', 'Dumbbells & Weights', 'Yoga Mats', 'Resistance Bands',
      'Exercise Bikes', 'Jump Ropes', 'Foam Rollers', 'Gym Bags',
    ],
    'Outdoor Recreation': [
      'Camping Gear', 'Hiking Boots', 'Tents', 'Sleeping Bags',
      'Backpacks', 'Water Bottles', 'Binoculars', 'Fishing Gear',
    ],
    'Cycling': [
      'Road Bikes', 'Mountain Bikes', 'Cycling Helmets', 'Cycling Gloves',
      'Bike Lights', 'Bike Locks', 'Cycling Jerseys', 'Bike Accessories',
    ],
  },

  // ── Toys & Games ──
  'toys-games': {
    'Board Games': [
      'Strategy Games', 'Family Games', 'Card Games', 'Trivia Games',
      'Classic Board Games', 'Party Games', 'Puzzle Games', 'Cooperative Games',
    ],
    'Building Toys': [
      'LEGO Sets', 'Building Blocks', 'Magnetic Tiles', 'Construction Sets',
      'Model Kits', 'Wooden Blocks', 'Engineering Kits', 'Architecture Sets',
    ],
    'Educational Toys': [
      'STEM Toys', 'Learning Tablets', 'Science Kits', 'Math Games',
      'Coding Toys', 'Language Learning', 'Art & Craft Kits', 'Musical Toys',
    ],
  },

  // ── Books ──
  books: {
    'Fiction': [
      'Literary Fiction', 'Mystery & Thriller', 'Science Fiction', 'Romance',
      'Fantasy', 'Historical Fiction', 'Horror', 'Short Stories',
    ],
    'Non-Fiction': [
      'Biography', 'Self-Help', 'Business & Finance', 'History',
      'Science & Technology', 'Health & Wellness', 'Travel', 'Cookbooks',
    ],
    "Children's Books": [
      'Picture Books', 'Early Readers', 'Chapter Books', 'Young Adult',
      'Activity Books', 'Educational Books', 'Bedtime Stories', 'Comics',
    ],
  },

  // ── Automotive ──
  automotive: {
    'Car Accessories': [
      'Car Phone Holders', 'Dash Cams', 'Car Chargers', 'Seat Covers',
      'Floor Mats', 'Steering Wheel Covers', 'Sun Shades', 'Car Organizers',
    ],
    'Car Care': [
      'Car Wash', 'Wax & Polish', 'Interior Cleaners', 'Tire Care',
      'Air Fresheners', 'Detailing Kits', 'Microfiber Cloths', 'Glass Cleaners',
    ],
    'Tools & Equipment': [
      'Jump Starters', 'Tire Inflators', 'Tool Kits', 'Car Jacks',
      'Battery Chargers', 'OBD Scanners', 'Tow Straps', 'Emergency Kits',
    ],
  },

  // ── Pet Supplies ──
  'pet-supplies': {
    'Dog Supplies': [
      'Dog Food', 'Dog Treats', 'Dog Toys', 'Dog Beds',
      'Leashes & Collars', 'Dog Grooming', 'Dog Clothing', 'Dog Bowls',
    ],
    'Cat Supplies': [
      'Cat Food', 'Cat Litter', 'Cat Toys', 'Cat Trees',
      'Cat Beds', 'Cat Grooming', 'Cat Carriers', 'Cat Bowls',
    ],
    'Fish & Aquatics': [
      'Fish Food', 'Aquariums', 'Filters', 'Decorations',
      'Water Treatment', 'Lighting', 'Air Pumps', 'Fish Nets',
    ],
  },

  // ── Office Products ──
  'office-products': {
    'Office Supplies': [
      'Pens & Pencils', 'Notebooks', 'Sticky Notes', 'Paper',
      'Folders & Binders', 'Tape & Adhesives', 'Scissors', 'Staplers',
    ],
    'Office Electronics': [
      'Printers', 'Scanners', 'Shredders', 'Calculators',
      'Label Makers', 'Laminators', 'Projectors', 'Ink & Toner',
    ],
    'Office Furniture': [
      'Desks', 'Office Chairs', 'Bookshelves', 'Filing Cabinets',
      'Standing Desks', 'Desk Lamps', 'Monitor Stands', 'Footrests',
    ],
  },

  // ── Garden ──
  garden: {
    'Plants & Seeds': [
      'Indoor Plants', 'Outdoor Plants', 'Seeds', 'Bulbs',
      'Succulents', 'Herbs', 'Flower Seeds', 'Vegetable Seeds',
    ],
    'Garden Tools': [
      'Pruning Shears', 'Garden Hoses', 'Shovels', 'Rakes',
      'Wheelbarrows', 'Watering Cans', 'Garden Gloves', 'Lawn Mowers',
    ],
    'Outdoor Decor': [
      'Garden Lights', 'Planters & Pots', 'Garden Statues', 'Wind Chimes',
      'Bird Feeders', 'Outdoor Rugs', 'Garden Flags', 'Fountains',
    ],
  },
};

async function main() {
  console.log('Seeding grandchildren for all categories...\n');

  for (const [parentSlug, childrenMap] of Object.entries(grandchildrenData)) {
    // Find the parent category
    const [parent] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, parentSlug))
      .limit(1);

    if (!parent) {
      console.log(`⚠ Parent "${parentSlug}" not found, skipping.`);
      continue;
    }

    console.log(`\n── ${parent.name} (${parentSlug}) ──`);

    let subOrder = 0;
    for (const [childName, grandchildren] of Object.entries(childrenMap)) {
      subOrder++;

      // Find or create the child category
      // First try to find by name + parentId
      const existingChildren = await db
        .select()
        .from(categories)
        .where(eq(categories.parentId, parent.id));

      let child = existingChildren.find(
        (c) => c.name === childName
      );

      if (!child) {
        // Create the child
        const childSlug = slugify(childName);
        // Check slug doesn't already exist
        const [slugExists] = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, childSlug))
          .limit(1);

        const finalSlug = slugExists
          ? `${childSlug}-${parentSlug}`
          : childSlug;

        const [inserted] = await db
          .insert(categories)
          .values({
            name: childName,
            slug: finalSlug,
            parentId: parent.id,
            displayOrder: subOrder,
          })
          .returning();
        child = inserted;
        console.log(`  + Created child: ${childName} (${finalSlug})`);
      } else {
        console.log(`  ✓ Child exists: ${childName} (${child.slug})`);
      }

      // Now seed grandchildren
      let gcOrder = 0;
      for (const gcName of grandchildren) {
        gcOrder++;
        const gcSlug = slugify(gcName);

        // Check if grandchild already exists under this child
        const existingGc = await db
          .select()
          .from(categories)
          .where(eq(categories.parentId, child.id));

        const gcExists = existingGc.find((g) => g.name === gcName);
        if (gcExists) {
          continue; // Already seeded
        }

        // Try inserting with unique slug, handle collisions
        let finalGcSlug = gcSlug;
        const [slugExists] = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, gcSlug))
          .limit(1);

        if (slugExists) {
          finalGcSlug = `${gcSlug}-${child.slug}`;
          // Check again
          const [slugExists2] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, finalGcSlug))
            .limit(1);
          if (slugExists2) {
            finalGcSlug = `${gcSlug}-${parentSlug}`;
          }
        }

        try {
          await db.insert(categories).values({
            name: gcName,
            slug: finalGcSlug,
            parentId: child.id,
            displayOrder: gcOrder,
          });
          console.log(`    + ${gcName} (${finalGcSlug})`);
        } catch (err: unknown) {
          // If duplicate slug, try with parent slug appended
          const altSlug = `${gcSlug}-${parentSlug}-${child.slug}`;
          try {
            await db.insert(categories).values({
              name: gcName,
              slug: altSlug,
              parentId: child.id,
              displayOrder: gcOrder,
            });
            console.log(`    + ${gcName} (${altSlug}) [fallback]`);
          } catch {
            console.log(`    ⚠ Skipped ${gcName} (slug conflict)`);
          }
        }
      }
    }
  }

  console.log('\n✅ Done seeding all grandchildren!');
  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
