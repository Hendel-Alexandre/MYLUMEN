import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const integrations = await db.all(
      sql`SELECT id, user_id, provider, calendar_id, sync_enabled, two_way_sync, last_sync_at, created_at
          FROM calendar_integrations WHERE user_id = ${userId}`
    );

    return new Response(JSON.stringify(integrations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { provider, code } = body;

    if (!provider || !code) {
      return new Response(JSON.stringify({ error: 'Missing provider or code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code);
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await db.run(
      sql`INSERT OR REPLACE INTO calendar_integrations (
        user_id, provider, access_token, refresh_token, token_expires_at,
        calendar_id, created_at, updated_at
      ) VALUES (
        ${userId}, ${provider}, ${tokens.access_token}, ${tokens.refresh_token},
        ${expiresAt}, ${tokens.calendar_id || null}, ${now}, ${now}
      )`
    );

    return new Response(JSON.stringify({ success: true, provider }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function exchangeCodeForTokens(provider: string, code: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (provider === 'google') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${appUrl}/integrations/callback`,
        grant_type: 'authorization_code'
      })
    });
    return await response.json();
  } else if (provider === 'outlook') {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/integrations/callback`,
        grant_type: 'authorization_code'
      })
    });
    return await response.json();
  }
  throw new Error('Unsupported provider');
}