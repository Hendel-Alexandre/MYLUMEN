import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { clients, invoices, quotes, receipts, payments } from '@/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = token;

    // Get total clients count
    const totalClients = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(eq(clients.userId, userId));

    // Get new clients this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newClientsThisMonth = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(
        and(
          eq(clients.userId, userId),
          gte(clients.createdAt, firstDayOfMonth.toISOString())
        )
      );

    // Get all invoices
    const allInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId));

    // Calculate revenue metrics
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    const unpaidRevenue = totalRevenue - paidRevenue;

    // Get revenue for this month
    const monthlyRevenue = allInvoices
      .filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= firstDayOfMonth;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

    // Get weekly data (last 7 days)
    const weeklyData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayInvoices = allInvoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= date && invDate < nextDate;
      });

      const dayClients = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(clients)
        .where(
          and(
            eq(clients.userId, userId),
            gte(clients.createdAt, date.toISOString()),
            sql`${clients.createdAt} < ${nextDate.toISOString()}`
          )
        );

      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0),
        invoices: dayInvoices.length,
        clients: dayClients[0]?.count || 0
      });
    }

    // Get all quotes
    const allQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.userId, userId));

    const pendingQuotes = allQuotes.filter(q => q.status === 'pending' || q.status === 'sent');
    const acceptedQuotes = allQuotes.filter(q => q.status === 'accepted');

    // Get all receipts
    const allReceipts = await db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId));

    const totalExpenses = allReceipts.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

    // Get weekly expenses (last 7 days)
    const weeklyExpenses = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayReceipts = allReceipts.filter(r => {
        const receiptDate = new Date(r.createdAt);
        return receiptDate >= date && receiptDate < nextDate;
      });

      weeklyExpenses.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayReceipts.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0)
      });
    }

    // Get quote status distribution
    const quoteStatusData = [
      { status: 'Pending', count: allQuotes.filter(q => q.status === 'pending').length },
      { status: 'Sent', count: allQuotes.filter(q => q.status === 'sent').length },
      { status: 'Accepted', count: allQuotes.filter(q => q.status === 'accepted').length },
      { status: 'Rejected', count: allQuotes.filter(q => q.status === 'rejected').length },
    ].filter(item => item.count > 0);

    // Get recent activity (last 10 items)
    const recentInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    const recentClients = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt))
      .limit(5);

    const activity = [
      ...recentInvoices.map(inv => ({
        type: 'invoice',
        id: inv.id,
        title: `Invoice #${inv.id}`,
        description: `${inv.status} - $${inv.total}`,
        timestamp: inv.createdAt,
        status: inv.status
      })),
      ...recentClients.map(client => ({
        type: 'client',
        id: client.id,
        title: client.name,
        description: `New client added`,
        timestamp: client.createdAt,
        status: 'active'
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

    // Generate insights
    const insights = [];

    // Revenue insight
    if (monthlyRevenue > 0) {
      insights.push({
        type: 'positive',
        title: 'Revenue This Month',
        description: `You've earned $${monthlyRevenue.toFixed(2)} this month`,
        action: 'View invoices'
      });
    }

    // Unpaid invoices insight
    const unpaidInvoices = allInvoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled');
    if (unpaidInvoices.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Pending Invoices',
        description: `${unpaidInvoices.length} invoices totaling $${unpaidRevenue.toFixed(2)} are pending payment`,
        action: 'Review invoices'
      });
    }

    // New clients insight
    if (newClientsThisMonth[0]?.count > 0) {
      insights.push({
        type: 'info',
        title: 'New Clients',
        description: `You added ${newClientsThisMonth[0].count} new client${newClientsThisMonth[0].count > 1 ? 's' : ''} this month`,
        action: 'View clients'
      });
    }

    // Pending quotes insight
    if (pendingQuotes.length > 0) {
      insights.push({
        type: 'info',
        title: 'Pending Quotes',
        description: `${pendingQuotes.length} quote${pendingQuotes.length > 1 ? 's' : ''} waiting for client response`,
        action: 'View quotes'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          monthlyRevenue: monthlyRevenue,
          activeClients: totalClients[0]?.count || 0,
          invoicesPaid: paidInvoices.length,
          totalInvoices: allInvoices.length,
          totalQuotes: allQuotes.length,
          acceptedQuotes: acceptedQuotes.length,
          totalExpenses: totalExpenses,
          unpaidRevenue: unpaidRevenue
        },
        weeklyData,
        weeklyExpenses,
        quoteStatusData,
        activity,
        insights
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
