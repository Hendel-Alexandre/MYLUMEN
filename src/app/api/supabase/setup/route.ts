import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create clients table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Enable Row Level Security
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow all operations (for demo purposes)
        DROP POLICY IF EXISTS "Allow all operations" ON clients;
        CREATE POLICY "Allow all operations" ON clients
          FOR ALL
          USING (true)
          WITH CHECK (true);

        -- Enable Realtime
        ALTER PUBLICATION supabase_realtime ADD TABLE clients;
      `
    });

    if (createTableError) {
      // Try alternative approach - direct table creation
      const { error: altError } = await supabase.from('clients').select('id').limit(1);
      
      if (altError && altError.code === 'PGRST204') {
        return NextResponse.json({
          success: false,
          error: 'Table does not exist. Please run the SQL migration manually in Supabase Dashboard.',
          sql: `
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE clients;
          `.trim()
        });
      }
    }

    // Verify table exists
    const { data, error: verifyError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: verifyError.message,
        hint: 'Run the SQL migration manually in your Supabase Dashboard'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase clients table is ready!'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if table exists
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message,
        sql: `
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE clients;
        `.trim()
      });
    }

    return NextResponse.json({
      exists: true,
      message: 'Table exists and is ready'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
