import { NextRequest, NextResponse } from "next/server";
import { buildLeagueSnapshot } from "@/lib/sleeper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId") || "";
  const platform = searchParams.get("platform") || "sleeper";

  if (!leagueId) {
    return NextResponse.json({ error: "Missing leagueId" }, { status: 400 });
  }

  if (platform !== "sleeper") {
    return NextResponse.json(
      { error: "Only Sleeper is supported in v1" },
      { status: 400 }
    );
  }

  try {
    const snapshot = await buildLeagueSnapshot(leagueId);
    return NextResponse.json(snapshot);
  } catch (err: any) {
    console.error("League preview error:", err.message);
    return NextResponse.json(
      { error: "League not found. Make sure your Sleeper league ID is correct." },
      { status: 404 }
    );
  }
}
