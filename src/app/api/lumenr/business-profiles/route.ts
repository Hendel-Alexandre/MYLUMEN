import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured, getDatabaseError } from '@/db';
import { businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    // Check database configuration first
    if (!isDatabaseConfigured()) {
      return jsonError(
        `Database not configured: ${getDatabaseError()}`,
        503
      );
    }

    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    // Fetch business profile for current user
    const profile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    // Always return array format for consistency
    return jsonOk(profile);
  } catch (error) {
    console.error('GET error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check database configuration first
    if (!isDatabaseConfigured()) {
      return jsonError(
        `Database not configured: ${getDatabaseError()}`,
        503
      );
    }

    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const body = await request.json();
    const { businessName, logoUrl, currency, taxRegion, paymentInstructions, invoiceFooter } = body;

    // Validate required fields
    if (!businessName || businessName.trim() === '') {
      return jsonError('Business name is required', 400);
    }

    // Check if profile already exists for this user
    const existingProfile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    const now = new Date().toISOString();

    if (existingProfile.length > 0) {
      // UPDATE existing profile
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

      return jsonOk(updated[0]);
    } else {
      // INSERT new profile
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

      return jsonOk(newProfile[0], 201);
    }
  } catch (error) {
    console.error('POST error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}