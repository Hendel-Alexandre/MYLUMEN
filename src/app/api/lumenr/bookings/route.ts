import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, clients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

const VALID_STATUSES = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    
    const id = searchParams.get('id');
    if (id) {
      if (isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const booking = await db.select()
        .from(bookings)
        .where(and(
          eq(bookings.id, parseInt(id)),
          eq(bookings.userId, userId)
        ))
        .limit(1);

      if (booking.length === 0) {
        return jsonError('Booking not found', 404);
      }

      return jsonOk(booking[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const clientId = searchParams.get('clientId');

    if (status && !VALID_STATUSES.includes(status as any)) {
      return jsonError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    if (date && !DATE_REGEX.test(date)) {
      return jsonError('Invalid date format. Must be YYYY-MM-DD', 400);
    }

    if (clientId && isNaN(parseInt(clientId))) {
      return jsonError('Invalid client ID', 400);
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

    return jsonOk(results);

  } catch (error: any) {
    console.error('[API ERROR /api/lumenr/bookings GET]', error);
    return jsonError('Internal server error: ' + error.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const bodyText = await request.text();
    console.log('[DEBUG /api/lumenr/bookings POST] Raw request body:', bodyText);

    const body = JSON.parse(bodyText || '{}');

    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const { clientId, title, date, time, duration, status, notes } = body;

    if (!clientId) {
      return jsonError('Client ID is required', 400);
    }

    if (!title || title.trim() === '') {
      return jsonError('Title is required', 400);
    }

    if (!date || date.trim() === '') {
      return jsonError('Date is required', 400);
    }

    if (!time || time.trim() === '') {
      return jsonError('Time is required', 400);
    }

    if (isNaN(parseInt(clientId))) {
      return jsonError('Client ID must be a valid integer', 400);
    }

    const client = await db.select()
      .from(clients)
      .where(and(
        eq(clients.id, parseInt(clientId)),
        eq(clients.userId, userId)
      ))
      .limit(1);

    if (client.length === 0) {
      return jsonError('Client not found', 404);
    }

    if (!DATE_REGEX.test(date)) {
      return jsonError('Invalid date format. Must be YYYY-MM-DD', 400);
    }

    if (!TIME_REGEX.test(time)) {
      return jsonError('Invalid time format. Must be HH:MM', 400);
    }

    if (duration !== undefined && (isNaN(parseInt(duration)) || parseInt(duration) <= 0)) {
      return jsonError('Duration must be a positive integer', 400);
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return jsonError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
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

    return jsonOk(newBooking[0], 201);

  } catch (error: any) {
    console.error('[API ERROR /api/lumenr/bookings POST]', error);
    return jsonError('Internal server error: ' + error.message, 500);
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

    const bodyText = await request.text();
    console.log('[DEBUG /api/lumenr/bookings PUT] Raw request body:', bodyText);

    const body = JSON.parse(bodyText || '{}');

    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const existingBooking = await db.select()
      .from(bookings)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .limit(1);

    if (existingBooking.length === 0) {
      return jsonError('Booking not found', 404);
    }

    const { clientId, title, date, time, duration, status, notes } = body;
    const updates: any = {};

    if (clientId !== undefined) {
      if (isNaN(parseInt(clientId))) {
        return jsonError('Client ID must be a valid integer', 400);
      }

      const client = await db.select()
        .from(clients)
        .where(and(
          eq(clients.id, parseInt(clientId)),
          eq(clients.userId, userId)
        ))
        .limit(1);

      if (client.length === 0) {
        return jsonError('Client not found', 404);
      }

      updates.clientId = parseInt(clientId);
    }

    if (title !== undefined) {
      if (title.trim() === '') {
        return jsonError('Title cannot be empty', 400);
      }
      updates.title = title.trim();
    }

    if (date !== undefined) {
      if (!DATE_REGEX.test(date)) {
        return jsonError('Invalid date format. Must be YYYY-MM-DD', 400);
      }
      updates.date = date;
    }

    if (time !== undefined) {
      if (!TIME_REGEX.test(time)) {
        return jsonError('Invalid time format. Must be HH:MM', 400);
      }
      updates.time = time;
    }

    if (duration !== undefined) {
      if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
        return jsonError('Duration must be a positive integer', 400);
      }
      updates.duration = parseInt(duration);
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return jsonError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
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

    return jsonOk(updatedBooking[0]);

  } catch (error: any) {
    console.error('[API ERROR /api/lumenr/bookings PUT]', error);
    return jsonError('Internal server error: ' + error.message, 500);
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

    const existingBooking = await db.select()
      .from(bookings)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .limit(1);

    if (existingBooking.length === 0) {
      return jsonError('Booking not found', 404);
    }

    const deleted = await db.delete(bookings)
      .where(and(
        eq(bookings.id, parseInt(id)),
        eq(bookings.userId, userId)
      ))
      .returning();

    return jsonOk({
      message: "Booking deleted successfully",
      booking: deleted[0]
    });

  } catch (error: any) {
    console.error('[API ERROR /api/lumenr/bookings DELETE]', error);
    return jsonError('Internal server error: ' + error.message, 500);
  }
}