import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle>;
let connectionError: string | null = null;

try {
  if (!databaseUrl) {
    connectionError = 'Missing required environment variable: DATABASE_URL';
    console.error('[Database Configuration Error]', connectionError);
    
    // Create a mock db object for when database is not configured
    db = {} as ReturnType<typeof drizzle>;
  } else {
    // Create PostgreSQL client for Supabase
    const client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    // Initialize Drizzle with PostgreSQL
    db = drizzle(client, { schema });
    console.log('[Database] Successfully connected to Supabase PostgreSQL');
  }
} catch (error) {
  connectionError = `Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`;
  console.error('[Database Connection Error]', connectionError);
  db = {} as ReturnType<typeof drizzle>;
}

// Helper function to check if database is properly configured
export function isDatabaseConfigured(): boolean {
  return connectionError === null;
}

// Helper function to get database error
export function getDatabaseError(): string | null {
  return connectionError;
}

export { db };