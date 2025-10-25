import { db, isDatabaseConfigured, getDatabaseError } from '@/db';
import { clients, invoices, receipts, payments, bookings } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function GET(request: Request) {
  try {
    // Check database configuration first
    if (!isDatabaseConfigured()) {
      return jsonError(
        `Database not configured: ${getDatabaseError()}`,
        503
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonError('Authentication required', 401);
    }

    // Extract userId from token - simplified for now
    const userId = token;

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Get current month stats
    const [
      currentMonthInvoices,
      lastMonthInvoices,
      currentMonthPayments,
      lastMonthPayments,
      currentMonthReceipts,
      lastMonthReceipts,
      currentMonthBookings,
      lastMonthBookings,
      totalClients,
      pendingInvoices
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(and(eq(invoices.userId, userId), gte(invoices.createdAt, currentMonth))),
      db.select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(and(
          eq(invoices.userId, userId),
          gte(invoices.createdAt, lastMonth),
          sql`${invoices.createdAt} < ${currentMonth}`
        )),
      db.select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(and(eq(payments.userId, userId), gte(payments.createdAt, currentMonth))),
      db.select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(and(
          eq(payments.userId, userId),
          gte(payments.createdAt, lastMonth),
          sql`${payments.createdAt} < ${currentMonth}`
        )),
      db.select({ total: sql<number>`COALESCE(SUM(${receipts.amount}), 0)` })
        .from(receipts)
        .where(and(eq(receipts.userId, userId), gte(receipts.createdAt, currentMonth))),
      db.select({ total: sql<number>`COALESCE(SUM(${receipts.amount}), 0)` })
        .from(receipts)
        .where(and(
          eq(receipts.userId, userId),
          gte(receipts.createdAt, lastMonth),
          sql`${receipts.createdAt} < ${currentMonth}`
        )),
      db.select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(and(eq(bookings.userId, userId), gte(bookings.createdAt, currentMonth))),
      db.select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(and(
          eq(bookings.userId, userId),
          gte(bookings.createdAt, lastMonth),
          sql`${bookings.createdAt} < ${currentMonth}`
        )),
      db.select({ count: sql<number>`count(*)` })
        .from(clients)
        .where(eq(clients.userId, userId)),
      db.select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(and(eq(invoices.userId, userId), eq(invoices.status, 'unpaid')))
    ]);

    const currentInvoiceCount = currentMonthInvoices[0]?.count || 0;
    const lastInvoiceCount = lastMonthInvoices[0]?.count || 0;
    const currentRevenue = currentMonthPayments[0]?.total || 0;
    const lastRevenue = lastMonthPayments[0]?.total || 0;
    const currentExpenses = currentMonthReceipts[0]?.total || 0;
    const lastExpenses = lastMonthReceipts[0]?.total || 0;
    const currentBookingCount = currentMonthBookings[0]?.count || 0;
    const lastBookingCount = lastMonthBookings[0]?.count || 0;

    const calculateChange = (current: number, last: number) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    return jsonOk({
      revenue: {
        current: currentRevenue,
        last: lastRevenue,
        change: calculateChange(currentRevenue, lastRevenue)
      },
      invoices: {
        current: currentInvoiceCount,
        last: lastInvoiceCount,
        change: calculateChange(currentInvoiceCount, lastInvoiceCount),
        pending: pendingInvoices[0]?.count || 0
      },
      expenses: {
        current: currentExpenses,
        last: lastExpenses,
        change: calculateChange(currentExpenses, lastExpenses)
      },
      bookings: {
        current: currentBookingCount,
        last: lastBookingCount,
        change: calculateChange(currentBookingCount, lastBookingCount)
      },
      clients: {
        total: totalClients[0]?.count || 0
      }
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return jsonError('Internal server error: ' + error.message, 500);
  }
}