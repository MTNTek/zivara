import { db, client } from '../src/db/index';
import { categories } from '../src/db/schema';
import { eq } from 'drizzle-orm';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const subcategories: Record<string, string[]> = {
  'Kitchen & Dining': [
    'Cookware', 'Storage & Organisation', 'Dinnerware & Serveware', 'Accessories',
    'Cutlery', 'Coffee & Tea', 'Bakeware', 'Drinkware',
  ],
  'Furniture': [
    'Sofas & Couches', 'Coffee Tables', 'Gaming Chairs', 'Bean Bags',
    'Desks & Desk Chairs', 'TV & Media Units', 'Storage & Cabinets', 'Chairs',
  ],
  'Tools & Home Improvement': [
    'Power Tools', 'Hand Tools', 'Cleaning Supplies', 'Home Organisation',
    'Laundry Care', 'Safety & Security', 'Electrical & Lighting', 'Paints & Wall Supplies',
  ],
  'Home Decor': [
    'Lighting', 'Home Fragrance', 'Mats & Carpets', 'Furniture Covers',
    'Mirrors', 'Window Treatments', 'Decorative Pillows', 'Decor Accents',
  ],
  'Bath & Bedding': [
    'Sheets & Pillowcases', 'Shower Heads', 'Comforter Sets', 'Duvet Covers',
    'Towels', 'Pillows', 'Bath Robes', 'Bath Organizers',
  ],
  'Home Appliances': [
    'Air Fryers', 'Coffee Makers', 'Ovens & Toasters', 'Irons & Steamers',
    'Blenders', 'Vacuums', 'Electric Kettles', 'Mixers',
  ],
  'Large Appliances': [
    'Refrigerators', 'Washing Machines', 'Air Conditioners', 'Cooking Ranges',
    'Dishwashers', 'Water Dispensers', 'Dryers', 'Freezers',
  ],
};

async function main() {
  console.log('Finding Home & Kitchen parent category...');

  // Find the Home & Kitchen parent
  const [homeKitchen] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, 'home-kitchen'))
    .limit(1);

  if (!homeKitchen) {
    console.error('Home & Kitchen category not found! Make sure it exists with slug "home-kitchen".');
    await client.end();
    process.exit(1);
  }

  console.log(`Found: ${homeKitchen.name} (${homeKitchen.id})`);

  let subOrder = 0;
  for (const [subName, children] of Object.entries(subcategories)) {
    const subSlug = slugify(subName);
    subOrder++;

    // Check if subcategory already exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, subSlug))
      .limit(1);

    let subId: string;
    if (existing) {
      console.log(`  Subcategory "${subName}" already exists, skipping insert.`);
      subId = existing.id;
    } else {
      const [inserted] = await db.insert(categories).values({
        name: subName,
        slug: subSlug,
        parentId: homeKitchen.id,
        displayOrder: subOrder,
      }).returning({ id: categories.id });
      subId = inserted.id;
      console.log(`  + ${subName} (${subSlug})`);
    }

    // Insert level-3 children
    let childOrder = 0;
    for (const childName of children) {
      const childSlug = slugify(childName);
      childOrder++;

      const [childExisting] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, childSlug))
        .limit(1);

      if (childExisting) {
        console.log(`    Skipping "${childName}" (already exists)`);
        continue;
      }

      await db.insert(categories).values({
        name: childName,
        slug: childSlug,
        parentId: subId,
        displayOrder: childOrder,
      });
      console.log(`    + ${childName} (${childSlug})`);
    }
  }

  console.log('\nDone seeding Home & Kitchen subcategories!');
  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
