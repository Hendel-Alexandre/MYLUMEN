import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { receipts } from '@/db/schema';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';
import { ReceiptImportRow } from '@/lib/utils/receipt-excel-import';

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const body = await request.json();
    const { receipts: receiptData } = body;

    if (!receiptData || !Array.isArray(receiptData)) {
      return jsonError('Receipts array is required', 400);
    }

    if (receiptData.length === 0) {
      return jsonError('At least one receipt is required', 400);
    }

    if (receiptData.length > 1000) {
      return jsonError('Maximum 1000 receipts allowed per import', 400);
    }

    const now = new Date().toISOString();
    const successfulReceipts: any[] = [];
    const failedReceipts: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < receiptData.length; i++) {
      const receipt: ReceiptImportRow = receiptData[i];
      const rowNumber = i + 2;

      try {
        if (!receipt.vendor || !receipt.vendor.trim()) {
          failedReceipts.push({
            row: rowNumber,
            error: 'Vendor is required'
          });
          continue;
        }

        if (!receipt.amount || isNaN(receipt.amount) || receipt.amount <= 0) {
          failedReceipts.push({
            row: rowNumber,
            error: 'Valid positive amount is required'
          });
          continue;
        }

        if (!receipt.category || !receipt.category.trim()) {
          failedReceipts.push({
            row: rowNumber,
            error: 'Category is required'
          });
          continue;
        }

        if (!receipt.date || !receipt.date.trim()) {
          failedReceipts.push({
            row: rowNumber,
            error: 'Date is required'
          });
          continue;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(receipt.date)) {
          failedReceipts.push({
            row: rowNumber,
            error: 'Date must be in YYYY-MM-DD format'
          });
          continue;
        }

        const newReceipt = await db
          .insert(receipts)
          .values({
            vendor: receipt.vendor.trim(),
            amount: receipt.amount,
            category: receipt.category.trim(),
            date: receipt.date.trim(),
            notes: receipt.notes?.trim() || null,
            fileUrl: null,
            userId: userId,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        successfulReceipts.push(newReceipt[0]);
      } catch (dbError) {
        failedReceipts.push({
          row: rowNumber,
          error: `Database error: ${(dbError as Error).message}`
        });
      }
    }

    return jsonOk({
      message: 'Bulk import completed',
      successful: successfulReceipts.length,
      failed: failedReceipts.length,
      totalProcessed: receiptData.length,
      receipts: successfulReceipts,
      errors: failedReceipts
    }, 201);

  } catch (error) {
    console.error('Bulk import error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}
