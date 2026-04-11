import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables (.env.local takes precedence, override ensures it wins)
dotenv.config({ path: '.env.local', override: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
