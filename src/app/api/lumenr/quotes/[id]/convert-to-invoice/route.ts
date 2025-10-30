import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quotes, invoices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { id } = await params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid quote ID is required', 400);
    }

    // Fetch the quote by ID and verify it belongs to the user
    const quote = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, parseInt(id)), eq(quotes.userId, userId)))
      .limit(1);

    if (quote.length === 0) {
      return jsonError('Quote not found', 404);
    }

    const quoteData = quote[0];

    // Verify quote status is 'accepted'
    if (quoteData.status !== 'accepted') {
      return jsonError('Only accepted quotes can be converted to invoices', 400);
    }

    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create new invoice with quote data
    const newInvoice = await db
      .insert(invoices)
      .values({
        quoteId: quoteData.id,
        clientId: quoteData.clientId,
        userId: quoteData.userId,
        items: quoteData.items,
        subtotal: quoteData.subtotal,
        tax: quoteData.tax,
        total: quoteData.total,
        status: 'unpaid',
        depositRequired: false,
        depositAmount: null,
        paidAt: null,
        pdfUrl: null,
        dueDate: dueDate.toISOString(),
        notes: quoteData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return jsonOk(newInvoice[0], 201);
  } catch (error) {
    console.error('POST error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}