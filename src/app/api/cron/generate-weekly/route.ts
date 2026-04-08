import { NextRequest, NextResponse } from "next/server";
import { buildLeagueSnapshot } from "@/lib/sleeper";
import { generateEpisodeScript } from "@/lib/ai";

/**
 * Vercel Cron Job — runs every Tuesday at 10am UTC (after MNF ends)
 * Set in vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/generate-weekly", "schedule": "0 10 * * 2" }]
 * }
 *
 * Secured by CRON_SECRET environment variable.
 */
export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron, not an external request
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🕐 Weekly cron triggered:", new Date().toISOString());

  try {
    // TODO: Fetch all active subscriptions from your DB
    // const activeLeagues = await db.subscription.findMany({
    //   where: { status: "active" },
    //   include: { league: true },
    // });

    // Placeholder — in production this comes from your DB
    const activeLeagues: Array<{
      leagueId: string;
      userId: string;
      defaultFormat: "thewire" | "debate" | "podcast";
    }> = [];

    const results = [];

    for (const league of activeLeagues) {
      try {
        const snapshot = await buildLeagueSnapshot(league.leagueId);
        const script = await generateEpisodeScript(snapshot, league.defaultFormat, "weekly_recap");

        // TODO: Save episode to DB
        // await db.episode.create({
        //   data: {
        //     leagueId: league.leagueId,
        //     userId: league.userId,
        //     week: snapshot.currentWeek,
        //     season: snapshot.league.season,
        //     format: league.defaultFormat,
        //     episodeType: "weekly_recap",
        //     title: script.title,
        //     teaser: script.teaser,
        //     script: JSON.stringify(script),
        //     generatedAt: new Date(),
        //   },
        // });

        results.push({ leagueId: league.leagueId, success: true, title: script.title });
      } catch (err: any) {
        results.push({ leagueId: league.leagueId, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      generated: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
