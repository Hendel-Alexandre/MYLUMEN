import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = params.id

    // Mock timeline events - integrate with real database later
    const events = [
      {
        id: '1',
        type: 'quote',
        title: 'Quote #Q-001 Sent',
        description: 'Website redesign proposal sent to client',
        amount: 5000,
        status: 'Sent',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: '2',
        type: 'quote',
        title: 'Quote #Q-001 Accepted',
        description: 'Client accepted the website redesign proposal',
        amount: 5000,
        status: 'Accepted',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: '3',
        type: 'invoice',
        title: 'Invoice #INV-001 Issued',
        description: 'Invoice for website redesign project',
        amount: 5000,
        status: 'Sent',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: '4',
        type: 'payment',
        title: 'Payment Received',
        description: 'Payment for Invoice #INV-001',
        amount: 2500,
        status: 'Paid',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: '5',
        type: 'booking',
        title: 'Meeting Scheduled',
        description: 'Project kickoff meeting',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: '6',
        type: 'note',
        title: 'AI Note Added',
        description: 'Client prefers modern, minimalist design with blue color scheme',
        created_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Timeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
