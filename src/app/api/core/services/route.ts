import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq, like, or, and, asc } from 'drizzle-orm';
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
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const service = await db
        .select()
        .from(services)
        .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
        .limit(1);

      if (service.length === 0) {
        return NextResponse.json(
          { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(service[0], { status: 200 });
    }

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

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { name, description, unitPrice, currency } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (unitPrice === undefined || unitPrice === null) {
      return NextResponse.json(
        { error: 'Unit price is required', code: 'MISSING_UNIT_PRICE' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(unitPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        {
          error: 'Unit price must be a positive number',
          code: 'INVALID_UNIT_PRICE',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      unitPrice: parsedPrice,
      currency: currency || 'USD',
      userId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const newService = await db.insert(services).values(insertData).returning();

    return NextResponse.json(newService[0], { status: 201 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingService = await db
      .select()
      .from(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .limit(1);

    if (existingService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { name, description, unitPrice, currency } = body;

    if (unitPrice !== undefined && unitPrice !== null) {
      const parsedPrice = parseFloat(unitPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json(
          {
            error: 'Unit price must be a positive number',
            code: 'INVALID_UNIT_PRICE',
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
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

    const updatedService = await db
      .update(services)
      .set(updateData)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .returning();

    if (updatedService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedService[0], { status: 200 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingService = await db
      .select()
      .from(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .limit(1);

    if (existingService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedService = await db
      .delete(services)
      .where(and(eq(services.id, parseInt(id)), eq(services.userId, userId)))
      .returning();

    if (deletedService.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Service deleted successfully',
        service: deletedService[0],
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
