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

    const settings = await db.get(
      sql`SELECT * FROM ai_personality_settings WHERE user_id = ${userId}`
    );

    if (!settings) {
      // Return defaults
      return new Response(JSON.stringify({
        tone: 'friendly',
        verbosity: 5,
        focus_areas: ['financial insights', 'productivity tips'],
        custom_instructions: ''
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(settings), {
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

export async function PUT(request: Request) {
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
    const now = new Date().toISOString();

    // Check if settings exist
    const existing = await db.get(
      sql`SELECT id FROM ai_personality_settings WHERE user_id = ${userId}`
    );

    if (existing) {
      await db.run(
        sql`UPDATE ai_personality_settings SET
            tone = ${body.tone},
            verbosity = ${body.verbosity},
            focus_areas = ${JSON.stringify(body.focus_areas)},
            custom_instructions = ${body.custom_instructions || ''},
            updated_at = ${now}
          WHERE user_id = ${userId}`
      );
    } else {
      await db.run(
        sql`INSERT INTO ai_personality_settings (
          user_id, tone, verbosity, focus_areas, custom_instructions, created_at, updated_at
        ) VALUES (
          ${userId}, ${body.tone}, ${body.verbosity}, ${JSON.stringify(body.focus_areas)},
          ${body.custom_instructions || ''}, ${now}, ${now}
        )`
      );
    }

    return new Response(JSON.stringify({ success: true, ...body }), {
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
