import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { clients } from '@/db/schema';
import { getAuthUser } from '@/lib/auth-api';
import { eq, and } from 'drizzle-orm';

function jsonOk(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const body = await request.json();
    const { clients: clientsData } = body;

    if (!Array.isArray(clientsData) || clientsData.length === 0) {
      return jsonError('No client data provided', 400);
    }

    if (clientsData.length > 1000) {
      return jsonError('Maximum 1000 clients can be imported at once', 400);
    }

    const now = new Date().toISOString();
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>
    };

    for (let i = 0; i < clientsData.length; i++) {
      const client = clientsData[i];
      const rowNumber = i + 1;

      try {
        if (!client.name || !client.name.trim()) {
          results.failed++;
          results.errors.push({ row: rowNumber, error: 'Name is required' });
          continue;
        }

        if (!client.email || !client.email.trim()) {
          results.failed++;
          results.errors.push({ row: rowNumber, error: 'Email is required' });
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(client.email)) {
          results.failed++;
          results.errors.push({ row: rowNumber, error: 'Invalid email format' });
          continue;
        }

        const existingClient = await db.select()
          .from(clients)
          .where(and(
            eq(clients.email, client.email.trim().toLowerCase()),
            eq(clients.userId, userId)
          ))
          .limit(1);

        if (existingClient.length > 0) {
          results.failed++;
          results.errors.push({ row: rowNumber, error: `Client with email ${client.email} already exists` });
          continue;
        }

        await db.insert(clients).values({
          name: client.name.trim(),
          email: client.email.trim().toLowerCase(),
          phone: client.phone?.trim() || null,
          company: client.company?.trim() || null,
          taxId: client.taxId?.trim() || null,
          address: client.address?.trim() || null,
          city: client.city?.trim() || null,
          province: client.province?.trim() || null,
          country: client.country?.trim() || null,
          taxRate: client.taxRate ? String(client.taxRate) : null,
          autoCalculateTax: client.autoCalculateTax || false,
          userId,
          createdAt: now,
          updatedAt: now
        });

        results.successful++;

      } catch (error) {
        console.error(`Error importing client at row ${rowNumber}:`, error);
        results.failed++;
        results.errors.push({ 
          row: rowNumber, 
          error: `Failed to import: ${(error as Error).message}` 
        });
      }
    }

    return jsonOk({
      ...results,
      total: clientsData.length,
      message: `Successfully imported ${results.successful} out of ${clientsData.length} clients`
    }, 200);

  } catch (error) {
    console.error('Bulk import error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}
