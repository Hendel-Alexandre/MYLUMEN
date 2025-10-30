import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { receipts } from '@/db/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';

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
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const receiptId = parseInt(id);
      if (isNaN(receiptId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const receipt = await db
        .select()
        .from(receipts)
        .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
        .limit(1);

      if (receipt.length === 0) {
        return NextResponse.json(
          { error: 'Receipt not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(receipt[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [eq(receipts.userId, userId)];

    if (category) {
      conditions.push(eq(receipts.category, category));
    }

    if (startDate) {
      if (!isValidDateFormat(startDate)) {
        return NextResponse.json(
          { error: 'Invalid startDate format. Use YYYY-MM-DD', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
      conditions.push(gte(receipts.date, startDate));
    }

    if (endDate) {
      if (!isValidDateFormat(endDate)) {
        return NextResponse.json(
          { error: 'Invalid endDate format. Use YYYY-MM-DD', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
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

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { vendor, amount, category, date, fileUrl, notes } = body;

    if (!vendor || !vendor.trim()) {
      return NextResponse.json(
        { error: 'Vendor is required', code: 'MISSING_VENDOR' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (!date || !date.trim()) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!isValidDateFormat(date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format', code: 'INVALID_DATE_FORMAT' },
        { status: 400 }
      );
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

    return NextResponse.json(newReceipt[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const receiptId = parseInt(id);

    const existing = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Receipt not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { vendor, amount, category, date, fileUrl, notes } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (vendor !== undefined) {
      if (!vendor || !vendor.trim()) {
        return NextResponse.json(
          { error: 'Vendor cannot be empty', code: 'INVALID_VENDOR' },
          { status: 400 }
        );
      }
      updates.vendor = vendor.trim();
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      updates.amount = parsedAmount;
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return NextResponse.json(
          { error: 'Category cannot be empty', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updates.category = category.trim();
    }

    if (date !== undefined) {
      if (!date || !date.trim()) {
        return NextResponse.json(
          { error: 'Date cannot be empty', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
      if (!isValidDateFormat(date)) {
        return NextResponse.json(
          { error: 'Date must be in YYYY-MM-DD format', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
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
      return NextResponse.json(
        { error: 'Receipt not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const receiptId = parseInt(id);

    const existing = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Receipt not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Receipt not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Receipt deleted successfully',
        receipt: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
