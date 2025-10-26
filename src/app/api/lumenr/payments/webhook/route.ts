import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server';
import { db } from '@/db';
import { invoices, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId;
        const userId = session.metadata?.userId;
        const transactionRef = session.payment_intent as string;

        if (invoiceId && userId && transactionRef) {
          const existingPayment = await db
            .select()
            .from(payments)
            .where(eq(payments.transactionRef, transactionRef))
            .limit(1);

          if (existingPayment.length > 0) {
            console.log(`Payment already processed for transaction ${transactionRef}, skipping duplicate`);
            break;
          }

          await db
            .update(invoices)
            .set({
              status: 'paid',
              paidAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(invoices.id, parseInt(invoiceId)));

          await db.insert(payments).values({
            invoiceId: parseInt(invoiceId),
            userId: userId,
            method: 'stripe',
            amount: (session.amount_total! / 100).toString(),
            currency: session.currency?.toUpperCase() || 'USD',
            transactionRef: transactionRef,
            processedAt: new Date().toISOString(),
            notes: 'Stripe checkout payment',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          console.log(`Invoice ${invoiceId} marked as paid with transaction ${transactionRef}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
