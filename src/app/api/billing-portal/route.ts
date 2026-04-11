import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCustomerPortalSession } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data } = await supabase
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (!data?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found. Please subscribe first." }, { status: 404 });
    }

    const url = await createCustomerPortalSession(data.stripe_customer_id);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
