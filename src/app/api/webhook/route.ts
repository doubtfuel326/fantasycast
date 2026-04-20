import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;
      const customerId = session.customer as string;
      const email = session.customer_email || "";

      if (userId && tier) {
        // Set season expiry to February 1st of next year (end of NFL season)
        const now = new Date();
        const expiresAt = new Date();
        // If purchased after Feb 1, expire next Feb 1. If before, expire this Feb 1.
        if (now.getMonth() >= 1) {
          expiresAt.setFullYear(now.getFullYear() + 1, 1, 1);
        } else {
          expiresAt.setFullYear(now.getFullYear(), 1, 1);
        }
        expiresAt.setHours(0, 0, 0, 0);

        await supabase.from("subscribers").upsert({
          user_id: userId,
          email,
          stripe_customer_id: customerId,
          plan: tier,
          status: "active",
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log(`✅ Season pass activated: user=${userId} tier=${tier} expires=${expiresAt.toISOString()}`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const { data } = await supabase
        .from("subscribers")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (data?.user_id) {
        await supabase.from("subscribers").update({
          status: sub.status === "active" ? "active" : "inactive",
          updated_at: new Date().toISOString(),
        }).eq("stripe_customer_id", customerId);
        console.log(`📝 Subscription updated: customer=${customerId} status=${sub.status}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase.from("subscribers").update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      }).eq("stripe_customer_id", customerId);
      console.log(`❌ Subscription canceled: customer=${customerId}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase.from("subscribers").update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      }).eq("stripe_customer_id", customerId);
      console.log(`💳 Payment failed: customer=${customerId}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
