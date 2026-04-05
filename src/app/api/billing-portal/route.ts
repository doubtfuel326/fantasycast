import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCustomerPortalSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Fetch stripeCustomerId from your DB using userId
  // const user = await db.user.findUnique({ where: { clerkId: userId } });
  // const customerId = user?.stripeCustomerId;

  // Placeholder — replace with real customer ID from DB
  const customerId = "cus_placeholder";

  try {
    const url = await createCustomerPortalSession(customerId);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
