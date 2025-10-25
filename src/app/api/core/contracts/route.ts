import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts, clients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const contract = await db.select()
        .from(contracts)
        .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
        .limit(1);

      if (contract.length === 0) {
        return NextResponse.json({ 
          error: 'Contract not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(contract[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const signed = searchParams.get('signed');

    let query = db.select()
      .from(contracts)
      .where(eq(contracts.userId, userId))
      .orderBy(desc(contracts.createdAt));

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

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    if (!body.clientId) {
      return NextResponse.json({ 
        error: "clientId is required",
        code: "MISSING_CLIENT_ID" 
      }, { status: 400 });
    }

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ 
        error: "title is required and must be a non-empty string",
        code: "INVALID_TITLE" 
      }, { status: 400 });
    }

    if (!body.body || typeof body.body !== 'string' || body.body.trim() === '') {
      return NextResponse.json({ 
        error: "body is required and must be a non-empty string",
        code: "INVALID_BODY" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(body.clientId))) {
      return NextResponse.json({ 
        error: "clientId must be a valid integer",
        code: "INVALID_CLIENT_ID" 
      }, { status: 400 });
    }

    const client = await db.select()
      .from(clients)
      .where(and(eq(clients.id, parseInt(body.clientId)), eq(clients.userId, userId)))
      .limit(1);

    if (client.length === 0) {
      return NextResponse.json({ 
        error: "Client not found or does not belong to user",
        code: "CLIENT_NOT_FOUND" 
      }, { status: 404 });
    }

    const now = new Date().toISOString();

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

    return NextResponse.json(newContract[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingContract = await db.select()
      .from(contracts)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .limit(1);

    if (existingContract.length === 0) {
      return NextResponse.json({ 
        error: 'Contract not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
      return NextResponse.json({ 
        error: "title must be a non-empty string",
        code: "INVALID_TITLE" 
      }, { status: 400 });
    }

    if (body.body !== undefined && (typeof body.body !== 'string' || body.body.trim() === '')) {
      return NextResponse.json({ 
        error: "body must be a non-empty string",
        code: "INVALID_BODY" 
      }, { status: 400 });
    }

    if (body.clientId !== undefined) {
      if (isNaN(parseInt(body.clientId))) {
        return NextResponse.json({ 
          error: "clientId must be a valid integer",
          code: "INVALID_CLIENT_ID" 
        }, { status: 400 });
      }

      const client = await db.select()
        .from(clients)
        .where(and(eq(clients.id, parseInt(body.clientId)), eq(clients.userId, userId)))
        .limit(1);

      if (client.length === 0) {
        return NextResponse.json({ 
          error: "Client not found or does not belong to user",
          code: "CLIENT_NOT_FOUND" 
        }, { status: 404 });
      }
    }

    const now = new Date().toISOString();

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
      return NextResponse.json({ 
        error: 'Contract not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(updatedContract[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existingContract = await db.select()
      .from(contracts)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .limit(1);

    if (existingContract.length === 0) {
      return NextResponse.json({ 
        error: 'Contract not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(contracts)
      .where(and(eq(contracts.id, parseInt(id)), eq(contracts.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Contract not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Contract deleted successfully',
      contract: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
