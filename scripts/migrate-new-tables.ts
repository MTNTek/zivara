import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function migrate() {
  console.log('🔄 Creating new tables...\n');

  // Newsletter Subscribers
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMP
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers (email)`;
  console.log('✅ newsletter_subscribers');

  // Store Settings
  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key VARCHAR(100) NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ store_settings');

  // Verify existing tables have the columns we need
  // Check if orders.discount column exists
  const discountCol = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount'
  `;
  if (discountCol.length === 0) {
    await sql`ALTER TABLE orders ADD COLUMN discount DECIMAL(10,2) DEFAULT '0.00'`;
    console.log('✅ Added orders.discount column');
  }

  // Check if orders.coupon_id column exists
  const couponCol = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'coupon_id'
  `;
  if (couponCol.length === 0) {
    await sql`ALTER TABLE orders ADD COLUMN coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL`;
    console.log('✅ Added orders.coupon_id column');
  }

  console.log('\n✅ All migrations complete!');
  await sql.end();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
