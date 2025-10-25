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

    const codes = await db.all(
      sql`SELECT * FROM discount_codes WHERE user_id = ${userId} ORDER BY created_at DESC`
    );

    return new Response(JSON.stringify(codes), {
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
    const now = new Date().toISOString();

    const result = await db.run(
      sql`INSERT INTO discount_codes (
        code, description, discount_type, discount_value, currency,
        min_amount, max_uses, expires_at, user_id, created_at, updated_at
      ) VALUES (
        ${body.code}, ${body.description}, ${body.discount_type}, ${body.discount_value},
        ${body.currency || 'USD'}, ${body.min_amount || null}, ${body.max_uses || null},
        ${body.expires_at || null}, ${userId}, ${now}, ${now}
      )`
    );

    return new Response(JSON.stringify({ id: result.lastInsertRowid, ...body }), {
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
