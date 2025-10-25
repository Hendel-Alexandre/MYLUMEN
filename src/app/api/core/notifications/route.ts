import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock notifications - integrate with real database later
    const notifications = [
      {
        id: '1',
        type: 'invoice',
        title: 'Invoice Overdue',
        message: 'Invoice #INV-001 is 10 days overdue - resend reminder?',
        read: false,
        created_at: new Date().toISOString(),
        action_url: '/dashboard/invoices'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: '$2,500 payment received from Acme Corp',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        action_url: '/dashboard/payments'
      },
      {
        id: '3',
        type: 'ai_tip',
        title: 'AI Insight',
        message: 'Your average quotes/week is 3 — create one now?',
        read: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        action_url: '/dashboard/quotes'
      }
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
