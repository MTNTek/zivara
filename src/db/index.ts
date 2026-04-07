import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Next.js automatically loads .env.local — no manual dotenv needed.
// For scripts (seed, migrate), dotenv is called in those entry points.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Make sure .env.local exists in the project root with DATABASE_URL=postgresql://...'
  );
}

const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
  prepare: true,
  fetch_types: false,
  connection: {
    application_name: 'zivara-ecommerce',
  },
  onnotice: () => {},
});

export const db = drizzle(client, { schema });
export { client };
