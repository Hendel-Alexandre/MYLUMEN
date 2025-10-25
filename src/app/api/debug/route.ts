import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasTurso: !!process.env.TURSO_CONNECTION_URL,
  });
}
