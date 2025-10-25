import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured, getDatabaseError } from '@/db';
import { invoices, clients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

const VALID_STATUSES = ['unpaid', 'partially_paid', 'paid', 'cancelled', 'overdue'];

export async function GET(request: NextRequest) {
  try {
    // Check database configuration first
    if (!isDatabaseConfigured()) {
      return jsonError(
        `Database not configured: ${getDatabaseError()}`,
        503
      );
    }

    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, parseInt(id)), eq(invoices.userId, userId)))
        .limit(1);

      if (invoice.length === 0) {
        return jsonError('Invoice not found', 404);
      }

      return jsonOk(invoice[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return jsonError('Invalid status value', 400);
      }

      query = db
        .select()
        .from(invoices)
        .where(and(eq(invoices.userId, userId), eq(invoices.status, status)))
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const results = await query;

    return jsonOk(results);
  } catch (error) {
    console.error('[API ERROR /api/lumenr/invoices GET]', error);
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
    console.log('[DEBUG /api/lumenr/invoices POST] Raw request body:', bodyText);

    const body = JSON.parse(bodyText || '{}');

    if (!body.clientId) {
      return jsonError('clientId is required', 400);
    }

    if (!body.items) {
      return jsonError('items is required', 400);
    }

    if (!Array.isArray(body.items)) {
      return jsonError('items must be a valid JSON array', 400);
    }

    if (body.subtotal === undefined || body.subtotal === null) {
      return jsonError('subtotal is required', 400);
    }

    if (body.tax === undefined || body.tax === null) {
      return jsonError('tax is required', 400);
    }

    if (body.total === undefined || body.total === null) {
      return jsonError('total is required', 400);
    }

    if (body.subtotal < 0) {
      return jsonError('subtotal must be a positive number', 400);
    }

    if (body.tax < 0) {
      return jsonError('tax must be a positive number', 400);
    }

    if (body.total < 0) {
      return jsonError('total must be a positive number', 400);
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return jsonError('status must be one of: unpaid, partially_paid, paid, cancelled, overdue', 400);
    }

    if (body.depositRequired && !body.depositAmount) {
      return jsonError('depositAmount is required when depositRequired is true', 400);
    }

    if (body.depositAmount && body.depositAmount < 0) {
      return jsonError('depositAmount must be a positive number', 400);
    }

    const client = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, body.clientId), eq(clients.userId, userId)))
      .limit(1);

    if (client.length === 0) {
      return jsonError('Client not found or does not belong to user', 404);
    }

    const now = new Date().toISOString();

    const newInvoice = await db
      .insert(invoices)
      .values({
        quoteId: body.quoteId || null,
        clientId: body.clientId,
        userId: userId,
        items: body.items,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        depositRequired: body.depositRequired ?? false,
        depositAmount: body.depositAmount || null,
        status: body.status || 'unpaid',
        paidAt: body.paidAt || null,
        pdfUrl: body.pdfUrl || null,
        dueDate: body.dueDate || null,
        notes: body.notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return jsonOk(newInvoice[0], 201);
  } catch (error) {
    console.error('[API ERROR /api/lumenr/invoices POST]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const bodyText = await request.text();
    console.log('[DEBUG /api/lumenr/invoices PUT] Raw request body:', bodyText);

    const body = JSON.parse(bodyText || '{}');

    const existing = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, parseInt(id)), eq(invoices.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return jsonError('Invoice not found', 404);
    }

    if (body.items && !Array.isArray(body.items)) {
      return jsonError('items must be a valid JSON array', 400);
    }

    if (body.subtotal !== undefined && body.subtotal < 0) {
      return jsonError('subtotal must be a positive number', 400);
    }

    if (body.tax !== undefined && body.tax < 0) {
      return jsonError('tax must be a positive number', 400);
    }

    if (body.total !== undefined && body.total < 0) {
      return jsonError('total must be a positive number', 400);
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return jsonError('status must be one of: unpaid, partially_paid, paid, cancelled, overdue', 400);
    }

    if (body.depositRequired && !body.depositAmount && !existing[0].depositAmount) {
      return jsonError('depositAmount is required when depositRequired is true', 400);
    }

    if (body.depositAmount !== undefined && body.depositAmount < 0) {
      return jsonError('depositAmount must be a positive number', 400);
    }

    if (body.clientId) {
      const client = await db
        .select()
        .from(clients)
        .where(and(eq(clients.id, body.clientId), eq(clients.userId, userId)))
        .limit(1);

      if (client.length === 0) {
        return jsonError('Client not found or does not belong to user', 404);
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.quoteId !== undefined) updateData.quoteId = body.quoteId;
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.items !== undefined) updateData.items = body.items;
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal;
    if (body.tax !== undefined) updateData.tax = body.tax;
    if (body.total !== undefined) updateData.total = body.total;
    if (body.depositRequired !== undefined) updateData.depositRequired = body.depositRequired;
    if (body.depositAmount !== undefined) updateData.depositAmount = body.depositAmount;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paidAt !== undefined) updateData.paidAt = body.paidAt;
    if (body.pdfUrl !== undefined) updateData.pdfUrl = body.pdfUrl;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await db
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.id, parseInt(id)), eq(invoices.userId, userId)))
      .returning();

    return jsonOk(updated[0]);
  } catch (error) {
    console.error('[API ERROR /api/lumenr/invoices PUT]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const existing = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, parseInt(id)), eq(invoices.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return jsonError('Invoice not found', 404);
    }

    const deleted = await db
      .delete(invoices)
      .where(and(eq(invoices.id, parseInt(id)), eq(invoices.userId, userId)))
      .returning();

    return jsonOk({
      message: 'Invoice deleted successfully',
      invoice: deleted[0],
    });
  } catch (error) {
    console.error('[API ERROR /api/lumenr/invoices DELETE]', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}