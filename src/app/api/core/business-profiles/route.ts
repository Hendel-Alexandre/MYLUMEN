import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    const profile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
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
    const { businessName, logoUrl, currency, taxRegion, paymentInstructions, invoiceFooter } = body;

    if (!businessName || businessName.trim() === '') {
      return NextResponse.json({ 
        error: 'Business name is required',
        code: 'MISSING_BUSINESS_NAME' 
      }, { status: 400 });
    }

    const existingProfile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    const now = new Date().toISOString();

    if (existingProfile.length > 0) {
      const updated = await db.update(businessProfiles)
        .set({
          businessName: businessName.trim(),
          logoUrl: logoUrl?.trim() || null,
          currency: currency?.trim() || 'USD',
          taxRegion: taxRegion?.trim() || null,
          paymentInstructions: paymentInstructions?.trim() || null,
          invoiceFooter: invoiceFooter?.trim() || null,
          updatedAt: now
        })
        .where(eq(businessProfiles.userId, userId))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      const newProfile = await db.insert(businessProfiles)
        .values({
          userId: userId,
          businessName: businessName.trim(),
          logoUrl: logoUrl?.trim() || null,
          currency: currency?.trim() || 'USD',
          taxRegion: taxRegion?.trim() || null,
          paymentInstructions: paymentInstructions?.trim() || null,
          invoiceFooter: invoiceFooter?.trim() || null,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      return NextResponse.json(newProfile[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
