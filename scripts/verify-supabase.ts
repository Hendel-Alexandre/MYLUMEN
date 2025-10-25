#!/usr/bin/env node

/**
 * Supabase Connection Verification Script
 * 
 * This script verifies that your Supabase PostgreSQL connection is working correctly.
 * Run with: npm run verify-db
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

async function verifyConnection() {
  console.log('🔍 Verifying Supabase PostgreSQL Connection...\n');

  if (!DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in environment variables');
    console.log('\nPlease ensure your .env file contains:');
    console.log('DATABASE_URL=postgresql://postgres.fhjknsvhwzrxarbfiqpx:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
    process.exit(1);
  }

  try {
    console.log('📡 Connecting to Supabase...');
    const sql = postgres(DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
    });

    // Test connection
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!\n');
    console.log('📊 PostgreSQL Version:', result[0].version);

    // Check for tables
    console.log('\n🔍 Checking for tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('\n⚠️  No tables found in database');
      console.log('\n📝 Next step: Run migrations to create tables:');
      console.log('   npm run db:push');
    } else {
      console.log(`\n✅ Found ${tables.length} table(s):`);
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Close connection
    await sql.end();
    console.log('\n✨ Verification complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection failed:');
    if (error instanceof Error) {
      console.error('   ', error.message);
      
      if (error.message.includes('password authentication failed')) {
        console.log('\n💡 Tip: Check your SUPABASE_DB_PASSWORD in .env');
      } else if (error.message.includes('timeout')) {
        console.log('\n💡 Tip: Check your internet connection and Supabase project status');
      }
    } else {
      console.error('   ', error);
    }
    process.exit(1);
  }
}

verifyConnection();
