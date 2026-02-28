# Database Setup

This directory contains the database schema, migrations, and connection configuration for the Zivara eCommerce platform.

## Structure

- `schema.ts` - Drizzle ORM schema definitions for all database tables
- `index.ts` - Database connection configuration with connection pooling
- `migrate.ts` - Migration runner script
- `migrations/` - Generated SQL migration files

## Database Schema

The database includes the following tables:

1. **users** - User accounts (customers and admins)
2. **categories** - Product categories with hierarchical support
3. **products** - Product catalog with pricing and metadata
4. **product_images** - Product images with display order
5. **inventory** - Product inventory tracking
6. **cart_items** - Shopping cart items (authenticated and guest)
7. **orders** - Customer orders with shipping and payment info
8. **order_items** - Individual items within orders
9. **order_status_history** - Order status change tracking
10. **reviews** - Product reviews and ratings
11. **user_addresses** - Saved customer addresses
12. **price_history** - Historical product pricing
13. **sessions** - User sessions for authentication
14. **audit_logs** - System audit trail

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/zivaravs
NODE_ENV=development
```

### 2. Generate Migrations

Generate migration files from the schema:

```bash
npm run db:generate
```

### 3. Run Migrations

Apply migrations to the database:

```bash
npm run db:migrate
```

### 4. Alternative: Push Schema (Development Only)

For rapid development, push schema changes directly without migrations:

```bash
npm run db:push
```

**Warning:** This bypasses migrations and should only be used in development.

### 5. Database Studio (Optional)

Launch Drizzle Studio to browse and edit data:

```bash
npm run db:studio
```

## Migration Workflow

### Creating New Migrations

1. Modify `schema.ts` with your changes
2. Generate migration: `npm run db:generate`
3. Review the generated SQL in `migrations/`
4. Apply migration: `npm run db:migrate`

### Migration Files

Migrations are stored in `src/db/migrations/` with:
- SQL files containing the migration statements
- Metadata in the `meta/` subdirectory

## Connection Pooling

The database connection is configured with:
- **Max connections**: 10
- **Idle timeout**: 20 seconds
- **Connect timeout**: 10 seconds

These settings can be adjusted in `index.ts` based on your deployment needs.

## Foreign Key Relationships

All foreign key relationships are enforced at the database level:
- Cascade deletes for dependent records (cart items, order items, etc.)
- Referential integrity maintained across all tables
- Indexes on foreign key columns for query performance

## Type Safety

Drizzle ORM provides full TypeScript type inference:
- Table schemas are typed
- Query results are typed
- Relations provide type-safe joins

Import types from the schema:

```typescript
import { users, products, orders } from '@/db/schema';
import { db } from '@/db';
```
