import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import type { PlanTier } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";

    const { tier } = await req.json() as { tier: PlanTier };

    const { TRIAL_PLAN } = await import("@/lib/stripe");
    const plan = tier === "trial" 
      ? { ...TRIAL_PLAN, leagues: 1, episodesPerWeek: 1, videoPerWeek: 1, highlighted: false } as any
      : PLANS.find((p) => p.id === tier);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!plan.priceId) {
      return NextResponse.json({ 
        error: `Missing price ID for ${tier} plan. Check STRIPE_PRICE_${tier.toUpperCase()} environment variable.` 
      }, { status: 500 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        error: "Missing STRIPE_SECRET_KEY environment variable." 
      }, { status: 500 });
    }

    const url = await createCheckoutSession(userId, email, plan.priceId, tier);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}