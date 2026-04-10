import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildYahooSnapshot } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");
  if (!leagueId) return NextResponse.json({ error: "Missing leagueId" }, { status: 400 });
  try {
    const snapshot = await buildYahooSnapshot(userId, leagueId);
    return NextResponse.json({ standings: snapshot.standings, league: snapshot.league });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
