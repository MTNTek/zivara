import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection with optimized connection pooling
const connectionString = process.env.DATABASE_URL;

// Configure connection pool with optimized settings
// These settings balance performance with resource usage
const client = postgres(connectionString, {
  // Connection pool settings
  max: 20, // Maximum number of connections in the pool (increased for better concurrency)
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Maximum lifetime of a connection (30 minutes)
  
  // Performance optimizations
  prepare: true, // Use prepared statements for better performance
  fetch_types: false, // Disable automatic type fetching for faster queries
  
  // Connection behavior
  connection: {
    application_name: 'zivara-ecommerce', // Identify connections in PostgreSQL logs
  },
  
  // Error handling
  onnotice: () => {}, // Suppress notices to reduce noise
});

// Initialize Drizzle ORM with schema
export const db = drizzle(client, { schema });

// Export the client for migrations and cleanup
export { client };
