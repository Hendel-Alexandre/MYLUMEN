import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { receipts } from '@/db/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';
import { supabase } from '@/integrations/supabase/client';

function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

async function getSignedUrlFromPath(imagePath: string | null): Promise<string | null> {
  if (!imagePath || !supabase) return null;
  
  // Extract the storage path from either a full URL or just the path
  let storagePath = imagePath;
  
  // If it's a full URL, extract just the path part
  if (imagePath.includes('/storage/v1/object/')) {
    const pathMatch = imagePath.match(/\/receipts\/(.+?)(?:\?|$)/);
    if (pathMatch) {
      storagePath = pathMatch[1];
    }
  } else if (imagePath.includes('/receipts/')) {
    const pathMatch = imagePath.match(/\/receipts\/(.+?)(?:\?|$)/);
    if (pathMatch) {
      storagePath = pathMatch[1];
    }
  }
  
  // Remove bucket name if it's included
  if (storagePath.startsWith('receipts/')) {
    storagePath = storagePath.substring('receipts/'.length);
  }
  
  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(storagePath, 31536000); // 1 year
      
    if (error) {
      console.error('[Receipts API] Error generating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('[Receipts API] Exception generating signed URL:', error);
    return null;
  }
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

      // Convert numeric strings to numbers and refresh signed URL
      const signedUrl = await getSignedUrlFromPath(receipt[0].imageUrl);
      const formattedReceipt = {
        ...receipt[0],
        amount: parseFloat(receipt[0].amount as any) || 0,
        imageUrl: signedUrl || receipt[0].imageUrl // Use fresh signed URL if available
      };

      return jsonOk(formattedReceipt);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'expense' or 'client'
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [eq(receipts.userId, userId)];

    if (type && (type === 'expense' || type === 'client')) {
      conditions.push(eq(receipts.type, type));
    }

    if (clientId) {
      const clientIdInt = parseInt(clientId);
      if (!isNaN(clientIdInt)) {
        conditions.push(eq(receipts.clientId, clientIdInt));
      }
    }

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

    // Convert numeric strings to numbers and refresh signed URLs for frontend
    const formattedResults = await Promise.all(results.map(async (receipt) => {
      const signedUrl = await getSignedUrlFromPath(receipt.imageUrl);
      return {
        ...receipt,
        amount: parseFloat(receipt.amount as any) || 0,
        imageUrl: signedUrl || receipt.imageUrl // Use fresh signed URL if available
      };
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
    const { vendor, amount, category, date, type, clientId, imageUrl, notes } = body;

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

    // Validate type if provided
    const receiptType = type?.trim() || 'expense';
    if (receiptType !== 'expense' && receiptType !== 'client') {
      return jsonError('Type must be "expense" or "client"', 400);
    }

    // Validate clientId if type is client
    let parsedClientId = null;
    if (receiptType === 'client') {
      if (!clientId) {
        return jsonError('Client ID is required for client receipts', 400);
      }
      parsedClientId = parseInt(clientId);
      if (isNaN(parsedClientId)) {
        return jsonError('Client ID must be a valid number', 400);
      }
    }

    const now = new Date().toISOString();

    const newReceipt = await db
      .insert(receipts)
      .values({
        vendor: vendor.trim(),
        amount: parsedAmount.toString(),
        category: category.trim(),
        date: date.trim(),
        type: receiptType,
        clientId: parsedClientId,
        imageUrl: imageUrl?.trim() || null,
        notes: notes?.trim() || null,
        userId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Convert numeric strings to numbers for frontend
    const formattedReceipt = {
      ...newReceipt[0],
      amount: parseFloat(newReceipt[0].amount as any) || 0
    };

    return jsonOk(formattedReceipt, 201);
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
    const { vendor, amount, category, date, type, clientId, imageUrl, notes } = body;

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
      updates.amount = parsedAmount.toString();
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

    if (type !== undefined) {
      const receiptType = type.trim();
      if (receiptType !== 'expense' && receiptType !== 'client') {
        return jsonError('Type must be "expense" or "client"', 400);
      }
      updates.type = receiptType;

      // If changing to client type, clientId is required
      if (receiptType === 'client' && clientId === undefined && !existing[0].clientId) {
        return jsonError('Client ID is required for client receipts', 400);
      }
    }

    if (clientId !== undefined) {
      if (clientId === null) {
        updates.clientId = null;
      } else {
        const parsedClientId = parseInt(clientId);
        if (isNaN(parsedClientId)) {
          return jsonError('Client ID must be a valid number', 400);
        }
        updates.clientId = parsedClientId;
      }
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl?.trim() || null;
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

    // Convert numeric strings to numbers for frontend
    const formattedReceipt = {
      ...updated[0],
      amount: parseFloat(updated[0].amount as any) || 0
    };

    return jsonOk(formattedReceipt);
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