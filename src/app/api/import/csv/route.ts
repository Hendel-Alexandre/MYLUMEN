import { db } from '@/db';
import { sql } from 'drizzle-orm';

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
    const { data_type, rows } = body;

    if (!data_type || !rows || !Array.isArray(rows)) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[]
    };

    const now = new Date().toISOString();

    for (const row of rows) {
      try {
        if (data_type === 'clients') {
          await db.run(
            sql`INSERT INTO clients (
              name, email, phone, company, address, country, user_id, created_at, updated_at
            ) VALUES (
              ${row.name}, ${row.email}, ${row.phone || null}, ${row.company || null},
              ${row.address || null}, ${row.country || null}, ${userId}, ${now}, ${now}
            )`
          );
        } else if (data_type === 'products') {
          await db.run(
            sql`INSERT INTO products (
              name, description, price, category, user_id, created_at, updated_at
            ) VALUES (
              ${row.name}, ${row.description || null}, ${row.price}, ${row.category || null},
              ${userId}, ${now}, ${now}
            )`
          );
        } else if (data_type === 'services') {
          await db.run(
            sql`INSERT INTO services (
              name, description, unit_price, currency, user_id, created_at, updated_at
            ) VALUES (
              ${row.name}, ${row.description || null}, ${row.unit_price},
              ${row.currency || 'USD'}, ${userId}, ${now}, ${now}
            )`
          );
        } else if (data_type === 'receipts') {
          await db.run(
            sql`INSERT INTO receipts (
              vendor, amount, category, date, notes, user_id, created_at, updated_at
            ) VALUES (
              ${row.vendor}, ${row.amount}, ${row.category}, ${row.date},
              ${row.notes || null}, ${userId}, ${now}, ${now}
            )`
          );
        }
        results.imported++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${results.imported + results.failed}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify(results), {
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
