import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth/authenticate';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) {
      return jsonError('Unauthorized', 401);
    }

    const body = await req.json();
    const { services: servicesData } = body;

    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      return jsonError('Invalid services data', 400);
    }

    const insertedServices = [];
    const errors = [];

    for (let i = 0; i < servicesData.length; i++) {
      const service = servicesData[i];
      try {
        // Validate unit price (required, must be a positive number)
        const unitPrice = Number(service.unitPrice);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new Error('Unit price must be a positive number');
        }

        // Validate duration (optional, must be a positive number if provided)
        let duration = null;
        const durationValue = service.duration;
        if (durationValue !== undefined && durationValue !== null && durationValue !== '') {
          const dur = Number(durationValue);
          if (!Number.isFinite(dur) || dur <= 0) {
            throw new Error('Duration must be a positive number');
          }
          duration = dur;
        }

        const result = await db.insert(services).values({
          userId,
          name: service.name,
          description: service.description || null,
          unitPrice: unitPrice,
          currency: service.currency || 'USD',
          category: service.category || null,
          duration: duration,
          active: service.active !== undefined ? service.active : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).returning();

        insertedServices.push(result[0]);
      } catch (error: any) {
        errors.push({
          row: i + 1,
          name: service.name,
          error: error.message,
        });
      }
    }

    return jsonOk({
      message: `Successfully imported ${insertedServices.length} services`,
      imported: insertedServices.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return jsonError(error.message || 'Failed to import services', 500);
  }
}
