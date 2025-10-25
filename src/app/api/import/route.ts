import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { clients, invoices, receipts } from '@/db/schema';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

interface CSVRow {
  [key: string]: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const body = await request.json();
    const { type, csvData } = body;

    if (!type) {
      return jsonError('Import type is required', 400);
    }

    if (!csvData || typeof csvData !== 'string') {
      return jsonError('CSV data is required', 400);
    }

    const rows = parseCSV(csvData);

    if (rows.length === 0) {
      return jsonError('No valid data found in CSV', 400);
    }

    const now = new Date().toISOString();
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    switch (type) {
      case 'clients':
        for (const row of rows) {
          try {
            if (!row.name || !row.email) {
              failed++;
              errors.push(`Row missing name or email: ${JSON.stringify(row)}`);
              continue;
            }

            await db.insert(clients).values({
              name: row.name,
              email: row.email.toLowerCase(),
              phone: row.phone || null,
              company: row.company || null,
              taxId: row.taxId || row.tax_id || null,
              address: row.address || null,
              country: row.country || null,
              userId,
              createdAt: now,
              updatedAt: now,
            });
            imported++;
          } catch (err) {
            failed++;
            errors.push(`Failed to import client: ${(err as Error).message}`);
          }
        }
        break;

      case 'receipts':
        for (const row of rows) {
          try {
            if (!row.vendor || !row.amount || !row.category || !row.date) {
              failed++;
              errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
              continue;
            }

            const amount = parseFloat(row.amount);
            if (isNaN(amount) || amount <= 0) {
              failed++;
              errors.push(`Invalid amount in row: ${JSON.stringify(row)}`);
              continue;
            }

            await db.insert(receipts).values({
              vendor: row.vendor,
              amount,
              category: row.category,
              date: row.date,
              fileUrl: row.fileUrl || row.file_url || null,
              notes: row.notes || null,
              userId,
              createdAt: now,
              updatedAt: now,
            });
            imported++;
          } catch (err) {
            failed++;
            errors.push(`Failed to import receipt: ${(err as Error).message}`);
          }
        }
        break;

      case 'invoices':
        return jsonError('Invoice import not yet supported. Please use the UI to create invoices.', 501);

      default:
        return jsonError(`Invalid import type: ${type}. Supported types: clients, receipts`, 400);
    }

    return jsonOk({
      message: `Import completed for ${type}`,
      imported,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}