import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId") || "";
  const leagueName = searchParams.get("leagueName") || "";
  const platform = searchParams.get("platform") || "sleeper";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Get user plan
  const { data: sub } = await supabase
    .from("subscribers")
    .select("plan, status")
    .eq("user_id", userId)
    .single();

  if (!sub || sub.status !== "active") {
    return NextResponse.json({ error: "Active subscription required." }, { status: 403 });
  }

  const leagueLimits: Record<string, number> = { starter: 1, pro: 3, elite: 10 };
  const limit = leagueLimits[sub.plan] || 1;

  // Get connected leagues
  const { data: connected } = await supabase
    .from("connected_leagues")
    .select("league_id")
    .eq("user_id", userId);

  const connectedIds = connected?.map((l: any) => l.league_id) || [];

  // If already connected this league, allow switching
  if (connectedIds.includes(leagueId)) {
    return NextResponse.json({ ok: true });
  }

  // Check limit
  if (connectedIds.length >= limit) {
    return NextResponse.json({
      error: `Your ${sub.plan} plan allows ${limit} league${limit === 1 ? "" : "s"}. Upgrade to connect more.`
    }, { status: 403 });
  }

  // Save new connected league
  await supabase.from("connected_leagues").upsert({
    user_id: userId,
    league_id: leagueId,
    league_name: leagueName,
    platform,
  });

  return NextResponse.json({ ok: true });
}
