import { db, client } from '../src/db/index';
import { categories, products } from '../src/db/schema';
import { eq } from 'drizzle-orm';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const allowed: Record<string, string[]> = {
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

const allowedLevel2Slugs = Object.keys(allowed).map(slugify);

// Reassign products from a category to a target, then delete the category
async function reassignAndDelete(catId: string, catName: string, targetId: string) {
  // Reassign products
  const updated = await db.update(products)
    .set({ categoryId: targetId })
    .where(eq(products.categoryId, catId))
    .returning({ id: products.id });
  if (updated.length > 0) {
    console.log(`  Reassigned ${updated.length} products from "${catName}" to parent`);
  }
  // Nullify parentId refs from child categories
  await db.update(categories)
    .set({ parentId: null })
    .where(eq(categories.parentId, catId));
  // Delete
  await db.delete(categories).where(eq(categories.id, catId));
  console.log(`  DELETED: "${catName}"`);
}

async function main() {
  const [homeKitchen] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, 'home-kitchen'))
    .limit(1);

  if (!homeKitchen) {
    console.error('Home & Kitchen not found!');
    await client.end();
    process.exit(1);
  }
  console.log(`Found Home & Kitchen: ${homeKitchen.id}\n`);

  // Get all level-2 children
  const level2 = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, homeKitchen.id));

  console.log(`Current level-2: ${level2.map(c => `${c.name} (${c.slug})`).join(', ')}\n`);

  // Delete unwanted level-2 (and their children first)
  for (const cat of level2) {
    if (!allowedLevel2Slugs.includes(cat.slug)) {
      console.log(`Removing unwanted level-2: "${cat.name}" (${cat.slug})`);
      // First delete/reassign all children of this category
      const children = await db
        .select()
        .from(categories)
        .where(eq(categories.parentId, cat.id));
      for (const child of children) {
        // Delete grandchildren first
        const grandchildren = await db
          .select()
          .from(categories)
          .where(eq(categories.parentId, child.id));
        for (const gc of grandchildren) {
          await reassignAndDelete(gc.id, gc.name, homeKitchen.id);
        }
        await reassignAndDelete(child.id, child.name, homeKitchen.id);
      }
      await reassignAndDelete(cat.id, cat.name, homeKitchen.id);
    }
  }

  // For each allowed level-2, clean up unwanted level-3
  for (const [subName, allowedChildren] of Object.entries(allowed)) {
    const subSlug = slugify(subName);
    const [sub] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, subSlug))
      .limit(1);

    if (!sub) {
      console.log(`WARNING: "${subName}" not found`);
      continue;
    }

    const allowedChildSlugs = allowedChildren.map(slugify);
    const currentChildren = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, sub.id));

    for (const child of currentChildren) {
      if (!allowedChildSlugs.includes(child.slug)) {
        console.log(`Removing unwanted level-3 under "${subName}": "${child.name}"`);
        await reassignAndDelete(child.id, child.name, sub.id);
      }
    }

    const kept = currentChildren.filter(c => allowedChildSlugs.includes(c.slug));
    console.log(`✓ ${subName}: ${kept.length}/${allowedChildren.length} children kept`);
  }

  console.log('\nCleanup complete!');
  await client.end();
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
