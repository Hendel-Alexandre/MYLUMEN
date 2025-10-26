import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, invoices } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

const VALID_METHODS = ['card', 'interac', 'bank', 'cash', 'other'];

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const paymentId = parseInt(id);
      if (isNaN(paymentId)) {
        return jsonError('Valid ID is required', 400);
      }

      const payment = await db
        .select()
        .from(payments)
        .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
        .limit(1);

      if (payment.length === 0) {
        return jsonError('Payment not found', 404);
      }

      // Convert numeric strings to numbers for frontend
      const formattedPayment = {
        ...payment[0],
        amount: parseFloat(payment[0].amount as any) || 0
      };

      return jsonOk(formattedPayment);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const invoiceId = searchParams.get('invoiceId');
    const method = searchParams.get('method');

    let query = db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.processedAt));

    const conditions = [eq(payments.userId, userId)];

    if (invoiceId) {
      const invoiceIdInt = parseInt(invoiceId);
      if (!isNaN(invoiceIdInt)) {
        conditions.push(eq(payments.invoiceId, invoiceIdInt));
      }
    }

    if (method && VALID_METHODS.includes(method)) {
      conditions.push(eq(payments.method, method));
    }

    if (conditions.length > 1) {
      query = db
        .select()
        .from(payments)
        .where(and(...conditions))
        .orderBy(desc(payments.processedAt));
    }

    const results = await query.limit(limit).offset(offset);

    // Convert numeric strings to numbers for frontend
    const formattedResults = results.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount as any) || 0
    }));

    return jsonOk(formattedResults);
  } catch (error) {
    console.error('GET error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const body = await request.json();

    if (!body.invoiceId) {
      return jsonError('Invoice ID is required', 400);
    }

    if (!body.method) {
      return jsonError('Payment method is required', 400);
    }

    if (!VALID_METHODS.includes(body.method)) {
      return jsonError(`Method must be one of: ${VALID_METHODS.join(', ')}`, 400);
    }

    if (body.amount === undefined || body.amount === null) {
      return jsonError('Amount is required', 400);
    }

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return jsonError('Amount must be a positive number', 400);
    }

    if (!body.processedAt) {
      return jsonError('Processed date is required', 400);
    }

    try {
      const processedDate = new Date(body.processedAt);
      if (isNaN(processedDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      return jsonError('Processed date must be a valid ISO timestamp', 400);
    }

    const invoice = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, parseInt(body.invoiceId)),
          eq(invoices.userId, userId)
        )
      )
      .limit(1);

    if (invoice.length === 0) {
      return jsonError('Invoice not found', 404);
    }

    const now = new Date().toISOString();

    const newPayment = await db
      .insert(payments)
      .values({
        invoiceId: parseInt(body.invoiceId),
        userId: userId,
        method: body.method,
        amount: amount,
        currency: body.currency || 'USD',
        transactionRef: body.transactionRef || null,
        processedAt: body.processedAt,
        notes: body.notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return jsonOk(newPayment[0], 201);
  } catch (error) {
    console.error('POST error:', error);
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

    const paymentId = parseInt(id);

    const existingPayment = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
      .limit(1);

    if (existingPayment.length === 0) {
      return jsonError('Payment not found', 404);
    }

    const body = await request.json();

    if (body.method && !VALID_METHODS.includes(body.method)) {
      return jsonError(`Method must be one of: ${VALID_METHODS.join(', ')}`, 400);
    }

    if (body.amount !== undefined) {
      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return jsonError('Amount must be a positive number', 400);
      }
    }

    if (body.processedAt) {
      try {
        const processedDate = new Date(body.processedAt);
        if (isNaN(processedDate.getTime())) {
          throw new Error('Invalid date');
        }
      } catch {
        return jsonError('Processed date must be a valid ISO timestamp', 400);
      }
    }

    if (body.invoiceId) {
      const invoice = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.id, parseInt(body.invoiceId)),
            eq(invoices.userId, userId)
          )
        )
        .limit(1);

      if (invoice.length === 0) {
        return jsonError('Invoice not found', 404);
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.invoiceId !== undefined)
      updates.invoiceId = parseInt(body.invoiceId);
    if (body.method !== undefined) updates.method = body.method;
    if (body.amount !== undefined) updates.amount = parseFloat(body.amount);
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.transactionRef !== undefined)
      updates.transactionRef = body.transactionRef;
    if (body.processedAt !== undefined) updates.processedAt = body.processedAt;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updatedPayment = await db
      .update(payments)
      .set(updates)
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
      .returning();

    if (updatedPayment.length === 0) {
      return jsonError('Payment not found', 404);
    }

    return jsonOk(updatedPayment[0]);
  } catch (error) {
    console.error('PUT error:', error);
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

    const paymentId = parseInt(id);

    const existingPayment = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
      .limit(1);

    if (existingPayment.length === 0) {
      return jsonError('Payment not found', 404);
    }

    const deleted = await db
      .delete(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return jsonError('Payment not found', 404);
    }

    return jsonOk({
      message: 'Payment deleted successfully',
      payment: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}