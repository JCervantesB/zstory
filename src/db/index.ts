import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

// Export the pool for direct access if needed
export { pool };

// Export schema for external use
export * from './schema';