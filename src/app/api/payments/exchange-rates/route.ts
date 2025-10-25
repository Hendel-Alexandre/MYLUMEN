import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const base = url.searchParams.get('base') || 'USD';
    const target = url.searchParams.get('target');

    if (target) {
      // Get specific rate
      const rate = await db.get(
        sql`SELECT * FROM exchange_rates 
            WHERE base_currency = ${base} AND target_currency = ${target}
            ORDER BY updated_at DESC LIMIT 1`
      );

      if (rate) {
        return new Response(JSON.stringify(rate), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Fetch from external API if not in cache
      const externalRate = await fetchExchangeRate(base, target);
      return new Response(JSON.stringify(externalRate), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all rates for base currency
    const rates = await db.all(
      sql`SELECT * FROM exchange_rates WHERE base_currency = ${base}`
    );

    return new Response(JSON.stringify(rates), {
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

async function fetchExchangeRate(base: string, target: string) {
  try {
    // Using exchangerate-api.com (free tier)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`
    );
    const data = await response.json();
    const rate = data.rates[target];
    const now = new Date().toISOString();

    // Cache the rate
    await db.run(
      sql`INSERT OR REPLACE INTO exchange_rates (base_currency, target_currency, rate, updated_at)
          VALUES (${base}, ${target}, ${rate}, ${now})`
    );

    return {
      base_currency: base,
      target_currency: target,
      rate,
      updated_at: now
    };
  } catch (error) {
    throw new Error('Failed to fetch exchange rate');
  }
}
