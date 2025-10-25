import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    // Extract and validate invoice ID from path parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid invoice ID is required', 400);
    }

    const invoiceId = parseInt(id);

    // Parse request body for optional paidAt
    let requestBody: { paidAt?: string } = {};
    try {
      const text = await request.text();
      if (text) {
        requestBody = JSON.parse(text);
      }
    } catch (error) {
      return jsonError('Invalid JSON in request body', 400);
    }

    // Validate paidAt if provided
    let paidAtTimestamp = new Date().toISOString();
    if (requestBody.paidAt) {
      try {
        const paidAtDate = new Date(requestBody.paidAt);
        if (isNaN(paidAtDate.getTime())) {
          return jsonError('Invalid paidAt timestamp format', 400);
        }
        paidAtTimestamp = paidAtDate.toISOString();
      } catch (error) {
        return jsonError('Invalid paidAt timestamp format', 400);
      }
    }

    // Fetch the invoice and verify it belongs to the user
    const existingInvoice = await db.select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, invoiceId),
          eq(invoices.userId, userId)
        )
      )
      .limit(1);

    if (existingInvoice.length === 0) {
      return jsonError('Invoice not found', 404);
    }

    const invoice = existingInvoice[0];

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return jsonError('Invoice is already paid', 400);
    }

    // Update the invoice to mark it as paid
    const updatedInvoice = await db.update(invoices)
      .set({
        status: 'paid',
        paidAt: paidAtTimestamp,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(invoices.id, invoiceId),
          eq(invoices.userId, userId)
        )
      )
      .returning();

    if (updatedInvoice.length === 0) {
      return jsonError('Failed to update invoice', 500);
    }

    return jsonOk(updatedInvoice[0]);

  } catch (error) {
    console.error('POST error:', error);
    return jsonError('Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'), 500);
  }
}