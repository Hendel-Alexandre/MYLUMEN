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

    const widgets = await db.all(
      sql`SELECT * FROM payment_widgets WHERE user_id = ${userId} ORDER BY created_at DESC`
    );

    return new Response(JSON.stringify(widgets), {
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate embed code
    const widgetId = `widget_${Date.now()}`;
    const embedCode = `<div id="${widgetId}" data-lumenr-widget="${widgetId}"></div>
<script src="${appUrl}/widgets.js"></script>
<script>
  LumenR.init({
    widgetId: '${widgetId}',
    amount: ${body.amount},
    currency: '${body.currency || 'USD'}',
    description: '${body.description || ''}',
    successUrl: '${body.success_url || ''}',
    cancelUrl: '${body.cancel_url || ''}'
  });
</script>`;

    const result = await db.run(
      sql`INSERT INTO payment_widgets (
        user_id, name, description, amount, currency,
        success_url, cancel_url, embed_code, created_at, updated_at
      ) VALUES (
        ${userId}, ${body.name}, ${body.description}, ${body.amount},
        ${body.currency || 'USD'}, ${body.success_url || null},
        ${body.cancel_url || null}, ${embedCode}, ${now}, ${now}
      )`
    );

    return new Response(JSON.stringify({
      id: result.lastInsertRowid,
      ...body,
      embed_code: embedCode
    }), {
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