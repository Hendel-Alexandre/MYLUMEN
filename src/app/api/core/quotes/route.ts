import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quotes, clients } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

const VALID_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const quote = await db.select()
        .from(quotes)
        .where(and(
          eq(quotes.id, parseInt(id)),
          eq(quotes.userId, userId)
        ))
        .limit(1);

      if (quote.length === 0) {
        return jsonError('Quote not found', 404);
      }

      return jsonOk(quote[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let conditions = [eq(quotes.userId, userId)];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return jsonError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
      }
      conditions.push(eq(quotes.status, status));
    }

    let query = db.select({
      id: quotes.id,
      clientId: quotes.clientId,
      userId: quotes.userId,
      items: quotes.items,
      subtotal: quotes.subtotal,
      tax: quotes.tax,
      total: quotes.total,
      status: quotes.status,
      pdfUrl: quotes.pdfUrl,
      notes: quotes.notes,
      createdAt: quotes.createdAt,
      updatedAt: quotes.updatedAt,
      clientName: clients.name,
      clientEmail: clients.email,
      clientCompany: clients.company,
    })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    let filteredResults = results;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResults = results.filter(quote => 
        quote.clientName?.toLowerCase().includes(searchLower) ||
        quote.clientCompany?.toLowerCase().includes(searchLower) ||
        quote.clientEmail?.toLowerCase().includes(searchLower)
      );
    }

    return jsonOk(filteredResults);

  } catch (error) {
    console.error('[API ERROR /api/core/quotes GET]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const bodyText = await request.text();
    console.log('[DEBUG /api/core/quotes POST] Raw request body:', bodyText);

    const body = JSON.parse(bodyText || '{}');

    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const { clientId, items, subtotal, tax, total, status, pdfUrl, notes } = body;

    if (!clientId) {
      return jsonError('Client ID is required', 400);
    }

    if (!items) {
      return jsonError('Items are required', 400);
    }

    if (subtotal === undefined || subtotal === null) {
      return jsonError('Subtotal is required', 400);
    }

    if (tax === undefined || tax === null) {
      return jsonError('Tax is required', 400);
    }

    if (total === undefined || total === null) {
      return jsonError('Total is required', 400);
    }

    if (!Array.isArray(items)) {
      return jsonError('Items must be a valid JSON array', 400);
    }

    for (const item of items) {
      if (!item.service_id || item.quantity === undefined || item.unit_price === undefined || item.total === undefined) {
        return jsonError('Each item must have service_id, quantity, unit_price, and total', 400);
      }
    }

    if (subtotal < 0) {
      return jsonError('Subtotal must be a positive number', 400);
    }

    if (tax < 0) {
      return jsonError('Tax must be a positive number', 400);
    }

    if (total < 0) {
      return jsonError('Total must be a positive number', 400);
    }

    const quoteStatus = status || 'draft';
    if (!VALID_STATUSES.includes(quoteStatus)) {
      return jsonError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const client = await db.select()
      .from(clients)
      .where(and(
        eq(clients.id, parseInt(clientId)),
        eq(clients.userId, userId)
      ))
      .limit(1);

    if (client.length === 0) {
      return jsonError('Client not found or does not belong to user', 404);
    }

    const now = new Date().toISOString();

    const newQuote = await db.insert(quotes)
      .values({
        clientId: parseInt(clientId),
        userId,
        items: JSON.stringify(items),
        subtotal,
        tax,
        total,
        status: quoteStatus,
        pdfUrl: pdfUrl || null,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return jsonOk(newQuote[0], 201);

  } catch (error) {
    console.error('[API ERROR /api/core/quotes POST]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const bodyText = await request.text();
    console.log('[DEBUG /api/core/quotes PUT] Raw request body:', bodyText);

    const body = JSON.parse(bodyText || '{}');

    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const existingQuote = await db.select()
      .from(quotes)
      .where(and(
        eq(quotes.id, parseInt(id)),
        eq(quotes.userId, userId)
      ))
      .limit(1);

    if (existingQuote.length === 0) {
      return jsonError('Quote not found', 404);
    }

    const { clientId, items, subtotal, tax, total, status, pdfUrl, notes } = body;

    if (clientId) {
      const client = await db.select()
        .from(clients)
        .where(and(
          eq(clients.id, parseInt(clientId)),
          eq(clients.userId, userId)
        ))
        .limit(1);

      if (client.length === 0) {
        return jsonError('Client not found or does not belong to user', 404);
      }
    }

    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return jsonError('Items must be a valid JSON array', 400);
      }

      for (const item of items) {
        if (!item.service_id || item.quantity === undefined || item.unit_price === undefined || item.total === undefined) {
          return jsonError('Each item must have service_id, quantity, unit_price, and total', 400);
        }
      }
    }

    if (subtotal !== undefined && subtotal < 0) {
      return jsonError('Subtotal must be a positive number', 400);
    }

    if (tax !== undefined && tax < 0) {
      return jsonError('Tax must be a positive number', 400);
    }

    if (total !== undefined && total < 0) {
      return jsonError('Total must be a positive number', 400);
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return jsonError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (clientId !== undefined) updates.clientId = parseInt(clientId);
    if (items !== undefined) updates.items = JSON.stringify(items);
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (tax !== undefined) updates.tax = tax;
    if (total !== undefined) updates.total = total;
    if (status !== undefined) updates.status = status;
    if (pdfUrl !== undefined) updates.pdfUrl = pdfUrl;
    if (notes !== undefined) updates.notes = notes;

    const updated = await db.update(quotes)
      .set(updates)
      .where(and(
        eq(quotes.id, parseInt(id)),
        eq(quotes.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return jsonError('Quote not found', 404);
    }

    return jsonOk(updated[0]);

  } catch (error) {
    console.error('[API ERROR /api/core/quotes PUT]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const existingQuote = await db.select()
      .from(quotes)
      .where(and(
        eq(quotes.id, parseInt(id)),
        eq(quotes.userId, userId)
      ))
      .limit(1);

    if (existingQuote.length === 0) {
      return jsonError('Quote not found', 404);
    }

    const deleted = await db.delete(quotes)
      .where(and(
        eq(quotes.id, parseInt(id)),
        eq(quotes.userId, userId)
      ))
      .returning();

    if (deleted.length === 0) {
      return jsonError('Quote not found', 404);
    }

    return jsonOk({ 
      message: 'Quote deleted successfully',
      quote: deleted[0] 
    });

  } catch (error) {
    console.error('[API ERROR /api/core/quotes DELETE]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}