import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

// This webhook handles subscription lifecycle events from Stripe.
// In production you'd persist these to your database (Postgres, Supabase, etc.)

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && tier) {
          // TODO: Save to your DB:
          // await db.subscription.upsert({
          //   where: { userId },
          //   create: { userId, plan: tier, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, status: "active" },
          //   update: { plan: tier, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, status: "active" },
          // });
          console.log(`✅ Subscription activated: user=${userId} tier=${tier}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const tier = sub.metadata?.tier;

        if (userId) {
          // TODO: Update subscription status in DB
          console.log(`📝 Subscription updated: user=${userId} status=${sub.status} tier=${tier}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (userId) {
          // TODO: Mark subscription as canceled in DB
          // Downgrade user to free tier / restrict episode generation
          console.log(`❌ Subscription canceled: user=${userId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`💳 Payment failed for customer: ${invoice.customer}`);
        // TODO: Update subscription status to "past_due", send email
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
