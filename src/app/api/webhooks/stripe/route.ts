import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment';
import { db } from '@/db';
import { orders, orderStatusHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(pi);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(pi);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        logger.error('Payment dispute created', { disputeId: dispute.id, paymentIntent: String(dispute.payment_intent) });
        break;
      }
      default:
        // Unhandled event type — that's fine
        break;
    }
  } catch (err) {
    logger.error('Webhook handler error', { eventType: event.type, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  // Find order by paymentIntentId and confirm it's processing
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentIntentId, pi.id))
    .limit(1);

  if (!order) return; // Order not yet created or doesn't match

  if (order.status === 'pending') {
    await db.update(orders)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: 'processing',
      notes: 'Payment confirmed via Stripe webhook',
    });

    logger.info('Order confirmed via webhook', { orderId: order.id, paymentIntentId: pi.id });
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentIntentId, pi.id))
    .limit(1);

  if (!order || order.status !== 'pending') return;

  await db.update(orders)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    status: 'cancelled',
    notes: `Payment failed: ${pi.last_payment_error?.message || 'Unknown error'}`,
  });

  logger.error('Payment failed for order', { orderId: order.id, paymentIntentId: pi.id });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!piId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentIntentId, piId))
    .limit(1);

  if (!order) return;

  const isFullRefund = charge.amount_refunded === charge.amount;

  if (isFullRefund) {
    await db.update(orders)
      .set({ status: 'refunded', updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: 'refunded',
      notes: `Full refund processed ($${(charge.amount_refunded / 100).toFixed(2)})`,
    });
  } else {
    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: order.status,
      notes: `Partial refund processed ($${(charge.amount_refunded / 100).toFixed(2)} of $${(charge.amount / 100).toFixed(2)})`,
    });
  }

  logger.info('Refund processed', { orderId: order.id, amount: charge.amount_refunded, full: isFullRefund });
}
