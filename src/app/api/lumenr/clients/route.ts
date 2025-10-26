import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured, getDatabaseError } from '@/db';
import { clients } from '@/db/schema';
import { eq, and, desc, or, like } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

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

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const client = await db.select()
        .from(clients)
        .where(and(
          eq(clients.id, parseInt(id)),
          eq(clients.userId, userId)
        ))
        .limit(1);

      if (client.length === 0) {
        return jsonError('Client not found', 404);
      }

      return jsonOk(client[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));

    if (search) {
      const searchTerm = `%${search}%`;
      query = db.select()
        .from(clients)
        .where(and(
          eq(clients.userId, userId),
          or(
            like(clients.name, searchTerm),
            like(clients.email, searchTerm),
            like(clients.company, searchTerm)
          )
        ))
        .orderBy(desc(clients.createdAt));
    }

    const results = await query.limit(limit).offset(offset);
    
    console.log(`[DEBUG /api/lumenr/clients GET] Returning ${results.length} clients for user ${userId}`);

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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const { name, email, phone, company, taxId, address, country } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return jsonError('Name is required', 400);
    }

    if (!email || !email.trim()) {
      return jsonError('Email is required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError('Invalid email format', 400);
    }

    const now = new Date().toISOString();

    const newClient = await db.insert(clients)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        taxId: taxId?.trim() || null,
        address: address?.trim() || null,
        country: country?.trim() || null,
        userId,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return jsonOk(newClient[0], 201);
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

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    // Check if client exists and belongs to user
    const existingClient = await db.select()
      .from(clients)
      .where(and(
        eq(clients.id, parseInt(id)),
        eq(clients.userId, userId)
      ))
      .limit(1);

    if (existingClient.length === 0) {
      return jsonError('Client not found', 404);
    }

    const { name, email, phone, company, taxId, address, country } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return jsonError('Invalid email format', 400);
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (company !== undefined) updates.company = company?.trim() || null;
    if (taxId !== undefined) updates.taxId = taxId?.trim() || null;
    if (address !== undefined) updates.address = address?.trim() || null;
    if (country !== undefined) updates.country = country?.trim() || null;

    const updatedClient = await db.update(clients)
      .set(updates)
      .where(and(
        eq(clients.id, parseInt(id)),
        eq(clients.userId, userId)
      ))
      .returning();

    if (updatedClient.length === 0) {
      return jsonError('Client not found', 404);
    }

    return jsonOk(updatedClient[0]);
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

    // Check if client exists and belongs to user
    const existingClient = await db.select()
      .from(clients)
      .where(and(
        eq(clients.id, parseInt(id)),
        eq(clients.userId, userId)
      ))
      .limit(1);

    if (existingClient.length === 0) {
      return jsonError('Client not found', 404);
    }

    const deleted = await db.delete(clients)
      .where(and(
        eq(clients.id, parseInt(id)),
        eq(clients.userId, userId)
      ))
      .returning();

    if (deleted.length === 0) {
      return jsonError('Client not found', 404);
    }

    return jsonOk({
      message: 'Client deleted successfully',
      client: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}