import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth/authenticate';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) {
      return jsonError('Unauthorized', 401);
    }

    const body = await req.json();
    const { products: productsData } = body;

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return jsonError('Invalid products data', 400);
    }

    const insertedProducts = [];
    const errors = [];

    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];
      try {
        // Validate price (required, must be a positive number)
        const price = Number(product.price);
        if (!Number.isFinite(price) || price <= 0) {
          throw new Error('Price must be a positive number');
        }

        // Validate stock quantity (optional, must be a non-negative number if provided)
        let stockQuantity = null;
        const stockQtyValue = product.stockQuantity;
        if (stockQtyValue !== undefined && stockQtyValue !== null && stockQtyValue !== '') {
          const qty = Number(stockQtyValue);
          if (!Number.isFinite(qty) || qty < 0) {
            throw new Error('Stock quantity must be a non-negative number');
          }
          stockQuantity = qty;
        }

        const result = await db.insert(products).values({
          userId,
          name: product.name,
          description: product.description || null,
          price: price,
          category: product.category || null,
          imageUrl: product.imageUrl || null,
          active: product.active !== undefined ? product.active : true,
          trackInventory: product.trackInventory || false,
          stockQuantity: stockQuantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).returning();

        insertedProducts.push(result[0]);
      } catch (error: any) {
        errors.push({
          row: i + 1,
          name: product.name,
          error: error.message,
        });
      }
    }

    return jsonOk({
      message: `Successfully imported ${insertedProducts.length} products`,
      imported: insertedProducts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return jsonError(error.message || 'Failed to import products', 500);
  }
}
