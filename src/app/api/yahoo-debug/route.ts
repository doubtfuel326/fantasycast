import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { data } = await supabase.from("yahoo_tokens").select("access_token").eq("user_id", userId).single();
    if (!data) return NextResponse.json({ error: "No token" });
    const leagueKey = "449.l.130677";
    const res = await fetch(
      `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/standings?format=json`,
      { headers: { Authorization: `Bearer ${data.access_token}` } }
    );
    const json = await res.json();
    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
