import { db, client } from './src/db/index';
import * as schema from './src/db/schema';

async function clearUsers() {
  try {
    console.log('🗑️  Clearing all data from database...\n');

    // Delete in correct order to respect foreign key constraints
    await db.delete(schema.reviews);
    console.log('✓ Deleted reviews');
    
    await db.delete(schema.orderStatusHistory);
    console.log('✓ Deleted order status history');
    
    await db.delete(schema.orderItems);
    console.log('✓ Deleted order items');
    
    await db.delete(schema.orders);
    console.log('✓ Deleted orders');
    
    await db.delete(schema.cartItems);
    console.log('✓ Deleted cart items');
    
    await db.delete(schema.inventory);
    console.log('✓ Deleted inventory');
    
    await db.delete(schema.productImages);
    console.log('✓ Deleted product images');
    
    await db.delete(schema.products);
    console.log('✓ Deleted products');
    
    await db.delete(schema.categories);
    console.log('✓ Deleted categories');
    
    await db.delete(schema.userAddresses);
    console.log('✓ Deleted user addresses');
    
    await db.delete(schema.auditLogs);
    console.log('✓ Deleted audit logs');
    
    await db.delete(schema.accounts);
    console.log('✓ Deleted accounts');
    
    await db.delete(schema.sessions);
    console.log('✓ Deleted sessions');
    
    await db.delete(schema.users);
    console.log('✓ Deleted users');

    console.log('\n✅ All data cleared successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Go to http://localhost:3000/login');
    console.log('   3. You will be redirected to /register');
    console.log('   4. Create your first account - it will automatically be an admin!');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

clearUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
