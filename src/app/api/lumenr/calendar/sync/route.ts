import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, clients } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';
import {
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  bookingToGoogleEvent,
} from '@/lib/integrations/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'import') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const timeMin = startDate ? new Date(startDate) : new Date();
      const timeMax = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      try {
        const events = await listGoogleCalendarEvents('primary', timeMin, timeMax);

        return jsonOk({
          message: 'Google Calendar events retrieved successfully',
          events: events.map(event => ({
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            location: event.location,
            attendees: event.attendees,
          })),
        });
      } catch (gcError: any) {
        console.error('Google Calendar API Error:', gcError);
        return jsonError('Failed to connect to Google Calendar: ' + gcError.message, 500);
      }
    }

    return jsonError('Invalid action. Use ?action=import', 400);
  } catch (error) {
    console.error('GET /api/lumenr/calendar/sync error:', error);
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
    const { action, bookingIds, startDate, endDate } = body;

    if (action === 'export') {
      if (!bookingIds || !Array.isArray(bookingIds)) {
        return jsonError('bookingIds array is required', 400);
      }

      const userBookings = await db
        .select({
          id: bookings.id,
          clientId: bookings.clientId,
          userId: bookings.userId,
          title: bookings.title,
          date: bookings.date,
          time: bookings.time,
          duration: bookings.duration,
          status: bookings.status,
          notes: bookings.notes,
          googleEventId: bookings.googleEventId,
          clientEmail: clients.email,
        })
        .from(bookings)
        .leftJoin(clients, eq(bookings.clientId, clients.id))
        .where(eq(bookings.userId, userId));

      const selectedBookings = userBookings.filter(booking => 
        bookingIds.includes(booking.id)
      );

      if (selectedBookings.length === 0) {
        return jsonError('No valid bookings found', 404);
      }

      const exportResults = [];

      for (const booking of selectedBookings) {
        try {
          const googleEvent = bookingToGoogleEvent(booking, booking.clientEmail || undefined);
          let createdEvent;

          if (booking.googleEventId) {
            try {
              createdEvent = await updateGoogleCalendarEvent(booking.googleEventId, googleEvent);
              await db.update(bookings)
                .set({ googleEventId: createdEvent.id, updatedAt: new Date().toISOString() })
                .where(eq(bookings.id, booking.id));
              exportResults.push({
                bookingId: booking.id,
                success: true,
                googleEventId: createdEvent.id,
                action: 'updated',
              });
            } catch (updateError: any) {
              if (updateError.code === 404) {
                createdEvent = await createGoogleCalendarEvent(googleEvent);
                await db.update(bookings)
                  .set({ googleEventId: createdEvent.id, updatedAt: new Date().toISOString() })
                  .where(eq(bookings.id, booking.id));
                exportResults.push({
                  bookingId: booking.id,
                  success: true,
                  googleEventId: createdEvent.id,
                  action: 'created',
                });
              } else {
                throw updateError;
              }
            }
          } else {
            createdEvent = await createGoogleCalendarEvent(googleEvent);
            await db.update(bookings)
              .set({ googleEventId: createdEvent.id, updatedAt: new Date().toISOString() })
              .where(eq(bookings.id, booking.id));
            exportResults.push({
              bookingId: booking.id,
              success: true,
              googleEventId: createdEvent.id,
              action: 'created',
            });
          }
        } catch (exportError: any) {
          console.error(`Error exporting booking ${booking.id}:`, exportError);
          exportResults.push({
            bookingId: booking.id,
            success: false,
            error: exportError.message,
          });
        }
      }

      return jsonOk({
        message: 'Export completed',
        results: exportResults,
        successful: exportResults.filter(r => r.success).length,
        failed: exportResults.filter(r => !r.success).length,
      });
    }

    if (action === 'sync-all') {
      const timeMin = startDate ? new Date(startDate) : new Date();
      const timeMax = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const userBookings = await db
        .select({
          id: bookings.id,
          clientId: bookings.clientId,
          userId: bookings.userId,
          title: bookings.title,
          date: bookings.date,
          time: bookings.time,
          duration: bookings.duration,
          status: bookings.status,
          notes: bookings.notes,
          googleEventId: bookings.googleEventId,
          clientEmail: clients.email,
        })
        .from(bookings)
        .leftJoin(clients, eq(bookings.clientId, clients.id))
        .where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.date, timeMin.toISOString().split('T')[0]),
            lte(bookings.date, timeMax.toISOString().split('T')[0])
          )
        );

      const exportResults = [];

      for (const booking of userBookings) {
        try {
          const googleEvent = bookingToGoogleEvent(booking, booking.clientEmail || undefined);
          let createdEvent;

          if (booking.googleEventId) {
            try {
              createdEvent = await updateGoogleCalendarEvent(booking.googleEventId, googleEvent);
              await db.update(bookings)
                .set({ googleEventId: createdEvent.id, updatedAt: new Date().toISOString() })
                .where(eq(bookings.id, booking.id));
              exportResults.push({
                bookingId: booking.id,
                success: true,
                googleEventId: createdEvent.id,
                action: 'updated',
              });
            } catch (updateError: any) {
              if (updateError.code === 404) {
                createdEvent = await createGoogleCalendarEvent(googleEvent);
                await db.update(bookings)
                  .set({ googleEventId: createdEvent.id, updatedAt: new Date().toISOString() })
                  .where(eq(bookings.id, booking.id));
                exportResults.push({
                  bookingId: booking.id,
                  success: true,
                  googleEventId: createdEvent.id,
                  action: 'created',
                });
              } else {
                throw updateError;
              }
            }
          } else {
            createdEvent = await createGoogleCalendarEvent(googleEvent);
            await db.update(bookings)
              .set({ googleEventId: createdEvent.id, updatedAt: new Date().toISOString() })
              .where(eq(bookings.id, booking.id));
            exportResults.push({
              bookingId: booking.id,
              success: true,
              googleEventId: createdEvent.id,
              action: 'created',
            });
          }
        } catch (exportError: any) {
          console.error(`Error syncing booking ${booking.id}:`, exportError);
          exportResults.push({
            bookingId: booking.id,
            success: false,
            error: exportError.message,
          });
        }
      }

      return jsonOk({
        message: 'Sync completed',
        results: exportResults,
        successful: exportResults.filter(r => r.success).length,
        failed: exportResults.filter(r => !r.success).length,
      });
    }

    return jsonError('Invalid action. Use action=export or action=sync-all', 400);
  } catch (error) {
    console.error('POST /api/lumenr/calendar/sync error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}
