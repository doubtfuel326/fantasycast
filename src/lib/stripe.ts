import Stripe from "stripe";
import type { Plan, PlanTier } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    priceId: process.env.STRIPE_PRICE_STARTER || "",
    episodesPerWeek: 3,
    leagues: 1,
    features: [
      "3 episodes per week",
      "1 fantasy league",
      "The Wire, Debate & Podcast formats",
      "All episode types including Championship",
      "Sleeper + Yahoo Fantasy integration",
      "Shareable episode links",
      "Episode archive",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    priceId: process.env.STRIPE_PRICE_PRO || "",
    episodesPerWeek: 10,
    leagues: 3,
    highlighted: true,
    features: [
      "10 episodes per week",
      "Up to 3 fantasy leagues",
      "Everything in Starter",
      "Early access to new features",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 79,
    priceId: process.env.STRIPE_PRICE_ELITE || "",
    episodesPerWeek: 999999,
    leagues: 10,
    features: [
      "Unlimited episodes",
      "Up to 10 fantasy leagues",
      "Everything in Pro",
      "Weekly auto-generation",
      "Priority support",
    ],
  },
];

export function getPlanByTier(tier: PlanTier): Plan {
  return PLANS.find((p) => p.id === tier) || PLANS[0];
}

// ─── Stripe helpers ───────────────────────────────────────────────────────────

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  tier: PlanTier
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true&plan=${tier}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, tier },
    subscription_data: {
      metadata: { userId, tier },
    },
  });

  return session.url || "";
}

export async function createCustomerPortalSession(
  customerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return session.url;
}

export async function getSubscriptionStatus(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  return subscriptions.data[0] || null;
}
