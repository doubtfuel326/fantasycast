import Stripe from "stripe";
import type { Plan, PlanTier } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: "league",
    name: "League",
    price: 39,
    priceId: process.env.STRIPE_PRICE_STARTER || "",
    episodesPerWeek: 3,
    videoPerWeek: 0,
    leagues: 1,
    features: [
      "3 audio episodes per week",
      "1 fantasy league",
      "All 3 show formats (The Wire, Debate, Podcast)",
      "All 11 episode types",
      "Sleeper + Yahoo Fantasy integration",
      "Shareable episode links",
      "Full NFL season access",
    ],
  },
  {
    id: "pro_league",
    name: "Pro League",
    price: 55,
    priceId: process.env.STRIPE_PRICE_PRO || "",
    episodesPerWeek: 5,
    videoPerWeek: 1,
    leagues: 1,
    highlighted: true,
    features: [
      "1 video episode per week",
      "5 audio episodes per week",
      "1 fantasy league",
      "Everything in League",
      "Full NFL season access",
    ],
  },
  {
    id: "elite_league",
    name: "Elite League",
    price: 99,
    priceId: process.env.STRIPE_PRICE_ELITE || "",
    episodesPerWeek: 999999,
    videoPerWeek: 4,
    leagues: 3,
    features: [
      "4 video episodes per week",
      "Unlimited audio episodes",
      "Up to 3 fantasy leagues",
      "Everything in Pro League",
      "Full NFL season access",
    ],
  },
  {
    id: "dynasty",
    name: "Dynasty",
    price: 199,
    priceId: process.env.STRIPE_PRICE_DYNASTY || "",
    episodesPerWeek: 999999,
    videoPerWeek: 999999,
    leagues: 10,
    features: [
      "Unlimited video episodes",
      "Unlimited audio episodes",
      "Up to 10 fantasy leagues",
      "Everything in Elite League",
      "Full NFL season access",
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
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true&plan=${tier}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, tier },
    payment_intent_data: {
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
