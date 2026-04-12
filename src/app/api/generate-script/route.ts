export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildLeagueSnapshot } from "@/lib/sleeper";
import { generateEpisodeScript } from "@/lib/ai";
import type { ShowFormat, EpisodeType } from "@/types";

// In production you'd validate subscription limits from your DB here
const DEMO_LEAGUE_ID = "784123456789012345"; // Replace with a real Sleeper league ID for testing

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check subscription and episode limits
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("plan, status")
      .eq("user_id", userId)
      .single();

    if (!subscriber || subscriber.status !== "active") {
      return NextResponse.json({ error: "Active subscription required to generate episodes." }, { status: 403 });
    }

    const planLimits: Record<string, number> = {
      starter: 3,
      pro: 10,
      elite: 999999,
    };

    const weeklyLimit = planLimits[subscriber.plan] || 3;

    // Count episodes generated this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("episodes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("generated_at", weekStart.toISOString());

    if ((count || 0) >= weeklyLimit) {
      return NextResponse.json({
        error: `Weekly episode limit reached. Your ${subscriber.plan} plan includes ${weeklyLimit} episodes per week. Upgrade for more.`
      }, { status: 429 });
    }

    const body = await req.json();
    const {
      leagueId = DEMO_LEAGUE_ID,
      platform = "sleeper",
      format = "thewire" as ShowFormat,
      episodeType = "weekly_recap" as EpisodeType,
    } = body;

    // Validate format and type
    const validFormats = ["thewire", "debate", "podcast"];
    const validTypes = ["weekly_recap", "draft_recap", "preseason", "playoff", "legacy", "offseason", "championship"];
    if (!validFormats.includes(format) || !validTypes.includes(episodeType)) {
      return NextResponse.json({ error: "Invalid format or episode type" }, { status: 400 });
    }

    // TODO: In production:
    // 1. Look up user's connected league from your DB
    // 2. Check subscription tier + episode limit for this week
    // 3. Increment episode count after generation
    // 4. Save generated episode to DB
    // 5. Queue ElevenLabs audio generation as background job

    let snapshot;

    console.log("Platform received:", platform, "LeagueId:", leagueId);
    if (platform === "sleeper") {
      try {
        snapshot = await buildLeagueSnapshot(leagueId);
      } catch (e) {
        // If Sleeper API fails (e.g. invalid ID), use demo data
        snapshot = buildDemoSnapshot();
      }
    } else if (platform === "yahoo") {
      try {
        const { buildYahooSnapshot } = await import("@/lib/yahoo");
        snapshot = await buildYahooSnapshot(userId, leagueId);
      } catch (e: any) {
        return NextResponse.json(
          { error: e.message || "Failed to load Yahoo league." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "ESPN integration coming soon." },
        { status: 400 }
      );
    }

    // Fetch league settings for accurate episode data
    let leagueSettings = null;
    try {
      const { data: settings } = await supabase
        .from("league_settings")
        .select("*")
        .eq("user_id", userId)
        .eq("league_id", leagueId)
        .single();
      leagueSettings = settings;
    } catch {}

    // Generate the AI script
    const script = await generateEpisodeScript(snapshot, format, episodeType, leagueSettings);

    const episode = {
      id: `ep_${Date.now()}`,
      leagueId,
      userId,
      week: snapshot.currentWeek,
      season: snapshot.league.season,
      format,
      episodeType,
      title: script.title,
      teaser: script.teaser,
      script,
      generatedAt: new Date().toISOString(),
      plays: 0,
      // audioUrl: null — audio generation happens async via ElevenLabs
    };

console.log("About to save to Supabase...");
    // Save to Supabase database
    try {
      const { saveEpisode } = await import("@/lib/supabase");
      await saveEpisode({
        ...episode,
        leagueName: snapshot.league.leagueName,
      });
    } catch (err: any) {
      console.error("Failed to save to database:", err?.message || err);
    }

    return NextResponse.json(episode);
  } catch (error: any) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 }
    );
  }
}

// Demo snapshot for development/testing without a real league
function buildDemoSnapshot() {
  return {
    league: {
      id: "demo",
      platform: "sleeper" as const,
      leagueId: "demo",
      leagueName: "The Gridiron Throne",
      sport: "nfl" as const,
      season: "2024",
      totalTeams: 10,
      scoringType: "PPR",
      userId: "",
      connectedAt: new Date().toISOString(),
    },
    teams: [
      { teamId: "1", teamName: "Death By Committee", managerName: "Tyler", wins: 7, losses: 2, ties: 0, pointsFor: 1312.4, pointsAgainst: 1089.2, rank: 1, streak: "W3" },
      { teamId: "2", teamName: "Backfield Access", managerName: "Jess", wins: 6, losses: 3, ties: 0, pointsFor: 1287.2, pointsAgainst: 1134.8, rank: 2, streak: "W1" },
      { teamId: "3", teamName: "Team Chaos", managerName: "Marcus", wins: 5, losses: 4, ties: 0, pointsFor: 1341.6, pointsAgainst: 1298.4, rank: 3, streak: "L2" },
      { teamId: "4", teamName: "Davante's Inferno", managerName: "Sarah", wins: 5, losses: 4, ties: 0, pointsFor: 1198.8, pointsAgainst: 1167.6, rank: 4, streak: "W2" },
      { teamId: "5", teamName: "Kyle's Revenge Tour", managerName: "Kyle", wins: 4, losses: 5, ties: 0, pointsFor: 1256.1, pointsAgainst: 1344.2, rank: 5, streak: "L1" },
    ],
    currentWeek: 9,
    matchups: [
      {
        matchupId: "1",
        week: 9,
        team1: { teamId: "1", teamName: "Death By Committee", managerName: "Tyler", wins: 7, losses: 2, ties: 0, pointsFor: 1312.4, pointsAgainst: 1089.2, rank: 1, streak: "W3" },
        team2: { teamId: "5", teamName: "Kyle's Revenge Tour", managerName: "Kyle", wins: 4, losses: 5, ties: 0, pointsFor: 1256.1, pointsAgainst: 1344.2, rank: 5, streak: "L1" },
        team1Score: 231.2,
        team2Score: 218.4,
        winner: "Death By Committee",
        isPlayoff: false,
      },
      {
        matchupId: "2",
        week: 9,
        team1: { teamId: "2", teamName: "Backfield Access", managerName: "Jess", wins: 6, losses: 3, ties: 0, pointsFor: 1287.2, pointsAgainst: 1134.8, rank: 2, streak: "W1" },
        team2: { teamId: "3", teamName: "Team Chaos", managerName: "Marcus", wins: 5, losses: 4, ties: 0, pointsFor: 1341.6, pointsAgainst: 1298.4, rank: 3, streak: "L2" },
        team1Score: 142.6,
        team2Score: 138.2,
        winner: "Backfield Access",
        isPlayoff: false,
      },
    ],
    recentTrades: [
      {
        tradeId: "t1",
        week: 9,
        team1: "Backfield Access",
        team2: "Team Chaos",
        team1Received: ["WR1"],
        team2Received: ["RB2", "Pick"],
        processedAt: new Date().toISOString(),
      },
    ],
    topScorer: { teamId: "1", teamName: "Death By Committee", managerName: "Tyler", wins: 7, losses: 2, ties: 0, pointsFor: 1312.4, pointsAgainst: 1089.2, rank: 1, streak: "W3" },
    biggestUpset: undefined,
    highestScore: { team: "Death By Committee", score: 231.2, week: 9 },
    standings: [
      { teamId: "1", teamName: "Death By Committee", managerName: "Tyler", wins: 7, losses: 2, ties: 0, pointsFor: 1312.4, pointsAgainst: 1089.2, rank: 1, streak: "W3" },
      { teamId: "2", teamName: "Backfield Access", managerName: "Jess", wins: 6, losses: 3, ties: 0, pointsFor: 1287.2, pointsAgainst: 1134.8, rank: 2, streak: "W1" },
      { teamId: "3", teamName: "Team Chaos", managerName: "Marcus", wins: 5, losses: 4, ties: 0, pointsFor: 1341.6, pointsAgainst: 1298.4, rank: 3, streak: "L2" },
      { teamId: "4", teamName: "Davante's Inferno", managerName: "Sarah", wins: 5, losses: 4, ties: 0, pointsFor: 1198.8, pointsAgainst: 1167.6, rank: 4, streak: "W2" },
      { teamId: "5", teamName: "Kyle's Revenge Tour", managerName: "Kyle", wins: 4, losses: 5, ties: 0, pointsFor: 1256.1, pointsAgainst: 1344.2, rank: 5, streak: "L1" },
    ],
  };
}
