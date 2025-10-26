import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth/authenticate';

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product.length || product[0].userId !== userId) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productData = product[0];

    if (!productData.active) {
      return NextResponse.json({ error: 'Product is not active' }, { status: 400 });
    }

    const priceData = await stripe.prices.create({
      currency: 'usd',
      unit_amount: Math.round(parseFloat(productData.price) * 100),
      product_data: {
        name: productData.name,
        description: productData.description || undefined,
        images: productData.imageUrl ? [productData.imageUrl] : undefined,
      },
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceData.id,
          quantity: 1,
        },
      ],
      metadata: {
        productId: productId.toString(),
        userId: userId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      paymentLink: paymentLink.url,
      paymentLinkId: paymentLink.id
    });
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
