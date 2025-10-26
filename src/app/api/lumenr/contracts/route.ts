import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts, clients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const contract = await db.select()
        .from(contracts)
        .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
        .limit(1);

      if (contract.length === 0) {
        return jsonError('Contract not found', 404);
      }

      // Convert numeric strings to numbers for frontend
      const formattedContract = {
        ...contract[0],
        value: contract[0].value !== null ? parseFloat(contract[0].value as any) : null
      };

      return jsonOk(formattedContract);
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const signed = searchParams.get('signed');

    let query = db.select()
      .from(contracts)
      .where(eq(contracts.userId, userId))
      .orderBy(desc(contracts.createdAt));

    // Apply signed filter if provided
    if (signed !== null) {
      const signedValue = signed === 'true';
      query = db.select()
        .from(contracts)
        .where(and(
          eq(contracts.userId, userId),
          eq(contracts.signedByClient, signedValue)
        ))
        .orderBy(desc(contracts.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

    // Convert numeric strings to numbers for frontend
    const formattedResults = results.map(contract => ({
      ...contract,
      value: contract.value !== null ? parseFloat(contract.value as any) : null
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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    // Validate required fields
    if (!body.clientId) {
      return jsonError('clientId is required', 400);
    }

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return jsonError('title is required and must be a non-empty string', 400);
    }

    if (!body.body || typeof body.body !== 'string' || body.body.trim() === '') {
      return jsonError('body is required and must be a non-empty string', 400);
    }

    // Validate clientId is a valid number
    if (isNaN(parseInt(body.clientId))) {
      return jsonError('clientId must be a valid integer', 400);
    }

    // Verify client exists and belongs to user
    const client = await db.select()
      .from(clients)
      .where(and(eq(clients.id, parseInt(body.clientId)), eq(clients.userId, userId)))
      .limit(1);

    if (client.length === 0) {
      return jsonError('Client not found or does not belong to user', 404);
    }

    const now = new Date().toISOString();

    // Prepare insert data
    const insertData = {
      clientId: parseInt(body.clientId),
      userId: userId,
      title: body.title.trim(),
      body: body.body.trim(),
      signedByClient: body.signedByClient ?? false,
      signedAt: body.signedAt ?? null,
      pdfUrl: body.pdfUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const newContract = await db.insert(contracts)
      .values(insertData)
      .returning();

    return jsonOk(newContract[0], 201);
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    // Check if contract exists and belongs to user
    const existingContract = await db.select()
      .from(contracts)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .limit(1);

    if (existingContract.length === 0) {
      return jsonError('Contract not found', 404);
    }

    // Validate fields if provided
    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
      return jsonError('title must be a non-empty string', 400);
    }

    if (body.body !== undefined && (typeof body.body !== 'string' || body.body.trim() === '')) {
      return jsonError('body must be a non-empty string', 400);
    }

    // Validate clientId if provided
    if (body.clientId !== undefined) {
      if (isNaN(parseInt(body.clientId))) {
        return jsonError('clientId must be a valid integer', 400);
      }

      // Verify client exists and belongs to user
      const client = await db.select()
        .from(clients)
        .where(and(eq(clients.id, parseInt(body.clientId)), eq(clients.userId, userId)))
        .limit(1);

      if (client.length === 0) {
        return jsonError('Client not found or does not belong to user', 404);
      }
    }

    const now = new Date().toISOString();

    // Prepare update data
    const updates: Record<string, any> = {
      updatedAt: now,
    };

    if (body.clientId !== undefined) {
      updates.clientId = parseInt(body.clientId);
    }

    if (body.title !== undefined) {
      updates.title = body.title.trim();
    }

    if (body.body !== undefined) {
      updates.body = body.body.trim();
    }

    if (body.pdfUrl !== undefined) {
      updates.pdfUrl = body.pdfUrl;
    }

    if (body.signedByClient !== undefined) {
      updates.signedByClient = body.signedByClient;
      
      // If signedByClient is set to true and signedAt is null, set signedAt to current timestamp
      if (body.signedByClient === true && existingContract[0].signedAt === null && body.signedAt === undefined) {
        updates.signedAt = now;
      }
    }

    if (body.signedAt !== undefined) {
      updates.signedAt = body.signedAt;
    }

    const updatedContract = await db.update(contracts)
      .set(updates)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .returning();

    if (updatedContract.length === 0) {
      return jsonError('Contract not found', 404);
    }

    return jsonOk(updatedContract[0]);
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    // Check if contract exists and belongs to user
    const existingContract = await db.select()
      .from(contracts)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .limit(1);

    if (existingContract.length === 0) {
      return jsonError('Contract not found', 404);
    }

    const deleted = await db.delete(contracts)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return jsonError('Contract not found', 404);
    }

    return jsonOk({ 
      message: 'Contract deleted successfully',
      contract: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}