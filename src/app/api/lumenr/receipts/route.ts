import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { receipts } from '@/db/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const receiptId = parseInt(id);
      if (isNaN(receiptId)) {
        return jsonError('Valid ID is required', 400);
      }

      const receipt = await db
        .select()
        .from(receipts)
        .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
        .limit(1);

      if (receipt.length === 0) {
        return jsonError('Receipt not found', 404);
      }

      return jsonOk(receipt[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let conditions = [eq(receipts.userId, userId)];

    if (category) {
      conditions.push(eq(receipts.category, category));
    }

    if (startDate) {
      if (!isValidDateFormat(startDate)) {
        return jsonError('Invalid startDate format. Use YYYY-MM-DD', 400);
      }
      conditions.push(gte(receipts.date, startDate));
    }

    if (endDate) {
      if (!isValidDateFormat(endDate)) {
        return jsonError('Invalid endDate format. Use YYYY-MM-DD', 400);
      }
      conditions.push(lte(receipts.date, endDate));
    }

    const results = await db
      .select()
      .from(receipts)
      .where(and(...conditions))
      .orderBy(desc(receipts.date))
      .limit(limit)
      .offset(offset);

    return jsonOk(results);
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
    const { vendor, amount, category, date, fileUrl, notes } = body;

    if (!vendor || !vendor.trim()) {
      return jsonError('Vendor is required', 400);
    }

    if (amount === undefined || amount === null) {
      return jsonError('Amount is required', 400);
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return jsonError('Amount must be a positive number', 400);
    }

    if (!category || !category.trim()) {
      return jsonError('Category is required', 400);
    }

    if (!date || !date.trim()) {
      return jsonError('Date is required', 400);
    }

    if (!isValidDateFormat(date)) {
      return jsonError('Date must be in YYYY-MM-DD format', 400);
    }

    const now = new Date().toISOString();

    const newReceipt = await db
      .insert(receipts)
      .values({
        vendor: vendor.trim(),
        amount: parsedAmount,
        category: category.trim(),
        date: date.trim(),
        fileUrl: fileUrl?.trim() || null,
        notes: notes?.trim() || null,
        userId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return jsonOk(newReceipt[0], 201);
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

    const receiptId = parseInt(id);

    const existing = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return jsonError('Receipt not found', 404);
    }

    const body = await request.json();
    const { vendor, amount, category, date, fileUrl, notes } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (vendor !== undefined) {
      if (!vendor || !vendor.trim()) {
        return jsonError('Vendor cannot be empty', 400);
      }
      updates.vendor = vendor.trim();
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return jsonError('Amount must be a positive number', 400);
      }
      updates.amount = parsedAmount;
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return jsonError('Category cannot be empty', 400);
      }
      updates.category = category.trim();
    }

    if (date !== undefined) {
      if (!date || !date.trim()) {
        return jsonError('Date cannot be empty', 400);
      }
      if (!isValidDateFormat(date)) {
        return jsonError('Date must be in YYYY-MM-DD format', 400);
      }
      updates.date = date.trim();
    }

    if (fileUrl !== undefined) {
      updates.fileUrl = fileUrl?.trim() || null;
    }

    if (notes !== undefined) {
      updates.notes = notes?.trim() || null;
    }

    const updated = await db
      .update(receipts)
      .set(updates)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return jsonError('Receipt not found', 404);
    }

    return jsonOk(updated[0]);
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

    const receiptId = parseInt(id);

    const existing = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return jsonError('Receipt not found', 404);
    }

    const deleted = await db
      .delete(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return jsonError('Receipt not found', 404);
    }

    return jsonOk({
      message: 'Receipt deleted successfully',
      receipt: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}