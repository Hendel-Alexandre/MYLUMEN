import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Test database connection
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Database connection failed'
      }, { status: 500 });
    }

    // Test storage connection
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      database: {
        connected: true,
        tables: ['clients', 'invoices', 'quotes', 'receipts', 'bookings', 'contracts', 'payments', 'services', 'products', 'business_profiles']
      },
      storage: {
        connected: !storageError,
        buckets: buckets?.length || 0,
        bucketsAvailable: buckets?.map(b => b.name) || []
      },
      realtime: {
        available: true,
        info: 'Subscribe to table changes using the Supabase client'
      }
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
