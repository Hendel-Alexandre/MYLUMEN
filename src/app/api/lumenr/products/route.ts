import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth-api';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return jsonError('Valid ID is required', 400);
      }

      const product = await db
        .select()
        .from(products)
        .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
        .limit(1);

      if (product.length === 0) {
        return jsonError('Product not found', 404);
      }

      // Convert numeric strings to numbers for frontend
      const formattedProduct = {
        ...product[0],
        price: parseFloat(product[0].price as any) || 0
      };

      return jsonOk(formattedProduct);
    }

    // List products with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const activeParam = searchParams.get('active');

    const conditions = [eq(products.userId, userId)];

    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (activeParam !== null) {
      const activeValue = activeParam === 'true';
      conditions.push(eq(products.active, activeValue));
    }

    const results = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Convert numeric strings to numbers for frontend
    const formattedResults = results.map(product => ({
      ...product,
      price: parseFloat(product.price as any) || 0
    }));

    return jsonOk(formattedResults);
  } catch (error) {
    console.error('GET error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    const { name, description, price, category, imageUrl, active } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return jsonError('Product name is required', 400);
    }

    if (price === undefined || price === null) {
      return jsonError('Product price is required', 400);
    }

    if (typeof price !== 'number' || price <= 0) {
      return jsonError('Price must be a positive number', 400);
    }

    const now = new Date().toISOString();

    const newProduct = await db
      .insert(products)
      .values({
        name: name.trim(),
        description: description || null,
        price,
        category: category || null,
        imageUrl: imageUrl || null,
        active: active !== undefined ? active : true,
        userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return jsonOk(newProduct[0], 201);
  } catch (error) {
    console.error('POST error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return jsonError('User ID cannot be provided in request body', 400);
    }

    // Check if product exists and belongs to user
    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return jsonError('Product not found', 404);
    }

    const { name, description, price, category, imageUrl, active } = body;

    // Validate fields if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return jsonError('Product name must be a non-empty string', 400);
      }
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0) {
        return jsonError('Price must be a positive number', 400);
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (active !== undefined) updates.active = active;

    const updated = await db
      .update(products)
      .set(updates)
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
      .returning();

    return jsonOk(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error || !userId) {
      return jsonError('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return jsonError('Valid ID is required', 400);
    }

    // Check if product exists and belongs to user
    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return jsonError('Product not found', 404);
    }

    const deleted = await db
      .delete(products)
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, userId)))
      .returning();

    return jsonOk({
      message: 'Product deleted successfully',
      product: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonError('Internal server error: ' + (error as Error).message, 500);
  }
}