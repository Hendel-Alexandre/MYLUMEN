import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq, like, or, and, asc } from 'drizzle-orm';
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

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const service = await db
        .select()
        .from(services)
        .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
        .limit(1);

      if (service.length === 0) {
        return jsonError('Service not found', 404);
      }

      return jsonOk(service[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(services).where(eq(services.userId, userId));

    if (search) {
      const searchCondition = or(
        like(services.name, `%${search}%`),
        like(services.description, `%${search}%`)
      );

      query = db
        .select()
        .from(services)
        .where(and(eq(services.userId, userId), searchCondition));
    }

    const results = await query
      .orderBy(asc(services.name))
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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const { name, description, unitPrice, currency, category, duration, active } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return jsonError('Name is required', 400);
    }

    if (unitPrice === undefined || unitPrice === null) {
      return jsonError('Unit price is required', 400);
    }

    // Validate unitPrice is a positive number
    const parsedPrice = parseFloat(unitPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return jsonError('Unit price must be a positive number', 400);
    }

    // Validate and parse duration if provided
    let parsedDuration = null;
    if (duration !== undefined && duration !== null) {
      const durationNum = parseInt(duration);
      if (isNaN(durationNum) || durationNum <= 0 || !Number.isInteger(Number(duration))) {
        return jsonError('Duration must be a positive integer', 400);
      }
      parsedDuration = durationNum;
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      unitPrice: parsedPrice,
      currency: currency || 'USD',
      category: category || null,
      duration: parsedDuration,
      active: active !== undefined ? active : true,
      userId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const newService = await db.insert(services).values(insertData).returning();

    return jsonOk(newService[0], 201);
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    // Check if service exists and belongs to user
    const existingService = await db
      .select()
      .from(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .limit(1);

    if (existingService.length === 0) {
      return jsonError('Service not found', 404);
    }

    const { name, description, unitPrice, currency, category, duration, active } = body;

    // Validate unitPrice if provided
    if (unitPrice !== undefined && unitPrice !== null) {
      const parsedPrice = parseFloat(unitPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return jsonError('Unit price must be a positive number', 400);
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (name.trim() === '') {
        return jsonError('Name cannot be empty', 400);
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (unitPrice !== undefined && unitPrice !== null) {
      updateData.unitPrice = parseFloat(unitPrice);
    }

    if (currency !== undefined) {
      updateData.currency = currency;
    }

    if (category !== undefined) {
      updateData.category = category || null;
    }

    if (duration !== undefined) {
      if (duration !== null) {
        const parsedDuration = parseInt(duration);
        if (isNaN(parsedDuration) || parsedDuration <= 0 || !Number.isInteger(Number(duration))) {
          return jsonError('Duration must be a positive integer', 400);
        }
        updateData.duration = parsedDuration;
      } else {
        updateData.duration = null;
      }
    }

    if (active !== undefined) {
      updateData.active = active;
    }

    const updatedService = await db
      .update(services)
      .set(updateData)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .returning();

    if (updatedService.length === 0) {
      return jsonError('Service not found', 404);
    }

    return jsonOk(updatedService[0]);
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    // Check if service exists and belongs to user
    const existingService = await db
      .select()
      .from(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .limit(1);

    if (existingService.length === 0) {
      return jsonError('Service not found', 404);
    }

    const deletedService = await db
      .delete(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .returning();

    if (deletedService.length === 0) {
      return jsonError('Service not found', 404);
    }

    return jsonOk({
      message: 'Service deleted successfully',
      service: deletedService[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}