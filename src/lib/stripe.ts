import Stripe from "stripe";
import type { Plan, PlanTier } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER || "",
    episodesPerWeek: 1,
    leagues: 1,
    features: [
      "1 episode per week",
      "1 fantasy league",
      "All 3 show formats",
      "All 6 episode types",
      "Sleeper integration",
      "Episode archive",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    priceId: process.env.STRIPE_PRICE_PRO || "",
    episodesPerWeek: 3,
    leagues: 3,
    features: [
      "3 episodes per week",
      "Up to 3 leagues",
      "All formats & episode types",
      "ESPN + Yahoo integration",
      "Audio download",
      "Episode archive",
      "Priority generation",
    ],
    highlighted: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: 39,
    priceId: process.env.STRIPE_PRICE_ELITE || "",
    episodesPerWeek: 7,
    leagues: 10,
    features: [
      "Daily episodes",
      "Up to 10 leagues",
      "All platforms",
      "Custom host names",
      "Shareable episode links",
      "Slack / Discord delivery",
      "API access",
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
