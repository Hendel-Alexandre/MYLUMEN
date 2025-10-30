import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('📦 Connecting to Supabase database...');
  
  const sql = postgres(databaseUrl, {
    max: 1,
  });

  try {
    const migrationPath = join(
      process.cwd(),
      'src/supabase/migrations/20251030021116_create_user_mode_settings.sql'
    );
    
    console.log('📄 Reading migration file...');
    const migrationSql = readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Applying user_mode_settings table migration...');
    await sql.unsafe(migrationSql);
    
    console.log('✅ Migration applied successfully!');
    console.log('📊 user_mode_settings table created with RLS policies');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyMigration();
