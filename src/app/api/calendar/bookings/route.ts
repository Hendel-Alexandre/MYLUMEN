import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, clients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';

const VALID_STATUSES = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

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
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const booking = await db.select()
        .from(bookings)
        .where(and(
          eq(bookings.id, parseInt(id)),
          eq(bookings.userId, userId)
        ))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json({ 
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const clientId = searchParams.get('clientId');

    if (status && !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    if (date && !DATE_REGEX.test(date)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Must be YYYY-MM-DD',
        code: 'INVALID_DATE_FORMAT' 
      }, { status: 400 });
    }

    if (clientId && isNaN(parseInt(clientId))) {
      return NextResponse.json({ 
        error: 'Invalid client ID',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const conditions = [eq(bookings.userId, userId)];
    
    if (status) {
      conditions.push(eq(bookings.status, status));
    }
    
    if (date) {
      conditions.push(eq(bookings.date, date));
    }
    
    if (clientId) {
      conditions.push(eq(bookings.clientId, parseInt(clientId)));
    }

    const results = await db.select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(desc(bookings.date), desc(bookings.time))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
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

    const { clientId, title, date, time, duration, status, notes } = body;

    if (!clientId) {
      return NextResponse.json({ 
        error: "Client ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!date || date.trim() === '') {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!time || time.trim() === '') {
      return NextResponse.json({ 
        error: "Time is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(clientId))) {
      return NextResponse.json({ 
        error: "Client ID must be a valid integer",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const client = await db.select()
      .from(clients)
      .where(and(
        eq(clients.id, parseInt(clientId)),
        eq(clients.userId, userId)
      ))
      .limit(1);

    if (client.length === 0) {
      return NextResponse.json({ 
        error: "Client not found",
        code: "CLIENT_NOT_FOUND" 
      }, { status: 404 });
    }

    if (!DATE_REGEX.test(date)) {
      return NextResponse.json({ 
        error: "Invalid date format. Must be YYYY-MM-DD",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }

    if (!TIME_REGEX.test(time)) {
      return NextResponse.json({ 
        error: "Invalid time format. Must be HH:MM",
        code: "INVALID_TIME_FORMAT" 
      }, { status: 400 });
    }

    if (duration !== undefined && (isNaN(parseInt(duration)) || parseInt(duration) <= 0)) {
      return NextResponse.json({ 
        error: "Duration must be a positive integer",
        code: "INVALID_DURATION" 
      }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newBooking = await db.insert(bookings)
      .values({
        clientId: parseInt(clientId),
        userId,
        title: title.trim(),
        date,
        time,
        duration: duration !== undefined ? parseInt(duration) : 60,
        status: status || 'scheduled',
        notes: notes || null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
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

    const existingBooking = await db.select()
      .from(bookings)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: "Booking not found",
        code: "BOOKING_NOT_FOUND" 
      }, { status: 404 });
    }

    const { clientId, title, date, time, duration, status, notes } = body;
    const updates: any = {};

    if (clientId !== undefined) {
      if (isNaN(parseInt(clientId))) {
        return NextResponse.json({ 
          error: "Client ID must be a valid integer",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const client = await db.select()
        .from(clients)
        .where(and(
          eq(clients.id, parseInt(clientId)),
          eq(clients.userId, userId)
        ))
        .limit(1);

      if (client.length === 0) {
        return NextResponse.json({ 
          error: "Client not found",
          code: "CLIENT_NOT_FOUND" 
        }, { status: 404 });
      }

      updates.clientId = parseInt(clientId);
    }

    if (title !== undefined) {
      if (title.trim() === '') {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "MISSING_REQUIRED_FIELD" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (date !== undefined) {
      if (!DATE_REGEX.test(date)) {
        return NextResponse.json({ 
          error: "Invalid date format. Must be YYYY-MM-DD",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
      updates.date = date;
    }

    if (time !== undefined) {
      if (!TIME_REGEX.test(time)) {
        return NextResponse.json({ 
          error: "Invalid time format. Must be HH:MM",
          code: "INVALID_TIME_FORMAT" 
        }, { status: 400 });
      }
      updates.time = time;
    }

    if (duration !== undefined) {
      if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
        return NextResponse.json({ 
          error: "Duration must be a positive integer",
          code: "INVALID_DURATION" 
        }, { status: 400 });
      }
      updates.duration = parseInt(duration);
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    updates.updatedAt = new Date().toISOString();

    const updatedBooking = await db.update(bookings)
      .set(updates)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .returning();

    return NextResponse.json(updatedBooking[0], { status: 200 });

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
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

    const existingBooking = await db.select()
      .from(bookings)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: "Booking not found",
        code: "BOOKING_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(bookings)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .returning();

    return NextResponse.json({
      message: "Booking deleted successfully",
      booking: deleted[0]
    }, { status: 200 });

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}
