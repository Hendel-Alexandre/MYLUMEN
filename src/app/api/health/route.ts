import { NextResponse } from 'next/server';
import { isDatabaseConfigured, getDatabaseError } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasTursoUrl: !!process.env.TURSO_CONNECTION_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    },
    database: {
      configured: isDatabaseConfigured(),
      error: getDatabaseError(),
    },
    api: {
      version: '1.0.0',
      framework: 'Next.js 15',
    },
  };

  // Return 503 if database is not configured
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ...checks, status: 'error' },
      { status: 503 }
    );
  }

  return NextResponse.json(checks);
}