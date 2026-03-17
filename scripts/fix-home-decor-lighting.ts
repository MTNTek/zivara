import { db, client } from '../src/db/index';
import { categories, products } from '../src/db/schema';
import { eq } from 'drizzle-orm';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const allowedChildren = [
  'Lighting', 'Home Fragrance', 'Mats & Carpets', 'Furniture Covers',
  'Mirrors', 'Window Treatments', 'Decorative Pillows', 'Decor Accents',
];

async function main() {
  // Find Home Decor
  const [homeDecor] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, 'home-decor'))
    .limit(1);

  if (!homeDecor) {
    console.error('Home Decor not found!');
    await client.end();
    process.exit(1);
  }
  console.log(`Found Home Decor: ${homeDecor.id}`);

  // Get current children
  const current = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, homeDecor.id));

  console.log(`Current children: ${current.map(c => c.name).join(', ')}`);

  const allowedSlugs = allowedChildren.map(slugify);

  // Delete unwanted children
  for (const child of current) {
    if (!allowedSlugs.includes(child.slug)) {
      // Reassign products first
      const updated = await db.update(products)
        .set({ categoryId: homeDecor.id })
        .where(eq(products.categoryId, child.id))
        .returning({ id: products.id });
      if (updated.length > 0) {
        console.log(`  Reassigned ${updated.length} products from "${child.name}"`);
      }
      await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, child.id));
      await db.delete(categories).where(eq(categories.id, child.id));
      console.log(`  DELETED: "${child.name}" (${child.slug})`);
    }
  }

  // Ensure all allowed children exist
  for (let i = 0; i < allowedChildren.length; i++) {
    const name = allowedChildren[i];
    const slug = slugify(name);
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing) {
      // Make sure it's parented to Home Decor
      if (existing.parentId !== homeDecor.id) {
        await db.update(categories)
          .set({ parentId: homeDecor.id })
          .where(eq(categories.id, existing.id));
        console.log(`  Re-parented "${name}" to Home Decor`);
      } else {
        console.log(`  ✓ "${name}" exists`);
      }
    } else {
      await db.insert(categories).values({
        name,
        slug,
        parentId: homeDecor.id,
        displayOrder: i + 1,
      });
      console.log(`  + Created "${name}" (${slug})`);
    }
  }

  // Final check
  const final = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, homeDecor.id));
  console.log(`\nHome Decor now has ${final.length} children: ${final.map(c => c.name).join(', ')}`);

  await client.end();
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
